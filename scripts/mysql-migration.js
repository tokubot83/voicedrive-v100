// VoiceDrive SQLite to MySQL Migration Script
// 医療職員管理システムとの統合データベース移行

const { PrismaClient: SQLiteClient } = require('@prisma/client');
const { PrismaClient: MySQLClient } = require('@prisma/client');
const fs = require('fs').promises;
const path = require('path');

// 環境設定
const config = {
  sqlite: {
    url: process.env.SQLITE_DATABASE_URL || 'file:./prisma/dev.db'
  },
  mysql: {
    url: process.env.MYSQL_DATABASE_URL || 'mysql://voicedrive_app:password@localhost:3306/voicedrive_medical_integrated'
  },
  batchSize: 100,
  logFile: path.join(__dirname, '../logs/migration.log')
};

// ログ管理
class MigrationLogger {
  constructor(logFile) {
    this.logFile = logFile;
    this.logs = [];
  }

  async log(level, message, data = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      data
    };

    this.logs.push(logEntry);
    console.log(`[${timestamp}] [${level}] ${message}`, data);

    // ファイルへの非同期書き込み
    const logLine = JSON.stringify(logEntry) + '\n';
    await fs.appendFile(this.logFile, logLine).catch(console.error);
  }

  async info(message, data) {
    await this.log('INFO', message, data);
  }

  async error(message, data) {
    await this.log('ERROR', message, data);
  }

  async success(message, data) {
    await this.log('SUCCESS', message, data);
  }
}

// データ変換ヘルパー
class DataTransformer {
  // SQLiteのDateTime型をMySQL形式に変換
  static transformDateTime(value) {
    if (!value) return null;
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  }

  // SQLiteのBoolean型をMySQL形式に変換（0/1）
  static transformBoolean(value) {
    return value ? 1 : 0;
  }

  // JSON文字列の検証と変換
  static transformJson(value) {
    if (!value) return null;
    if (typeof value === 'string') {
      try {
        JSON.parse(value);
        return value;
      } catch (e) {
        return JSON.stringify({});
      }
    }
    return JSON.stringify(value);
  }

  // Float値の精度調整
  static transformDecimal(value, precision = 2) {
    if (value === null || value === undefined) return null;
    return parseFloat(value.toFixed(precision));
  }
}

// 移行マネージャー
class MigrationManager {
  constructor(logger) {
    this.logger = logger;
    this.sqliteClient = null;
    this.mysqlClient = null;
    this.stats = {
      totalRecords: 0,
      migratedRecords: 0,
      failedRecords: 0,
      tables: {}
    };
  }

  async initialize() {
    try {
      // SQLiteクライアント初期化
      this.sqliteClient = new SQLiteClient({
        datasources: {
          db: {
            url: config.sqlite.url
          }
        }
      });
      await this.sqliteClient.$connect();
      await this.logger.info('SQLite connection established');

      // MySQLクライアント初期化
      this.mysqlClient = new MySQLClient({
        datasources: {
          db: {
            url: config.mysql.url
          }
        }
      });
      await this.mysqlClient.$connect();
      await this.logger.info('MySQL connection established');

    } catch (error) {
      await this.logger.error('Database connection failed', { error: error.message });
      throw error;
    }
  }

  async migrateTable(tableName, transformFn) {
    const tableStats = {
      total: 0,
      migrated: 0,
      failed: 0,
      errors: []
    };

    try {
      await this.logger.info(`Starting migration for table: ${tableName}`);

      // SQLiteからデータ取得
      const records = await this.sqliteClient[tableName].findMany();
      tableStats.total = records.length;

      await this.logger.info(`Found ${records.length} records in ${tableName}`);

      // バッチ処理
      for (let i = 0; i < records.length; i += config.batchSize) {
        const batch = records.slice(i, i + config.batchSize);

        for (const record of batch) {
          try {
            // データ変換
            const transformedRecord = transformFn ? transformFn(record) : record;

            // MySQLへ挿入
            await this.mysqlClient[tableName].create({
              data: transformedRecord
            });

            tableStats.migrated++;
          } catch (error) {
            tableStats.failed++;
            tableStats.errors.push({
              recordId: record.id,
              error: error.message
            });
            await this.logger.error(`Failed to migrate record in ${tableName}`, {
              recordId: record.id,
              error: error.message
            });
          }
        }

        // 進捗ログ
        const progress = Math.round(((i + batch.length) / records.length) * 100);
        await this.logger.info(`${tableName} migration progress: ${progress}%`);
      }

      this.stats.tables[tableName] = tableStats;
      await this.logger.success(`Completed migration for ${tableName}`, tableStats);

    } catch (error) {
      await this.logger.error(`Table migration failed for ${tableName}`, { error: error.message });
      throw error;
    }
  }

