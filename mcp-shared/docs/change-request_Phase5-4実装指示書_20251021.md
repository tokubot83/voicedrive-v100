# Phase 5-4 実装指示書 - キャリアコース変更申請機能

**文書番号**: MED-IMPL-2025-1021-004
**作成日**: 2025年10月21日
**最終更新**: 2025年10月21日
**実装期間**: 2025年10月28日（月）～ 11月8日（金）
**実装担当**: 医療システムチーム

---

## 📋 目次

1. [実装概要](#1-実装概要)
2. [Phase 5-4a: DB構築](#2-phase-5-4a-db構築)
3. [Phase 5-4b: API実装](#3-phase-5-4b-api実装)
4. [Phase 5-4c: ファイルストレージ統合](#4-phase-5-4c-ファイルストレージ統合)
5. [Phase 5-4d: 統合テスト](#5-phase-5-4d-統合テスト)
6. [トラブルシューティング](#6-トラブルシューティング)

---

## 1. 実装概要

### 1.1 目的

VoiceDrive側の「キャリアコース変更申請ページ」で使用するバックエンドAPI・DB機能を実装します。

### 1.2 前提条件

#### 環境

- Node.js: v18以上
- TypeScript: v5以上
- Prisma: v5以上
- Supabase: アカウント作成済み

#### 確認事項

- [ ] 共通DB接続情報を取得済み
- [ ] Supabase プロジェクト作成済み
- [ ] `.env.production` 設定済み
- [ ] VoiceDriveチームとのスケジュール調整完了

### 1.3 全体スケジュール

| フェーズ | 期間 | 完了予定日 | 工数 |
|---------|------|-----------|------|
| Phase 5-4a: DB構築 | 10/28-10/29 | 10/29（火）17:00 | 2日 |
| Phase 5-4b: API実装 | 10/30-11/1 | 11/1（金）17:00 | 3日 |
| Phase 5-4c: ファイル処理 | 11/4-11/5 | 11/5（火）17:00 | 2日 |
| Phase 5-4d: 統合テスト | 11/6-11/8 | 11/8（金）17:00 | 3日 |
| **合計** | - | - | **10日** |

---

## 2. Phase 5-4a: DB構築

**期間**: 10/28（月）～ 10/29（火）
**完了予定**: 10/29（火）17:00

### 2.1 Day 1（10/28月）: schema.prisma更新

#### 作業-1: モデル定義追加

**ファイル**: `prisma/schema.prisma`

```prisma
// ============================================
// キャリアコース変更申請システム
// ============================================

// コース定義マスタ
model CareerCourseDefinition {
  id                          String  @id @default(cuid())
  courseCode                  String  @unique // 'A', 'B', 'C', 'D'
  courseName                  String
  description                 String?
  departmentTransferAvailable Boolean @default(true)
  facilityTransferAvailable   String  @default("none") // 'none', 'limited', 'full'
  relocationRequired          Boolean @default(false)
  nightShiftAvailable         String  @default("none") // 'none', 'selectable', 'required'
  managementTrack             Boolean @default(false)
  baseSalaryMultiplier        Float   @default(1.0)
  salaryGrade                 Int?
  salaryNotes                 String?
  isActive                    Boolean @default(true)
  displayOrder                Int     @default(0)
  createdAt                   DateTime @default(now())
  updatedAt                   DateTime @updatedAt

  // Relations
  selections                  StaffCareerCourse[]
  requestsAsCurrent           CareerCourseChangeRequest[] @relation("CurrentCourse")
  requestsAsRequested         CareerCourseChangeRequest[] @relation("RequestedCourse")

  @@index([courseCode])
  @@index([isActive])
  @@map("course_definitions")
}

// 職員のコース選択状況
model StaffCareerCourse {
  id                       String   @id @default(cuid())
  employeeId               String   @map("employee_id")
  courseCode               String   @map("course_code")
  effectiveFrom            DateTime @map("effective_from")
  effectiveTo              DateTime? @map("effective_to")
  nextChangeAvailableDate  DateTime? @map("next_change_available_date")
  specialChangeReason      String?  @map("special_change_reason") // 'pregnancy', 'caregiving', 'illness'
  approvedBy               String?  @map("approved_by")
  approvedAt               DateTime? @map("approved_at")
  createdAt                DateTime @default(now()) @map("created_at")
  updatedAt                DateTime @updatedAt @map("updated_at")

  // Relations
  employee       Employee                 @relation(fields: [employeeId], references: [id])
  courseDefinition CareerCourseDefinition @relation(fields: [courseCode], references: [courseCode])
  approver       Employee?                @relation("CourseApprover", fields: [approvedBy], references: [id])

  @@index([employeeId, effectiveTo])
  @@index([courseCode])
  @@map("staff_career_courses")
}

// コース変更申請
model CareerCourseChangeRequest {
  id                      String   @id @default(cuid())
  employeeId              String   @map("employee_id")
  currentCourseCode       String   @map("current_course_code")
  requestedCourseCode     String   @map("requested_course_code")
  changeReason            String   @map("change_reason") // 'annual', 'special_pregnancy', 'special_caregiving', 'special_illness'
  reasonDetail            String   @map("reason_detail") @db.Text
  requestedEffectiveDate  DateTime @map("requested_effective_date")
  hrReviewerId            String?  @map("hr_reviewer_id")
  reviewedAt              DateTime? @map("reviewed_at")
  reviewComment           String?  @map("review_comment") @db.Text
  approvalStatus          String   @default("pending") @map("approval_status") // 'pending', 'approved', 'rejected', 'withdrawn'
  attachmentUrls          Json?    @map("attachment_urls") // ファイルURL配列
  createdAt               DateTime @default(now()) @map("created_at")
  updatedAt               DateTime @updatedAt @map("updated_at")

  // Relations
  employee          Employee                 @relation(fields: [employeeId], references: [id])
  currentCourse     CareerCourseDefinition   @relation("CurrentCourse", fields: [currentCourseCode], references: [courseCode])
  requestedCourse   CareerCourseDefinition   @relation("RequestedCourse", fields: [requestedCourseCode], references: [courseCode])
  hrReviewer        Employee?                @relation("HRReviewer", fields: [hrReviewerId], references: [id])

  @@index([employeeId])
  @@index([approvalStatus])
  @@index([createdAt(sort: Desc)])
  @@map("course_change_requests")
}
```

#### 作業-2: Employeeモデルへのリレーション追加

```prisma
model Employee {
  // ... 既存フィールド

  // キャリアコース関連（追加）
  careerCourseSelections     StaffCareerCourse[]
  careerCourseApprovals      StaffCareerCourse[]          @relation("CourseApprover")
  careerCourseChangeRequests CareerCourseChangeRequest[]
  careerCourseHRReviews      CareerCourseChangeRequest[]  @relation("HRReviewer")
}
```

#### チェックリスト

- [ ] schema.prismaに3モデル追加完了
- [ ] Employeeモデルにリレーション追加完了
- [ ] `npx prisma format` 実行
- [ ] 構文エラーなし

### 2.2 Day 2（10/29火）: マイグレーション実行

#### 作業-1: マイグレーション作成

```bash
# マイグレーション作成
npx prisma migrate dev --name add_career_course_tables

# 期待される出力:
# ✔ Generated Prisma Client
# ✔ The following migration(s) have been created and applied:
# migrations/
#   └─ 20251029000000_add_career_course_tables/
#       └─ migration.sql
```

#### 作業-2: マイグレーション確認

```bash
# マイグレーションファイル確認
cat prisma/migrations/20251029000000_add_career_course_tables/migration.sql

# 期待される内容:
# CREATE TABLE `course_definitions` (...)
# CREATE TABLE `staff_career_courses` (...)
# CREATE TABLE `course_change_requests` (...)
```

#### 作業-3: 初期データ投入スクリプト作成

**ファイル**: `scripts/seed-career-courses.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding career course data...');

  // A/B/C/D 4コース定義投入
  const courses = await prisma.careerCourseDefinition.createMany({
    data: [
      {
        courseCode: 'A',
        courseName: 'Aコース（全面協力型）',
        description: '部署・施設間異動に全面協力。管理職候補。基本給×1.2',
        departmentTransferAvailable: true,
        facilityTransferAvailable: 'full',
        relocationRequired: true,
        nightShiftAvailable: 'required',
        managementTrack: true,
        baseSalaryMultiplier: 1.2,
        salaryGrade: 5,
        salaryNotes: '基本給1.2倍、役職手当別途',
        isActive: true,
        displayOrder: 1,
      },
      {
        courseCode: 'B',
        courseName: 'Bコース（施設内協力型）',
        description: '施設内の部署異動に対応。管理職候補。基本給×1.1',
        departmentTransferAvailable: true,
        facilityTransferAvailable: 'none',
        relocationRequired: false,
        nightShiftAvailable: 'required',
        managementTrack: true,
        baseSalaryMultiplier: 1.1,
        salaryGrade: 4,
        salaryNotes: '基本給1.1倍、役職手当別途',
        isActive: true,
        displayOrder: 2,
      },
      {
        courseCode: 'C',
        courseName: 'Cコース（専門職型）',
        description: '異動なし。専門性重視。基本給×1.0',
        departmentTransferAvailable: false,
        facilityTransferAvailable: 'none',
        relocationRequired: false,
        nightShiftAvailable: 'selectable',
        managementTrack: false,
        baseSalaryMultiplier: 1.0,
        salaryGrade: 3,
        salaryNotes: '標準基本給',
        isActive: true,
        displayOrder: 3,
      },
      {
        courseCode: 'D',
        courseName: 'Dコース（時短・制約あり型）',
        description: '育児・介護等の制約に配慮。基本給×0.9',
        departmentTransferAvailable: false,
        facilityTransferAvailable: 'none',
        relocationRequired: false,
        nightShiftAvailable: 'none',
        managementTrack: false,
        baseSalaryMultiplier: 0.9,
        salaryGrade: 2,
        salaryNotes: '時短勤務対応',
        isActive: true,
        displayOrder: 4,
      },
    ],
  });

  console.log(`✅ Created ${courses.count} career courses`);

  // サンプル職員のコース選択データ投入（オプション）
  // const sampleSelection = await prisma.staffCareerCourse.create({...});

  console.log('🌱 Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

#### 作業-4: 初期データ投入実行

```bash
# スクリプト実行
npx tsx scripts/seed-career-courses.ts

# 期待される出力:
# 🌱 Seeding career course data...
# ✅ Created 4 career courses
# 🌱 Seeding completed!
```

#### チェックリスト

- [ ] マイグレーション実行完了
- [ ] 3テーブル作成確認（MySQL確認）
- [ ] 初期データ投入スクリプト作成
- [ ] A/B/C/D 4コース投入完了
- [ ] `SELECT * FROM course_definitions;` で4件確認

### 2.3 Phase 5-4a 完了基準

- [ ] 3テーブル作成完了
- [ ] A/B/C/D 4コース定義投入完了
- [ ] マイグレーション成功
- [ ] Prisma Clientコード生成完了

**完了予定**: 10/29（火）17:00

---

## 3. Phase 5-4b: API実装

**期間**: 10/30（水）～ 11/1（金）
**完了予定**: 11/1（金）17:00

### 3.1 Day 1（10/30水）: 認証ミドルウェア実装

#### 作業-1: Supabase JWT検証ミドルウェア

**ファイル**: `src/middleware/auth.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function verifySupabaseToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid authorization header');
  }

  const token = authHeader.substring(7);

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    throw new Error('Invalid or expired token');
  }

  return user;
}

export async function getEmployeeIdFromUser(userId: string) {
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();

  try {
    const systemAccount = await prisma.systemAccount.findUnique({
      where: {
        systemName_accountId: {
          systemName: 'voicedrive',
          accountId: userId,
        },
      },
    });

    if (!systemAccount) {
      throw new Error('Employee not found for user');
    }

    return systemAccount.employeeId;
  } finally {
    await prisma.$disconnect();
  }
}
```

#### 作業-2: 環境変数設定

```env
# .env.production
SUPABASE_URL=https://[project-id].supabase.co
SUPABASE_ANON_KEY=[anon-key]
SUPABASE_SERVICE_ROLE_KEY=[service-role-key]
```

#### チェックリスト

- [ ] 認証ミドルウェア実装完了
- [ ] 環境変数設定完了
- [ ] `verifySupabaseToken` 動作確認

### 3.2 Day 2（10/31木）: API実装（1/2）

#### API-1: コース定義一覧取得

**ファイル**: `src/app/api/career-courses/definitions/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const courses = await prisma.careerCourseDefinition.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.error('Error fetching career courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch career courses' },
      { status: 500 }
    );
  }
}
```

#### API-2: マイページ情報取得（careerCourse追加）

**ファイル**: `src/app/api/my-page/route.ts`（既存ファイル修正）

```typescript
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifySupabaseToken, getEmployeeIdFromUser } from '@/middleware/auth';

