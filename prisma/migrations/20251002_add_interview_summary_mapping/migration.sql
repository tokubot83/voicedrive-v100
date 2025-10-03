-- 統合テスト用: InterviewResultとInterviewの紐付け調整
-- InterviewResultのrequestIdとInterviewのIDが直接紐づくようにInterviewIDを更新

-- 統合テストデータ用の紐付け
-- requestIdからinterview_プレフィックスを除いたものがInterviewのIDになるように設定
-- UPDATE Interview SET id = REPLACE(InterviewResult.requestId, 'interview_', '')
