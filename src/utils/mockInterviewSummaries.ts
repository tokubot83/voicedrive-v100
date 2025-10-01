/**
 * 面談サマリのモックデータ
 * 医療システムチームから提供されたサンプルデータ
 */

import { InterviewSummary } from '../types/interviewSummary';

export const mockInterviewSummaries: InterviewSummary[] = [
  // サンプル1：定期面談のサマリ
  {
    summaryId: 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    interviewType: 'regular',
    interviewId: 'f1e2d3c4-b5a6-4950-8160-7a8b9c0d1e2f',
    staffId: 'EMP001',
    staffName: '山田 太郎',
    interviewDate: '2025-09-15',
    createdAt: '2025-09-20T14:30:00Z',
    createdBy: '人事部 佐藤',
    summary: `## 面談概要

2025年第3四半期の定期面談を実施しました。

## 業務状況

- 担当プロジェクトは順調に進行中
- チームメンバーとの連携も良好
- 業務量は適切な範囲内

## 今後の目標

- 新規プロジェクトへの参加を検討
- リーダーシップスキルの向上

## 人事部所感

安定したパフォーマンスを維持しています。次回は12月に定期面談を予定します。`,
    status: 'sent',
    sentAt: '2025-09-20T15:00:00Z'
  },

  // サンプル2：サポート面談のサマリ
  {
    summaryId: 'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e',
    interviewType: 'support',
    interviewId: 'g2f3e4d5-c6b7-4a50-9270-8b9c0d1e2f3a',
    staffId: 'EMP001',
    staffName: '山田 太郎',
    interviewDate: '2025-09-18',
    createdAt: '2025-09-19T10:15:00Z',
    createdBy: '人事部 田中',
    summary: `## 面談概要

職員からの相談依頼によりサポート面談を実施しました。

## 相談内容

- 業務負荷の増加に関する懸念
- ワークライフバランスについて

## 対応策

1. タスクの優先順位付けをサポート
2. チーム内での業務分担を再調整
3. 必要に応じて追加リソースを検討

## フォローアップ

2週間後に状況確認のため再度面談を設定しました。`,
    status: 'sent',
    sentAt: '2025-09-19T10:30:00Z'
  },

  // サンプル3：特別面談のサマリ
  {
    summaryId: 'c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f',
    interviewType: 'special',
    interviewId: 'h3g4f5e6-d7c8-4b60-0380-9c0d1e2f3a4b',
    staffId: 'EMP001',
    staffName: '山田 太郎',
    interviewDate: '2025-09-22',
    createdAt: '2025-09-22T16:45:00Z',
    createdBy: '人事部 佐藤',
    summary: `## 面談概要

緊急対応として特別面談を実施しました。

## 背景

部署異動に伴う環境変化への適応について

## 話し合った内容

- 新しい業務内容への理解度確認
- 必要なトレーニングの洗い出し
- メンターの配置

## 今後の対応

- 2週間のオンボーディング期間を設定
- 週次での進捗確認ミーティング
- 1ヶ月後に適応状況の評価面談を実施

## 人事部所感

前向きに取り組む姿勢が見られます。適切なサポート体制を維持します。`,
    status: 'sent',
    sentAt: '2025-09-22T17:00:00Z'
  },

  // 追加サンプル4：過去の定期面談
  {
    summaryId: 'd4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8a',
    interviewType: 'regular',
    interviewId: 'i4h5g6f7-e8d9-4c70-1490-0d1e2f3a4b5c',
    staffId: 'EMP001',
    staffName: '山田 太郎',
    interviewDate: '2025-06-15',
    createdAt: '2025-06-20T14:30:00Z',
    createdBy: '人事部 佐藤',
    summary: `## 面談概要

2025年第2四半期の定期面談を実施しました。

## 業務状況

- 新規プロジェクトへの適応が順調
- 技術スキルの向上が見られる
- チーム内での積極的な発言が増加

## 今後の目標

- 後輩指導の機会を増やす
- 専門分野の資格取得を目指す

## 人事部所感

着実な成長が確認できます。引き続きサポートします。`,
    status: 'sent',
    sentAt: '2025-06-20T15:00:00Z'
  }
];

/**
 * モックデータをローカルストレージに初期化
 */
export function initializeMockSummaries(): void {
  const storageKey = 'interviewSummaries';
  const existing = localStorage.getItem(storageKey);

  if (!existing) {
    localStorage.setItem(storageKey, JSON.stringify(mockInterviewSummaries));
    console.log('Mock interview summaries initialized');
  }
}

/**
 * モックデータをリセット
 */
export function resetMockSummaries(): void {
  const storageKey = 'interviewSummaries';
  localStorage.setItem(storageKey, JSON.stringify(mockInterviewSummaries));
  console.log('Mock interview summaries reset');
}