export async function GET(request: NextRequest) {
  try {
    // 認証
    const user = await verifySupabaseToken(request);
    const employeeId = await getEmployeeIdFromUser(user.id);

    // 職員情報取得
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        department: true,
        position: true,
        facility: true,
      },
    });

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    // 現在のコース取得
    const currentCourse = await prisma.staffCareerCourse.findFirst({
      where: {
        employeeId: employee.id,
        effectiveTo: null, // 現在有効なコース
      },
      include: {
        courseDefinition: true,
      },
    });

    return NextResponse.json({
      id: employee.id,
      name: employee.name,
      position: employee.position.name,
      department: employee.department.name,
      facility: employee.facility.name,
      employeeId: employee.employeeCode,
      joinDate: employee.hireDate,
      careerCourse: currentCourse
        ? {
            courseCode: currentCourse.courseCode,
            courseName: currentCourse.courseDefinition.courseName,
            effectiveFrom: currentCourse.effectiveFrom,
            nextChangeAvailableDate: currentCourse.nextChangeAvailableDate,
          }
        : null,
    });
  } catch (error) {
    console.error('Error fetching my page data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch my page data' },
      { status: 500 }
    );
  }
}
```

#### チェックリスト

- [ ] API-1実装完了
- [ ] API-2実装完了
- [ ] Postmanでテスト実施

### 3.3 Day 3（11/1金）: API実装（2/2）

#### API-3: コース変更申請送信

**ファイル**: `src/app/api/career-course/change-request/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifySupabaseToken, getEmployeeIdFromUser } from '@/middleware/auth';

