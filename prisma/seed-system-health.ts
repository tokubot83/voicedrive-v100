import { PrismaClient } from '@prisma/client';
import os from 'os';

const prisma = new PrismaClient();

async function main() {
  console.log('🏥 Creating initial SystemHealth record...');

  // 簡易的なシステムヘルス記録
  const cpus = os.cpus();
  const cpuUsage = cpus.reduce((acc, cpu) => {
    const total = Object.values(cpu.times).reduce((a, b) => a + b);
    const idle = cpu.times.idle;
    return acc + ((total - idle) / total) * 100;
  }, 0) / cpus.length;

  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const memoryUsage = ((totalMemory - freeMemory) / totalMemory) * 100;

  const health = await prisma.systemHealth.create({
    data: {
      status: 'healthy',
      uptime: Math.floor(process.uptime()),
      serverStartedAt: new Date(Date.now() - process.uptime() * 1000),
      lastHealthCheck: new Date(),
      cpuUsage: Math.round(cpuUsage * 10) / 10,
      memoryUsage: Math.round(memoryUsage * 10) / 10,
      diskUsage: 38.5,
      apiResponseTime: 125.3,
      errorRate: 0,
      metadata: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
      },
    },
  });

  console.log(`✅ SystemHealth created: ${health.id}`);
  console.log(`   Status: ${health.status}`);
  console.log(`   Uptime: ${Math.floor(health.uptime / 86400)} days`);
  console.log(`   CPU Usage: ${health.cpuUsage}%`);
  console.log(`   Memory Usage: ${health.memoryUsage}%`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
