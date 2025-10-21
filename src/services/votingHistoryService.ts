import type { ChangeLogQueryParams, ChangeLogListResponse, ChangeLogDetail } from '@/types/votingHistory';

/**
 * 変更履歴一覧を取得
 */
export async function fetchChangeLogList(params: ChangeLogQueryParams): Promise<ChangeLogListResponse> {
  const queryString = new URLSearchParams(
    Object.entries(params).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null) {
        acc[key] = String(value);
      }
      return acc;
    }, {} as Record<string, string>)
  ).toString();

  const response = await fetch(`/api/voting-settings/change-logs?${queryString}`);

  if (!response.ok) {
    throw new Error('Failed to fetch change logs');
  }

  return await response.json();
}

/**
 * 変更履歴詳細を取得
 */
export async function fetchChangeLogDetail(logId: string): Promise<ChangeLogDetail> {
  const response = await fetch(`/api/voting-settings/change-logs/${logId}`);

  if (!response.ok) {
    throw new Error('Failed to fetch change log detail');
  }

  return await response.json();
}

/**
 * 変更履歴をエクスポート（CSV）
 */
export async function exportChangeLogs(params: {
  mode?: string;
  startDate?: string;
  endDate?: string;
}) {
  const queryString = new URLSearchParams(
    Object.entries(params).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null) {
        acc[key] = String(value);
      }
      return acc;
    }, {} as Record<string, string>)
  ).toString();

  const response = await fetch(`/api/voting-settings/change-logs/export?${queryString}`);

  if (!response.ok) {
    throw new Error('Failed to export change logs');
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `voting-history-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