export async function POST(request: NextRequest) {
  try {
    // 認証
    const user = await verifySupabaseToken(request);
    const employeeId = await getEmployeeIdFromUser(user.id);

    // リクエストボディ取得
    const body = await request.json();
    const {
      currentCourseCode,
      requestedCourseCode,
      changeReason,
      reasonDetail,
      requestedEffectiveDate,
      attachments,
    } = body;

    // バリデーション: 現在のコース確認
    const currentSelection = await prisma.staffCareerCourse.findFirst({
      where: {
        employeeId,
        effectiveTo: null,
      },
    });

    if (!currentSelection || currentSelection.courseCode !== currentCourseCode) {
      return NextResponse.json(
        { error: '現在のコース情報が一致しません' },
        { status: 400 }
      );
    }

    // バリデーション: 年1回制限チェック
    if (changeReason === 'annual' && currentSelection.nextChangeAvailableDate) {
      const today = new Date();
      if (today < currentSelection.nextChangeAvailableDate) {
        return NextResponse.json(
          {
            error: '年1回の変更制限に達しています',
            details: {
              nextChangeAvailableDate: currentSelection.nextChangeAvailableDate,
            },
          },
          { status: 400 }
        );
      }
    }

    // バリデーション: 特例変更の添付ファイル必須チェック
    if (changeReason.startsWith('special_') && (!attachments || attachments.length === 0)) {
      return NextResponse.json(
        { error: '特例変更の場合、証明書類の添付が必要です' },
        { status: 400 }
      );
    }

    // 申請作成
    const request = await prisma.careerCourseChangeRequest.create({
      data: {
        employeeId,
        currentCourseCode,
        requestedCourseCode,
        changeReason,
        reasonDetail,
        requestedEffectiveDate: new Date(requestedEffectiveDate),
        attachmentUrls: attachments ? JSON.stringify(attachments) : null,
        approvalStatus: 'pending',
      },
    });

    // メール送信（TODO: 実装）
    // await sendEmail({ to: employee.email, subject: '申請受付', ... });
    // await sendEmail({ to: 'hr@example.com', subject: '新規申請', ... });

    return NextResponse.json({
      id: request.id,
      staffId: employeeId,
      approvalStatus: request.approvalStatus,
      createdAt: request.createdAt,
      message: 'コース変更申請を受け付けました。人事部の審査をお待ちください。',
    });
  } catch (error) {
    console.error('Error creating change request:', error);
    return NextResponse.json(
      { error: 'Failed to create change request' },
      { status: 500 }
    );
  }
}
```

#### API-4: 申請履歴取得

**ファイル**: `src/app/api/career-course/my-requests/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifySupabaseToken, getEmployeeIdFromUser } from '@/middleware/auth';

