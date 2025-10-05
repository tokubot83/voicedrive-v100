// Safe Prisma Client Wrapper for Vercel
// Vercelのような静的ホスティング環境でのエラーを防ぐラッパー

import type { PrismaClient } from '@prisma/client';

let prismaInstance: PrismaClient | null = null;

// Vercel環境かどうかをチェック
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV !== undefined;
const isProduction = process.env.NODE_ENV === 'production';

// Prismaクライアントを安全に取得
export const getPrismaClient = async (): Promise<PrismaClient | null> => {
  // Vercel環境やプロダクションではnullを返す
  if (isVercel || isProduction) {
    console.warn('Prisma Client is not available in Vercel/production environment');
    return null;
  }

  // 開発環境でのみPrismaクライアントを生成
  if (!prismaInstance && typeof window === 'undefined') {
    try {
      const { PrismaClient } = await import('@prisma/client');
      prismaInstance = new PrismaClient({
        log: ['error', 'warn']
      });
    } catch (error) {
      console.error('Failed to initialize Prisma Client:', error);
      return null;
    }
  }

  return prismaInstance;
};

// クリーンアップ関数
export const disconnectPrisma = async (): Promise<void> => {
  if (prismaInstance) {
    await prismaInstance.$disconnect();
    prismaInstance = null;
  }
};