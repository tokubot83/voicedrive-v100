// フリースペース投票システムの型定義
// Forward declaration to avoid circular dependency
export interface User {
  id: string;
  name: string;
  department: string;
  role?: string;
  avatar?: string;
  facility_id?: string;
  stakeholderCategory?: string;
  position?: string;
  expertise?: number;
  hierarchyLevel?: number;
  permissionLevel?: number;
  isRetired?: boolean;
  retirementDate?: Date;
  anonymizedId?: string;
  retirementProcessedBy?: string;
  retirementProcessedDate?: Date;
}

export interface PollOption {
  id: string;
  text: string;
  emoji?: string;
  votes: number;
}

export interface Poll {
  id: string;
  question: string;
  description?: string;
  options: PollOption[];
  totalVotes: number;
  deadline: Date;
  isActive: boolean;
  allowMultiple?: boolean; // 複数選択可能かどうか
  showResults: 'afterVote' | 'afterDeadline' | 'always'; // 結果表示タイミング
  category: 'idea_sharing' | 'casual_discussion' | 'event_planning';
  scope: 'team' | 'department' | 'facility' | 'organization';
  createdAt: Date;
  createdBy: User;
}

export interface PollVote {
  id: string;
  pollId: string;
  optionId: string;
  userId: string;
  timestamp: Date;
  isAnonymous: boolean;
}

export interface PollResult {
  pollId: string;
  option: PollOption;
  percentage: number;
  isWinner: boolean;
  voterCount: number;
}

// 投票の制限設定
export interface PollSettings {
  minOptions: number; // 最小選択肢数（デフォルト: 2）
  maxOptions: number; // 最大選択肢数（デフォルト: 4）
  minDuration: number; // 最小期間（分）（デフォルト: 30分）
  maxDuration: number; // 最大期間（分）（デフォルト: 7日）
  allowAnonymous: boolean; // 匿名投票許可
}

// 投票作成データ
export interface CreatePollData {
  question: string;
  description?: string;
  options: { text: string; emoji?: string }[];
  duration: number; // 分単位
  allowMultiple?: boolean;
  showResults: 'afterVote' | 'afterDeadline' | 'always';
  category: 'idea_sharing' | 'casual_discussion' | 'event_planning';
  scope: 'team' | 'department' | 'facility' | 'organization';
}