export async function GET(request: NextRequest) {
  try {
    // 認証
    const user = await verifySupabaseToken(request);
    const employeeId = await getEmployeeIdFromUser(user.id);

    // 申請履歴取得
    const requests = await prisma.careerCourseChangeRequest.findMany({
      where: { employeeId },
      orderBy: { createdAt: 'desc' },
      include: {
        currentCourse: true,
        requestedCourse: true,
      },
    });

    return NextResponse.json(
      requests.map((req) => ({
        id: req.id,
        currentCourseCode: req.currentCourseCode,
        currentCourseName: req.currentCourse.courseName,
        requestedCourseCode: req.requestedCourseCode,
        requestedCourseName: req.requestedCourse.courseName,
        changeReason: req.changeReason,
        requestedEffectiveDate: req.requestedEffectiveDate,
        approvalStatus: req.approvalStatus,
        createdAt: req.createdAt,
        reviewedAt: req.reviewedAt,
        reviewComment: req.reviewComment,
      }))
    );
  } catch (error) {
    console.error('Error fetching my requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch my requests' },
      { status: 500 }
    );
  }
}
```

#### チェックリスト

- [ ] API-3実装完了
- [ ] API-4実装完了
- [ ] 全API動作確認完了
- [ ] エラーハンドリング実装完了

### 3.4 Phase 5-4b 完了基準

- [ ] 全API（4エンドポイント）動作確認完了
- [ ] 認証フロー確認完了
- [ ] バリデーション動作確認
- [ ] 単体テスト実施完了

**完了予定**: 11/1（金）17:00

---

## 4. Phase 5-4c: ファイルストレージ統合

**期間**: 11/4（月）～ 11/5（火）
**完了予定**: 11/5（火）17:00

### 4.1 Day 1（11/4月）: Supabase Storage設定

#### 作業-1: バケット作成

**Supabase Dashboard**:

1. https://app.supabase.com にログイン
2. プロジェクト選択
3. Storage → Create a new bucket
4. Bucket name: `career-course-attachments`
5. Public bucket: ❌ **OFF**（プライベートバケット）

#### 作業-2: RLS（Row Level Security）設定

**SQL Editor**:

```sql
-- ファイルアップロードポリシー
CREATE POLICY "Users can upload their own files"
ON storage.objects FOR INSERT
WITH CHECK (
  auth.uid()::text = (storage.foldername(name))[1]
);

