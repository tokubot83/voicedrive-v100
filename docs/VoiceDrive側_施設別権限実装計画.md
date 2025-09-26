# VoiceDrive 施設別権限レベル実装計画

## 実装概要

立神リハビリテーション温泉病院を含む複数施設対応のため、施設別権限マッピング機能を実装

## 実装タスク一覧

### 1. データモデル拡張（2日）

#### 1.1 施設マスタ定義
```typescript
// src/types/facility.types.ts
interface Facility {
  id: string;
  name: string;
  type: 'hospital' | 'rehabilitation' | 'care_facility';
  organizationLevel: 'large' | 'medium' | 'small';
  isActive: boolean;
}

// src/data/facilities.ts
export const FACILITIES = {
  kohara_hospital: {
    id: 'kohara_hospital',
    name: '小原病院',
    type: 'hospital',
    organizationLevel: 'large'
  },
  tategami_rehabilitation: {
    id: 'tategami_rehabilitation',
    name: '立神リハビリテーション温泉病院',
    type: 'rehabilitation',
    organizationLevel: 'medium'
  }
};
```

#### 1.2 権限マッピング定義
```typescript
// src/permissions/facilityPositionMapping.ts
interface FacilityPositionMapping {
  facilityId: string;
  positionMappings: Map<string, {
    baseLevel: number;
    displayName: string;
    department?: string;
  }>;
}
```

### 2. API連携層の拡張（3日）

#### 2.1 MedicalSystemAPIの拡張
```typescript
// src/services/MedicalSystemAPI.ts
class MedicalSystemAPI {
  // 既存メソッドを拡張
  async calculatePermissionLevel(
    staffId: string,
    facilityId?: string
  ): Promise<CalculateLevelResponse>;

  // 新規メソッド追加
  async getFacilityPositionMapping(
    facilityId: string
  ): Promise<FacilityPositionMapping>;
}
```

#### 2.2 Webhookハンドラー実装
```typescript
// src/services/MedicalSystemWebhook.ts
class MedicalSystemWebhookHandler {
  async handleStaffUpdate(payload: StaffUpdatePayload): Promise<void> {
    // 1. ペイロード検証
    // 2. 権限キャッシュ無効化
    // 3. 新権限取得
    // 4. ユーザーコンテキスト更新
  }
}
```

### 3. 権限管理サービス実装（2日）

#### 3.1 施設別権限サービス
```typescript
// src/services/FacilityPermissionService.ts
export class FacilityPermissionService {
  private mappingCache: Map<string, FacilityPositionMapping>;

  async getEffectivePermissionLevel(
    position: string,
    facilityId: string,
    experience?: number
  ): Promise<number>;

  async syncFacilityMappings(): Promise<void>;
}
```

#### 3.2 権限キャッシュ戦略
```typescript
// src/services/PermissionCacheService.ts
export class PermissionCacheService {
  private cache: Map<string, CachedPermission>;

  async invalidate(staffId: string): Promise<void>;
  async warmUp(facilityId: string): Promise<void>;
}
```

### 4. UI/UXの更新（1日）

#### 4.1 ログイン画面の施設選択
```typescript
// src/components/LoginForm.tsx
const LoginForm = () => {
  const [selectedFacility, setSelectedFacility] = useState<string>('');

  return (
    <Select
      value={selectedFacility}
      onChange={setSelectedFacility}
      options={FACILITIES}
    />
  );
};
```

#### 4.2 プロフィール画面での施設表示
```typescript
// src/components/UserProfile.tsx
const UserProfile = () => {
  const { user, facility } = useUserContext();

  return (
    <div>
      <h3>{facility.name}</h3>
      <p>{user.position} (レベル: {user.accountLevel})</p>
    </div>
  );
};
```

### 5. マイグレーション処理（1日）

#### 5.1 既存データの移行
```typescript
// src/migrations/addFacilityId.ts
async function migrateExistingUsers() {
  // 1. 既存ユーザーにデフォルト施設ID付与
  // 2. 権限レベル再計算
  // 3. 検証ログ出力
}
```

### 6. テスト実装（2日）

#### 6.1 単体テスト
- FacilityPermissionService
- MedicalSystemAPI拡張部分
- Webhookハンドラー

#### 6.2 統合テスト
- 施設切り替えフロー
- 権限同期フロー
- エラーハンドリング

## 実装スケジュール

| タスク | 開始日 | 完了予定日 | 担当 | ステータス |
|-------|--------|-----------|------|-----------|
| データモデル拡張 | 9/27(金) | 9/28(土) | - | 未着手 |
| API連携層拡張 | 9/30(月) | 10/2(水) | - | 未着手 |
| 権限管理サービス | 10/3(木) | 10/4(金) | - | 未着手 |
| UI/UX更新 | 10/5(土) | 10/5(土) | - | 未着手 |
| マイグレーション | 10/6(日) | 10/6(日) | - | 未着手 |
| テスト実装 | 10/7(月) | 10/8(火) | - | 未着手 |
| 本番デプロイ | 10/9(水) | - | - | 未着手 |

## 技術的考慮事項

### パフォーマンス最適化
1. 施設別マッピングは起動時に一括取得しキャッシュ
2. Webhook受信時は該当ユーザーのみキャッシュ更新
3. Redis導入検討（将来的）

### エラーハンドリング
1. 医療システムAPI不通時はローカルキャッシュを使用
2. Webhook失敗時は定期同期でカバー
3. 施設ID不整合時の警告表示

### セキュリティ
1. Webhook署名検証の実装
2. 施設間のデータアクセス制限
3. 権限昇格の監査ログ

## リスクと対策

| リスク | 影響度 | 対策 |
|--------|--------|------|
| API仕様変更 | 高 | 事前の詳細すり合わせ |
| データ不整合 | 高 | 検証ツールの実装 |
| パフォーマンス劣化 | 中 | キャッシュ戦略の最適化 |
| 施設追加時の対応遅れ | 低 | 汎用的な設計 |

## 次のアクション

1. **医療チームとの仕様確認会議**（9/30 10:00）
   - 立神の役職マッピング確認
   - API仕様の最終確認
   - Webhook仕様の詳細

2. **実装開始前の準備**
   - 開発環境の準備
   - テストデータの作成
   - CI/CDパイプラインの更新

3. **ステークホルダーへの連絡**
   - 実装スケジュールの共有
   - 影響範囲の説明
   - テスト協力依頼

## 成功指標

- [ ] 立神リハビリテーション温泉病院の全役職が正しくマッピング
- [ ] 施設切り替え時の権限更新が3秒以内
- [ ] Webhook受信から反映まで1秒以内
- [ ] 既存の小原病院ユーザーに影響なし
- [ ] エラー率0.1%以下

---

作成日：2025年9月26日
更新予定：仕様確認会議後