  async migrateUsers() {
    await this.migrateTable('user', (record) => ({
      ...record,
      createdAt: DataTransformer.transformDateTime(record.createdAt),
      updatedAt: DataTransformer.transformDateTime(record.updatedAt),
      retirementDate: DataTransformer.transformDateTime(record.retirementDate),
      isRetired: DataTransformer.transformBoolean(record.isRetired),
      budgetApprovalLimit: DataTransformer.transformDecimal(record.budgetApprovalLimit, 2)
    }));
  }

  async migrateInterviews() {
    await this.migrateTable('interview', (record) => ({
      ...record,
      preferredDate: DataTransformer.transformDateTime(record.preferredDate),
      scheduledDate: DataTransformer.transformDateTime(record.scheduledDate),
      actualDate: DataTransformer.transformDateTime(record.actualDate),
      createdAt: DataTransformer.transformDateTime(record.createdAt),
      updatedAt: DataTransformer.transformDateTime(record.updatedAt),
      followUpRequired: DataTransformer.transformBoolean(record.followUpRequired)
    }));
  }

  async migrateEvaluations() {
    await this.migrateTable('evaluation', (record) => ({
      ...record,
      submittedAt: DataTransformer.transformDateTime(record.submittedAt),
      approvedAt: DataTransformer.transformDateTime(record.approvedAt),
      createdAt: DataTransformer.transformDateTime(record.createdAt),
      updatedAt: DataTransformer.transformDateTime(record.updatedAt)
    }));
  }

  async migrateEvaluationObjections() {
    await this.migrateTable('evaluationObjection', (record) => ({
      ...record,
      reviewStartedAt: DataTransformer.transformDateTime(record.reviewStartedAt),
      reviewCompletedAt: DataTransformer.transformDateTime(record.reviewCompletedAt),
      createdAt: DataTransformer.transformDateTime(record.createdAt),
      updatedAt: DataTransformer.transformDateTime(record.updatedAt),
      supportingDocs: DataTransformer.transformJson(record.supportingDocs)
    }));
  }

  async migrateSurveys() {
    await this.migrateTable('survey', (record) => ({
      ...record,
      startDate: DataTransformer.transformDateTime(record.startDate),
      endDate: DataTransformer.transformDateTime(record.endDate),
      deadline: DataTransformer.transformDateTime(record.deadline),
      createdAt: DataTransformer.transformDateTime(record.createdAt),
      updatedAt: DataTransformer.transformDateTime(record.updatedAt),
      isAnonymous: DataTransformer.transformBoolean(record.isAnonymous),
      isRequired: DataTransformer.transformBoolean(record.isRequired),
      questions: DataTransformer.transformJson(record.questions),
      targetDepartments: DataTransformer.transformJson(record.targetDepartments),
      targetRoles: DataTransformer.transformJson(record.targetRoles)
    }));
  }

  async migrateSurveyResponses() {
    await this.migrateTable('surveyResponse', (record) => ({
      ...record,
      submittedAt: DataTransformer.transformDateTime(record.submittedAt),
      isComplete: DataTransformer.transformBoolean(record.isComplete),
      answers: DataTransformer.transformJson(record.answers)
    }));
  }

  async migrateProjects() {
    await this.migrateTable('project', (record) => ({
      ...record,
      startDate: DataTransformer.transformDateTime(record.startDate),
      endDate: DataTransformer.transformDateTime(record.endDate),
      actualStartDate: DataTransformer.transformDateTime(record.actualStartDate),
      actualEndDate: DataTransformer.transformDateTime(record.actualEndDate),
      createdAt: DataTransformer.transformDateTime(record.createdAt),
      updatedAt: DataTransformer.transformDateTime(record.updatedAt),
      estimatedBudget: DataTransformer.transformDecimal(record.estimatedBudget, 2),
      actualBudget: DataTransformer.transformDecimal(record.actualBudget, 2),
      objectives: DataTransformer.transformJson(record.objectives),
      approvalHistory: DataTransformer.transformJson(record.approvalHistory),
      kpiMetrics: DataTransformer.transformJson(record.kpiMetrics)
    }));
  }

