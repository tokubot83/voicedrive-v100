import { useState, useEffect } from 'react';
import { fetchChangeLogList } from '@/services/votingHistoryService';
import type { ChangeLog, ChangeLogStatistics, ChangeLogQueryParams } from '@/types/votingHistory';

export function useVotingHistory(params: ChangeLogQueryParams = {}) {
  const [logs, setLogs] = useState<ChangeLog[]>([]);
  const [statistics, setStatistics] = useState<ChangeLogStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false,
  });

  useEffect(() => {
    async function loadLogs() {
      try {
        setLoading(true);
        setError(null);

        const data = await fetchChangeLogList({
          mode: params.mode || 'all',
          page: params.page || 1,
          limit: params.limit || 50,
          startDate: params.startDate,
          endDate: params.endDate,
          category: params.category,
        });

        setLogs(data.logs);
        setStatistics(data.statistics);
        setPagination(data.pagination);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    }

    loadLogs();
  }, [
    params.mode,
    params.page,
    params.limit,
    params.startDate,
    params.endDate,
    params.category,
  ]);

  return { logs, statistics, pagination, loading, error };
}
