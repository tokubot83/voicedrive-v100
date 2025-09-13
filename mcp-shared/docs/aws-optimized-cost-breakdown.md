# AWS コスト最適化後の料金詳細（500名規模）

## 削減策適用後の月額費用

### Phase 1: 最初の3ヶ月（最小構成）
**月額: 約3.5万円**

```yaml
本番環境:
  EC2 (t3.small × 1): 2,200円
  RDS (db.t3.micro Single-AZ): 2,750円
  S3 (50GB): 165円
  その他: 3,850円
  小計: 8,965円

開発環境:
  なし（本番環境で兼用）

Vercel Pro: 2,200円

月額合計: 約11,165円
```

### Phase 2: 4ヶ月目以降（最適化適用）
**月額: 約4.2万円**

```yaml
本番環境（リザーブド適用）:
  EC2 (t3.medium × 2):
    通常: 13,200円
    リザーブド1年（-30%）: 9,240円
    
  RDS (db.t3.small Multi-AZ):
    通常: 11,000円
    リザーブド1年（-30%）: 7,700円
    
  ElastiCache (cache.t3.micro):
    通常: 2,200円
    リザーブド1年（-30%）: 1,540円
    
  S3 (200GB): 660円
  ALB: 3,850円
  CloudWatch: 2,200円
  WAF: 3,300円
  データ転送: 1,540円
  
  本番環境小計: 30,030円

開発環境（夜間・週末停止）:
  EC2 (t3.small × 1):
    通常24時間稼働: 2,200円
    平日9時間稼働のみ: 660円（-70%）
    
  RDS (db.t3.micro):
    通常24時間稼働: 2,750円
    平日9時間稼働のみ: 825円（-70%）
    
  開発環境小計: 1,485円

Vercel Pro: 2,200円

月額合計: 約33,715円
```

## 年間コスト比較

### 最適化なしの場合
```yaml
標準構成（最適化なし）:
  AWS: 月8万円 × 12ヶ月 = 96万円
  Vercel: 月2,200円 × 12ヶ月 = 2.6万円
  年間合計: 98.6万円
```

### 最適化ありの場合
```yaml
段階的導入＋最適化:
  Phase 1（1-3ヶ月）:
    月11,165円 × 3ヶ月 = 33,495円
    
  Phase 2（4-12ヶ月）:
    月33,715円 × 9ヶ月 = 303,435円
    
  年間合計: 336,930円（約33.7万円）
  
  削減率: 65.8%削減（64.9万円の節約）
```

## さらなる削減オプション

### 1. Savings Plans（2年目以降）
```yaml
Compute Savings Plans（1年、前払いなし）:
  追加削減: -20%
  月額: 33,715円 → 26,972円
```

### 2. スポットインスタンス（開発環境）
```yaml
開発環境をスポットに変更:
  追加削減: -50%
  開発環境: 1,485円 → 742円
```

### 3. S3 Intelligent-Tiering
```yaml
アクセス頻度に応じて自動階層化:
  削減効果: ストレージ費用-40%
  S3費用: 660円 → 396円
```

## 実装する自動化スクリプト

### 開発環境の自動停止/起動
```python
# Lambda関数（Python）
import boto3
import os

def lambda_handler(event, context):
    ec2 = boto3.client('ec2')
    rds = boto3.client('rds')
    
    action = event['action']  # 'start' or 'stop'
    
    # EC2インスタンス
    instance_ids = os.environ['DEV_INSTANCE_IDS'].split(',')
    if action == 'start':
        ec2.start_instances(InstanceIds=instance_ids)
    else:
        ec2.stop_instances(InstanceIds=instance_ids)
    
    # RDSインスタンス
    db_instance = os.environ['DEV_DB_INSTANCE']
    if action == 'start':
        rds.start_db_instance(DBInstanceIdentifier=db_instance)
    else:
        rds.stop_db_instance(DBInstanceIdentifier=db_instance)
    
    return {
        'statusCode': 200,
        'body': f'Development environment {action}ed successfully'
    }
```

### EventBridgeスケジュール設定
```yaml
平日起動:
  - cron: "0 0 * * MON-FRI"  # 日本時間9時
  - action: start

平日停止:
  - cron: "0 10 * * MON-FRI"  # 日本時間19時
  - action: stop

週末停止:
  - cron: "0 10 * * FRI"  # 金曜19時に停止
  - 月曜9時まで停止状態を維持
```

## 月次コスト推移シミュレーション

```
月額推移グラフ:
10万円 ┤
 9万円 ┤ ●━━━━━━━━━━━━━━━━━━━ (最適化なし)
 8万円 ┤
 7万円 ┤
 6万円 ┤
 5万円 ┤
 4万円 ┤         ●━━━━━━━━━━━━ (最適化あり Phase2)
 3万円 ┤
 2万円 ┤
 1万円 ┤ ●━━━●  (最適化あり Phase1)
 0万円 └─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬
        1 2 3 4 5 6 7 8 9 10 11 12月
```

## 最終的な推奨構成

### 500名規模での現実的な運用費用

**初年度（段階導入＋最適化）:**
- **月平均: 約2.8万円**
- **年間: 約33.7万円**

**2年目以降（フル最適化）:**
- **月額: 約2.7万円**
- **年間: 約32.4万円**

### 含まれるサービス
- ✅ 24時間稼働の本番環境
- ✅ 平日日中稼働の開発環境
- ✅ 自動バックアップ（7日分）
- ✅ 高可用性（Multi-AZ）
- ✅ WAFによるセキュリティ
- ✅ 監視・アラート
- ✅ Vercel Pro（フロントエンド）

### 削減効果まとめ
| 最適化策 | 削減率 | 年間削減額 |
|---------|--------|-----------|
| 段階的導入 | -20% | 約20万円 |
| リザーブドインスタンス | -30% | 約29万円 |
| 開発環境自動停止 | -70% | 約16万円 |
| **合計削減** | **-65.8%** | **約65万円** |