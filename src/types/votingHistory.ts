export type ChangeMode = 'agenda' | 'project' | 'both';
export type ChangeStatus = 'active' | 'reverted' | 'superseded';

export interface ChangeLog {
  id: string;
  date: string;
  mode: ChangeMode;
  modeLabel: string;
  category: string;
  user: string;
  userLevel: number;
  action: string;
  impact?: string;
  status: ChangeStatus;
}

export interface ChangeLogDetail extends ChangeLog {
  subcategory?: string;
  changeDescription: string;
  impactDescription?: string;
  beforeValue?: any;
  afterValue?: any;
  changedBy: {
    id: string;
    name: string;
    permissionLevel: number;
  };
  changedAt: string;
  relatedEntity?: {
    type: string;
    id: string;
  };
  metadata?: any;
}

export interface ChangeLogStatistics {
  totalCount: number;
  agendaModeCount: number;
  projectModeCount: number;
}

export interface ChangeLogListResponse {
  logs: ChangeLog[];
  statistics: ChangeLogStatistics;
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export interface ChangeLogQueryParams {
  mode?: 'all' | 'agenda' | 'project';
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  category?: string;
}