-- ファイル読み取りポリシー
CREATE POLICY "Users can read their own files"
ON storage.objects FOR SELECT
USING (
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 人事部はすべてのファイルを読み取り可能
CREATE POLICY "HR can read all files"
ON storage.objects FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM employees
    WHERE employees.id = auth.uid()::text
    AND employees.permission_level >= 10
  )
);
```

#### チェックリスト

- [ ] バケット作成完了
- [ ] RLS設定完了
- [ ] アクセス権限テスト完了

### 4.2 Day 2（11/5火）: ファイルアップロードAPI実装

#### API-5: ファイルアップロード

**ファイル**: `src/app/api/career-course/upload-attachment/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifySupabaseToken, getEmployeeIdFromUser } from '@/middleware/auth';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'];

export async function POST(request: NextRequest) {
  try {
    // 認証
    const user = await verifySupabaseToken(request);
    const employeeId = await getEmployeeIdFromUser(user.id);

    // ファイル取得
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // バリデーション: ファイルサイズ
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    // バリデーション: 拡張子
    const extension = file.name.toLowerCase().match(/\.[^.]*$/)?.[0];
    if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: PDF, JPG, PNG' },
        { status: 400 }
      );
    }

    // ファイル名生成
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileName = `${employeeId}/${timestamp}_${sanitizedName}`;

    // Supabase Storageにアップロード
    const { data, error } = await supabase.storage
      .from('career-course-attachments')
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      );
    }

    // 公開URL取得
    const { data: urlData } = supabase.storage
      .from('career-course-attachments')
      .getPublicUrl(fileName);

    return NextResponse.json({
      fileUrl: urlData.publicUrl,
      fileName: file.name,
      fileSize: file.size,
      uploadedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
```

#### チェックリスト

- [ ] ファイルアップロードAPI実装完了
- [ ] ファイルサイズチェック動作確認
- [ ] 拡張子チェック動作確認
- [ ] Supabase Storageアップロード確認

### 4.3 Phase 5-4c 完了基準

- [ ] ファイルアップロード動作確認
- [ ] RLS動作確認
- [ ] エラーハンドリング確認

**完了予定**: 11/5（火）17:00

---

## 5. Phase 5-4d: 統合テスト

**期間**: 11/6（水）～ 11/8（金）
**完了予定**: 11/8（金）17:00

### 5.1 Day 1（11/6水）: 統合テストキックオフ

**時間**: 9:00～10:00

**参加者**:
- VoiceDriveチーム: プロジェクトリード、技術担当
- 医療システムチーム: API担当、テスト担当

**アジェンダ**:
1. API仕様の最終確認
2. 認証フロー確認
3. エラーハンドリング確認
4. テストシナリオ共有

### 5.2 Day 2（11/7木）: 統合テスト実施

**時間**: 9:00～17:00

#### テストシナリオ

| No | テスト内容 | 期待結果 | 担当 |
|----|-----------|---------|------|
| 1 | コース定義一覧取得 | A/B/C/D 4コース取得成功 | 医療システム |
| 2 | マイページ情報取得 | careerCourse含むデータ取得成功 | 医療システム |
| 3 | コース変更申請（正常系） | 申請作成成功、pending状態 | VoiceDrive |
| 4 | ファイルアップロード（PDF） | アップロード成功、URL取得 | VoiceDrive |
| 5 | ファイルアップロード（大容量） | 10MB超過エラー | VoiceDrive |
| 6 | ファイルアップロード（不正拡張子） | 拡張子エラー | VoiceDrive |
| 7 | 年1回制限チェック | 制限エラー表示 | VoiceDrive |
| 8 | 特例変更・添付なし | 添付必須エラー | VoiceDrive |
| 9 | 認証エラー（トークンなし） | 401 Unauthorized | VoiceDrive |
| 10 | 認証エラー（無効トークン） | 401 Unauthorized | VoiceDrive |

#### チェックリスト

- [ ] 全テストシナリオ実施完了
- [ ] バグ報告・修正完了
- [ ] パフォーマンステスト実施

### 5.3 Day 3（11/8金）: 統合テスト完了報告

**時間**: 15:00～16:00

**成果物**:
- 統合テスト報告書
- 既知の問題リスト
- リリース判定

#### チェックリスト

- [ ] 統合テスト報告書作成
- [ ] 既知の問題リスト作成
- [ ] リリース判定（GO / NO-GO）

### 5.4 Phase 5-4d 完了基準

- [ ] 全テストシナリオ実施完了
- [ ] VoiceDrive側UI接続確認
- [ ] パフォーマンステスト完了
- [ ] 統合テスト報告書承認

**完了予定**: 11/8（金）17:00

---

## 6. トラブルシューティング

### 6.1 マイグレーションエラー

**エラー**: `Error: P3009: Migration failed to apply`

**原因**: テーブル名の衝突

**対処**:
```bash
# マイグレーションをロールバック
npx prisma migrate resolve --rolled-back 20251029000000_add_career_course_tables

# 既存テーブルを削除
DROP TABLE IF EXISTS course_definitions;
DROP TABLE IF EXISTS staff_career_courses;
DROP TABLE IF EXISTS course_change_requests;

# マイグレーション再実行
npx prisma migrate dev --name add_career_course_tables
```

### 6.2 認証エラー

**エラー**: `Invalid or expired token`

**原因**: Supabase Service Role Key未設定

**対処**:
```bash
# .env.production確認
cat .env.production | grep SUPABASE_SERVICE_ROLE_KEY

# 未設定の場合、Supabase Dashboardから取得
# Settings → API → service_role key をコピー
```

### 6.3 ファイルアップロードエラー

**エラー**: `row-level security policy for table "objects" violation`

**原因**: RLSポリシー未設定

**対処**:
```sql
-- RLSが有効か確認
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'objects';

-- ポリシー確認
SELECT * FROM pg_policies WHERE tablename = 'objects';

-- ポリシー再作成（4.1 Day 1参照）
```

---

## 7. 完了チェックリスト

### Phase 5-4a: DB構築

- [ ] schema.prisma更新完了
- [ ] マイグレーション実行完了
- [ ] 初期データ投入完了
- [ ] A/B/C/D 4コース確認完了

### Phase 5-4b: API実装

- [ ] 認証ミドルウェア実装完了
- [ ] API-1（コース定義一覧）実装完了
- [ ] API-2（マイページ）実装完了
- [ ] API-3（コース変更申請）実装完了
- [ ] API-4（申請履歴）実装完了
- [ ] 全API動作確認完了

### Phase 5-4c: ファイルストレージ統合

- [ ] Supabase Storage設定完了
- [ ] RLS設定完了
- [ ] API-5（ファイルアップロード）実装完了
- [ ] ファイルアップロード動作確認完了

### Phase 5-4d: 統合テスト

- [ ] 統合テストキックオフ実施
- [ ] 全テストシナリオ実施完了
- [ ] 統合テスト報告書作成完了
- [ ] リリース判定完了

### ドキュメント

- [ ] OpenAPI仕様書作成完了
- [ ] Dev環境URL提供完了
- [ ] 実装完了報告書作成完了

---

**実装担当者**: 医療システムチーム
**レビュー担当者**: [担当者名]
**承認者**: [担当者名]

**最終更新**: 2025年10月21日
