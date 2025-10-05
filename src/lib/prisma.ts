// Prismaクライアントのシングルトンインスタンス
// ブラウザ環境では使用しない

// ブラウザ環境チェック
const isBrowser = typeof window !== 'undefined';

// ダミーのPrismaClient型定義（ブラウザ用）
type PrismaClient = any;

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// ブラウザ環境ではnullを返す
let prisma: PrismaClient | null = null;

if (!isBrowser) {
  // サーバーサイドでのみPrismaをインポート
  // 動的インポートを使用
  (async () => {
    try {
      const { PrismaClient } = await import('@prisma/client');
      prisma = global.prisma || new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      });

      if (process.env.NODE_ENV !== 'production') {
        global.prisma = prisma;
      }
    } catch (error) {
      console.error('Failed to import PrismaClient:', error);
    }
  })();
}

export { prisma };
export default prisma;