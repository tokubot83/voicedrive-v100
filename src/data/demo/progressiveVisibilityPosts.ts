// プログレッシブ可視性のデモデータ
export interface VotingPermissionExample {
  level: number;
  description: string;
  canVote: boolean;
  canView: boolean;
  canComment: boolean;
}

export interface AccessLevelDescription {
  level: number;
  title: string;
  description: string;
  examples: string[];
}

export const votingPermissionExamples: VotingPermissionExample[] = [
  {
    level: 1,
    description: '一般職員',
    canVote: true,
    canView: true,
    canComment: true
  },
  {
    level: 2,
    description: '主任・チーフ',
    canVote: true,
    canView: true,
    canComment: true
  },
  {
    level: 3,
    description: '係長・師長',
    canVote: true,
    canView: true,
    canComment: true
  },
  {
    level: 4,
    description: '課長・院長',
    canVote: true,
    canView: true,
    canComment: true
  }
];

export const accessLevelDescriptions: AccessLevelDescription[] = [
  {
    level: 1,
    title: '一般職員レベル',
    description: '日常業務に関する提案や意見交換',
    examples: [
      '休憩室の環境改善',
      '研修内容の提案',
      '業務手順の改善'
    ]
  },
  {
    level: 2,
    title: '主任・チーフレベル',
    description: '部署内の運営改善や人材育成',
    examples: [
      'シフト調整の改善',
      '新人教育プログラム',
      '部署内コミュニケーション'
    ]
  },
  {
    level: 3,
    title: '師長・係長レベル',
    description: '部署間連携や中期的な改善計画',
    examples: [
      '他部署との連携強化',
      '予算配分の検討',
      '設備投資の提案'
    ]
  },
  {
    level: 4,
    title: '課長・院長レベル',
    description: '施設全体の戦略的な方針決定',
    examples: [
      '組織体制の見直し',
      '長期戦略の策定',
      '重要投資の決定'
    ]
  }
];

export default { votingPermissionExamples, accessLevelDescriptions };