  async migrateProjectMembers() {
    await this.migrateTable('projectMember', (record) => ({
      ...record,
      joinedAt: DataTransformer.transformDateTime(record.joinedAt),
      leftAt: DataTransformer.transformDateTime(record.leftAt),
      isActive: DataTransformer.transformBoolean(record.isActive)
    }));
  }

  async migrateNotifications() {
    await this.migrateTable('notification', (record) => ({
      ...record,
      createdAt: DataTransformer.transformDateTime(record.createdAt),
      deliveredAt: DataTransformer.transformDateTime(record.deliveredAt),
      readAt: DataTransformer.transformDateTime(record.readAt),
      actionDeadline: DataTransformer.transformDateTime(record.actionDeadline),
      expiresAt: DataTransformer.transformDateTime(record.expiresAt),
      actionRequired: DataTransformer.transformBoolean(record.actionRequired)
    }));
  }

  async migrateFeedbacks() {
    await this.migrateTable('feedback', (record) => ({
      ...record,
      createdAt: DataTransformer.transformDateTime(record.createdAt),
      updatedAt: DataTransformer.transformDateTime(record.updatedAt),
      respondedAt: DataTransformer.transformDateTime(record.respondedAt),
      isAnonymous: DataTransformer.transformBoolean(record.isAnonymous),
      responseRequired: DataTransformer.transformBoolean(record.responseRequired)
    }));
  }

  async migrateUserAnalytics() {
    await this.migrateTable('userAnalytics', (record) => ({
      ...record,
      calculatedAt: DataTransformer.transformDateTime(record.calculatedAt),
      averageResponseTime: DataTransformer.transformDecimal(record.averageResponseTime, 2),
      taskCompletionRate: DataTransformer.transformDecimal(record.taskCompletionRate, 2),
      satisfactionScore: DataTransformer.transformDecimal(record.satisfactionScore, 2)
    }));
  }

  async verifyMigration() {
    await this.logger.info('Starting migration verification');

    const verificationResults = {};
    const tables = [
      'user', 'interview', 'evaluation', 'evaluationObjection',
      'survey', 'surveyResponse', 'project', 'projectMember',
      'notification', 'feedback', 'userAnalytics'
    ];

    for (const table of tables) {
      const sqliteCount = await this.sqliteClient[table].count();
      const mysqlCount = await this.mysqlClient[table].count();

      verificationResults[table] = {
        sqlite: sqliteCount,
        mysql: mysqlCount,
        match: sqliteCount === mysqlCount
      };

      if (!verificationResults[table].match) {
        await this.logger.error(`Record count mismatch in ${table}`, verificationResults[table]);
      }
    }

    await this.logger.info('Migration verification completed', verificationResults);
    return verificationResults;
  }

  async cleanup() {
    if (this.sqliteClient) {
      await this.sqliteClient.$disconnect();
    }
    if (this.mysqlClient) {
      await this.mysqlClient.$disconnect();
    }
    await this.logger.info('Database connections closed');
  }

  async executeMigration() {
    try {
      await this.initialize();

      // 移行順序（外部キー依存関係を考慮）
      await this.migrateUsers();
      await this.migrateInterviews();
      await this.migrateEvaluations();
      await this.migrateEvaluationObjections();
      await this.migrateSurveys();
      await this.migrateSurveyResponses();
      await this.migrateProjects();
      await this.migrateProjectMembers();
      await this.migrateNotifications();
      await this.migrateFeedbacks();
      await this.migrateUserAnalytics();

      // 検証
      const verificationResults = await this.verifyMigration();

      // 統計出力
      await this.logger.success('Migration completed successfully', {
        stats: this.stats,
        verification: verificationResults
      });

    } catch (error) {
      await this.logger.error('Migration failed', { error: error.message });
      throw error;
    } finally {
      await this.cleanup();
    }
  }
}

// メイン実行
async function main() {
  const logger = new MigrationLogger(config.logFile);
  const manager = new MigrationManager(logger);

  console.log('========================================');
  console.log('VoiceDrive SQLite to MySQL Migration');
  console.log('========================================');
  console.log(`Source: ${config.sqlite.url}`);
  console.log(`Target: ${config.mysql.url}`);
  console.log('========================================\n');

  try {
    await manager.executeMigration();
    console.log('\n✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// スクリプト実行
if (require.main === module) {
  main();
}

module.exports = {
  MigrationManager,
  DataTransformer,
  MigrationLogger
};