import { prisma } from '../lib/prisma';
import { SystemHealthService } from './SystemHealthService';

/**
 * システム運用サービス
 * system-operationsページで表示する統計情報を提供
 */
export class SystemOperationsService {
  private healthService: SystemHealthService;

  constructor() {
    this.healthService = new SystemHealthService();
  }

  /**
   * システム概要を取得
   */
  async getSystemOverview() {
    const [health, mode, totalUsers, activeUsers, todayLogs] = await Promise.all([
      this.getSystemHealth(),
      this.getCurrentMode(),
      this.getTotalUsers(),
      this.getActiveUsers(),
      this.getTodayLogsCount(),
    ]);

    return {
      status: health?.status || 'unknown',
      statusDisplay: this.formatStatus(health?.status),
      uptime: this.formatUptime(health?.uptime || 0),
      uptimeSeconds: health?.uptime || 0,
      totalUsers,
      activeUsers,
      currentMode: mode,
      currentModeDisplay: mode === 'PROJECT_MODE' ? 'プロジェクト' : '議題',
      serverStartedAt: health?.serverStartedAt,
      lastHealthCheck: health?.lastHealthCheck,
      metrics: {
        cpuUsage: health?.cpuUsage,
        memoryUsage: health?.memoryUsage,
        diskUsage: health?.diskUsage,
        apiResponseTime: health?.apiResponseTime,
        errorRate: health?.errorRate,
      },
    };
  }

  /**
   * 管理機能統計を取得
   */
  async getOperationsStats() {
    const [
      uptimePercentage,
      modeConfig,
      votingConfig,
      settingsCount,
      todayLogs,
      weekLogs,
      monthLogs,
      menuItems,
    ] = await Promise.all([
      this.getUptimePercentage(),
      this.getModeConfig(),
      this.getVotingConfig(),
      this.getSettingsCount(),
      this.getTodayLogsCount(),
      this.getWeekLogsCount(),
      this.getMonthLogsCount(),
      this.getMenuItemsStats(),
    ]);

    const totalUsers = await this.getTotalUsers();
    const activeUsers = await this.getActiveUsers();

    return {
      systemMonitor: {
        uptimePercentage,
        status: uptimePercentage > 99.5 ? 'healthy' : uptimePercentage > 99 ? 'warning' : 'critical',
      },
      modeSwitcher: {
        currentMode: modeConfig?.configValue?.mode || 'AGENDA_MODE',
        currentModeDisplay:
          modeConfig?.configValue?.mode === 'PROJECT_MODE' ? 'プロジェクトモード' : '議題モード',
        lastChangedAt: modeConfig?.updatedAt,
      },
      votingSettings: {
        lastUpdated: votingConfig?.updatedAt?.toLocaleDateString('ja-JP', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }),
        totalConfigs: votingConfig ? 1 : 0,
      },
      userManagement: {
        activeUsers,
        totalUsers,
        inactiveUsers: totalUsers - activeUsers,
      },
      systemSettings: {
        totalSettings: settingsCount,
        categories: await this.getSettingsByCategory(),
      },
      auditLogs: {
        todayCount: todayLogs,
        weekCount: weekLogs,
        monthCount: monthLogs,
      },
      sidebarMenuManagement: {
        totalMenuItems: menuItems.total,
        visibleItems: menuItems.visible,
        hiddenItems: menuItems.hidden,
      },
    };
  }

  private async getSystemHealth() {
    return await this.healthService.getLatestHealth();
  }

  private async getUptimePercentage(): Promise<number> {
    const uptime = await this.healthService.calculateUptime('month');
    return Math.round(uptime * 10) / 10;
  }

  private async getCurrentMode(): Promise<string> {
    const config = await prisma.systemConfig.findUnique({
      where: { configKey: 'system_mode' },
    });
    return (config?.configValue as any)?.mode || 'AGENDA_MODE';
  }

  private async getModeConfig() {
    return await prisma.systemConfig.findUnique({
      where: { configKey: 'system_mode' },
    });
  }

  private async getVotingConfig() {
    return await prisma.votingConfig.findFirst({
      orderBy: { updatedAt: 'desc' },
    });
  }

  private async getTotalUsers(): Promise<number> {
    return await prisma.user.count();
  }

  private async getActiveUsers(): Promise<number> {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    return await prisma.user.count({
      where: { lastLoginAt: { gte: oneMonthAgo } },
    });
  }

  private async getSettingsCount(): Promise<number> {
    return await prisma.systemConfig.count();
  }

  private async getSettingsByCategory() {
    const configs = await prisma.systemConfig.groupBy({
      by: ['category'],
      _count: { id: true },
    });

    return {
      system: configs.find((c) => c.category === 'system')?._count.id || 0,
      feature: configs.find((c) => c.category === 'feature')?._count.id || 0,
      ui: configs.find((c) => c.category === 'ui')?._count.id || 0,
    };
  }

  private async getTodayLogsCount(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return await prisma.auditLog.count({
      where: { createdAt: { gte: today } },
    });
  }

  private async getWeekLogsCount(): Promise<number> {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    return await prisma.auditLog.count({
      where: { createdAt: { gte: weekAgo } },
    });
  }

  private async getMonthLogsCount(): Promise<number> {
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    return await prisma.auditLog.count({
      where: { createdAt: { gte: monthAgo } },
    });
  }

  private async getMenuItemsStats() {
    const total = await prisma.menuConfig.count();
    const visible = await prisma.menuConfig.count({
      where: { isVisible: true },
    });

    return {
      total,
      visible,
      hidden: total - visible,
    };
  }

  private formatStatus(status?: string): string {
    switch (status) {
      case 'healthy':
        return '正常';
      case 'warning':
        return '警告';
      case 'critical':
        return '異常';
      default:
        return '不明';
    }
  }

  private formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    return `${days}日`;
  }
}

export const systemOperationsService = new SystemOperationsService();
