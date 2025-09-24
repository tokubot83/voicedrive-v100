/**
 * MySQL接続設定
 * 医療法人厚生会システムとの統合用
 * @version 1.0.0
 * @date 2025-09-25
 */

import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

// ==================== MySQL接続設定 ====================

export const mysqlConfig = {
  // プライマリ接続（読み書き）
  primary: {
    host: process.env.DB_HOST || 'mysql-primary.medical-system.kosei-kai.jp',
    port: parseInt(process.env.DB_PORT || '3306'),
    database: process.env.DB_NAME || 'compliance_production',
    user: process.env.DB_USER || 'voicedrive_prod',
    password: process.env.DB_PASSWORD || '',

    // SSL設定
    ssl: process.env.NODE_ENV === 'production' ? {
      ca: fs.readFileSync(process.env.DB_SSL_CERT || '/secure/certs/mysql-ca.crt'),
      rejectUnauthorized: true
    } : undefined,

    // 文字セット設定
    charset: process.env.DB_CHARSET || 'utf8mb4',

    // 接続プール設定
    connectionLimit: parseInt(process.env.DB_POOL_MAX || '10'),
    waitForConnections: true,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,

    // タイムアウト設定
    connectTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '2000'),
    timeout: 30000,

    // その他の設定
    timezone: '+09:00',  // 日本時間
    dateStrings: false,
    typeCast: true,
    bigNumberStrings: false,
    supportBigNumbers: true,
    decimalNumbers: true
  },

  // レプリカ接続（読み取り専用）
  replica: {
    host: process.env.DB_REPLICA_HOST || 'mysql-replica.medical-system.kosei-kai.jp',
    port: parseInt(process.env.DB_REPLICA_PORT || '3306'),
    database: process.env.DB_NAME || 'compliance_production',
    user: process.env.DB_USER || 'voicedrive_prod',
    password: process.env.DB_PASSWORD || '',

    // SSL設定
    ssl: process.env.NODE_ENV === 'production' ? {
      ca: fs.readFileSync(process.env.DB_SSL_CERT || '/secure/certs/mysql-ca.crt'),
      rejectUnauthorized: true
    } : undefined,

    // 文字セット設定
    charset: process.env.DB_CHARSET || 'utf8mb4',

    // 接続プール設定
    connectionLimit: parseInt(process.env.DB_POOL_MAX || '10'),
    waitForConnections: true,
    queueLimit: 0,

    // タイムアウト設定
    connectTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '2000'),
    timeout: 30000,

    // その他の設定
    timezone: '+09:00',
    dateStrings: false,
    typeCast: true,
    bigNumberStrings: false,
    supportBigNumbers: true,
    decimalNumbers: true
  }
};

// ==================== 接続プール管理 ====================

class MySQLConnectionManager {
  private primaryPool: mysql.Pool | null = null;
  private replicaPool: mysql.Pool | null = null;

  /**
   * プライマリプールの取得（読み書き）
   */
  async getPrimaryPool(): Promise<mysql.Pool> {
    if (!this.primaryPool) {
      this.primaryPool = mysql.createPool(mysqlConfig.primary);

      // 接続テスト
      try {
        const connection = await this.primaryPool.getConnection();
        await connection.ping();
        connection.release();
        console.log('MySQL primary connection established');
      } catch (error) {
        console.error('MySQL primary connection failed:', error);
        throw error;
      }
    }
    return this.primaryPool;
  }

  /**
   * レプリカプールの取得（読み取り専用）
   */
  async getReplicaPool(): Promise<mysql.Pool> {
    if (!this.replicaPool) {
      this.replicaPool = mysql.createPool(mysqlConfig.replica);

      // 接続テスト
      try {
        const connection = await this.replicaPool.getConnection();
        await connection.ping();
        connection.release();
        console.log('MySQL replica connection established');
      } catch (error) {
        console.error('MySQL replica connection failed:', error);
        // レプリカ接続失敗時はプライマリにフォールバック
        console.log('Falling back to primary connection');
        return this.getPrimaryPool();
      }
    }
    return this.replicaPool;
  }

  /**
   * 読み取りクエリ実行（レプリカ使用）
   */
  async executeQuery<T = any>(sql: string, params?: any[]): Promise<T[]> {
    const pool = await this.getReplicaPool();
    const [rows] = await pool.execute(sql, params);
    return rows as T[];
  }

  /**
   * 書き込みクエリ実行（プライマリ使用）
   */
  async executeUpdate(sql: string, params?: any[]): Promise<mysql.ResultSetHeader> {
    const pool = await this.getPrimaryPool();
    const [result] = await pool.execute(sql, params);
    return result as mysql.ResultSetHeader;
  }

  /**
   * トランザクション実行
   */
  async executeTransaction<T>(
    callback: (connection: mysql.PoolConnection) => Promise<T>
  ): Promise<T> {
    const pool = await this.getPrimaryPool();
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * 接続プールの終了
   */
  async close(): Promise<void> {
    const promises: Promise<void>[] = [];

    if (this.primaryPool) {
      promises.push(this.primaryPool.end());
      this.primaryPool = null;
    }

    if (this.replicaPool) {
      promises.push(this.replicaPool.end());
      this.replicaPool = null;
    }

    await Promise.all(promises);
    console.log('MySQL connections closed');
  }

  /**
   * ヘルスチェック
   */
  async healthCheck(): Promise<{
    primary: boolean;
    replica: boolean;
    latency: { primary: number; replica: number };
  }> {
    const result = {
      primary: false,
      replica: false,
      latency: { primary: 0, replica: 0 }
    };

    // プライマリチェック
    try {
      const pool = await this.getPrimaryPool();
      const start = Date.now();
      const connection = await pool.getConnection();
      await connection.ping();
      connection.release();
      result.primary = true;
      result.latency.primary = Date.now() - start;
    } catch (error) {
      console.error('Primary health check failed:', error);
    }

    // レプリカチェック
    try {
      const pool = await this.getReplicaPool();
      const start = Date.now();
      const connection = await pool.getConnection();
      await connection.ping();
      connection.release();
      result.replica = true;
      result.latency.replica = Date.now() - start;
    } catch (error) {
      console.error('Replica health check failed:', error);
    }

    return result;
  }
}

// ==================== シングルトンインスタンス ====================

export const mysqlManager = new MySQLConnectionManager();

// ==================== ヘルパー関数 ====================

/**
 * SQLエスケープヘルパー
 */
export const escapeId = (identifier: string): string => {
  return mysql.escapeId(identifier);
};

export const escape = (value: any): string => {
  return mysql.escape(value);
};

/**
 * バルクインサート用ヘルパー
 */
export const prepareBulkInsert = (
  table: string,
  columns: string[],
  values: any[][]
): { sql: string; params: any[] } => {
  const escapedTable = escapeId(table);
  const escapedColumns = columns.map(col => escapeId(col)).join(', ');
  const placeholders = values
    .map(() => `(${columns.map(() => '?').join(', ')})`)
    .join(', ');

  const sql = `INSERT INTO ${escapedTable} (${escapedColumns}) VALUES ${placeholders}`;
  const params = values.flat();

  return { sql, params };
};

// ==================== 接続終了時のクリーンアップ ====================

process.on('SIGINT', async () => {
  console.log('Closing MySQL connections...');
  await mysqlManager.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Closing MySQL connections...');
  await mysqlManager.close();
  process.exit(0);
});

export default mysqlManager;