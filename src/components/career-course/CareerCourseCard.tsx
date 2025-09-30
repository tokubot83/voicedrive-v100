/**
 * CareerCourseCard.tsx
 * キャリアコース情報表示カード
 *
 * 現在のキャリアコース (A/B/C/D) の詳細を表示
 */

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { CheckCircle2, XCircle, Calendar, TrendingUp } from 'lucide-react';
import { CareerCourseSelection, CareerCourseCode } from '../../types/career-course';

interface CareerCourseCardProps {
  careerCourse: CareerCourseSelection;
  onChangeRequest?: () => void;  // コース変更申請ボタンのハンドラ
}

// コース別の表示情報
const COURSE_INFO: Record<CareerCourseCode, {
  name: string;
  emoji: string;
  gradient: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
}> = {
  A: {
    name: 'Aコース（全面協力型）',
    emoji: '🚀',
    gradient: 'from-blue-500 to-purple-600',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-300'
  },
  B: {
    name: 'Bコース（施設内協力型）',
    emoji: '🏢',
    gradient: 'from-green-500 to-teal-600',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-300'
  },
  C: {
    name: 'Cコース（専門職型）',
    emoji: '⭐',
    gradient: 'from-amber-500 to-orange-600',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-300'
  },
  D: {
    name: 'Dコース（時短・制約あり型）',
    emoji: '🌸',
    gradient: 'from-pink-500 to-rose-600',
    bgColor: 'bg-pink-50',
    textColor: 'text-pink-700',
    borderColor: 'border-pink-300'
  }
};

// 基本給係数の取得（コースによって異なる）
const getSalaryMultiplier = (courseCode: CareerCourseCode): number => {
  const multipliers: Record<CareerCourseCode, number> = {
    A: 1.2,
    B: 1.1,
    C: 1.0,
    D: 0.9
  };
  return multipliers[courseCode];
};

// コース別の詳細情報
const getCourseDetails = (courseCode: CareerCourseCode) => {
  const details: Record<CareerCourseCode, {
    departmentTransfer: boolean;
    facilityTransfer: string;
    nightShift: string;
    managementTrack: boolean;
  }> = {
    A: {
      departmentTransfer: true,
      facilityTransfer: '施設間異動あり（転居含む）',
      nightShift: '必須',
      managementTrack: true
    },
    B: {
      departmentTransfer: true,
      facilityTransfer: '施設内のみ',
      nightShift: '必須',
      managementTrack: true
    },
    C: {
      departmentTransfer: false,
      facilityTransfer: 'なし',
      nightShift: '選択可',
      managementTrack: false
    },
    D: {
      departmentTransfer: false,
      facilityTransfer: 'なし',
      nightShift: 'なし',
      managementTrack: false
    }
  };
  return details[courseCode];
};

// 次回変更可能日までの日数を計算
const getDaysUntilNextChange = (nextChangeDate: string | null): number | null => {
  if (!nextChangeDate) return null;
  const today = new Date();
  const changeDate = new Date(nextChangeDate);
  const diffTime = changeDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const CareerCourseCard: React.FC<CareerCourseCardProps> = ({
  careerCourse,
  onChangeRequest
}) => {
  const courseInfo = COURSE_INFO[careerCourse.courseCode];
  const courseDetails = getCourseDetails(careerCourse.courseCode);
  const salaryMultiplier = getSalaryMultiplier(careerCourse.courseCode);
  const daysUntilNextChange = getDaysUntilNextChange(careerCourse.nextChangeAvailableDate);

  return (
    <Card className="overflow-hidden">
      <CardHeader className={`bg-gradient-to-r ${courseInfo.gradient} text-white`}>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            <span className="text-3xl">{courseInfo.emoji}</span>
            <div>
              <div className="text-2xl font-bold">{careerCourse.courseCode}コース</div>
              <div className="text-sm font-normal opacity-90">{courseInfo.name}</div>
            </div>
          </CardTitle>
          <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
            {careerCourse.approvalStatus === 'approved' ? '適用中' : '申請中'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-4">
        {/* 適用期間 */}
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Calendar className="w-4 h-4" />
          <span>適用開始: {new Date(careerCourse.effectiveFrom).toLocaleDateString('ja-JP')}</span>
        </div>

        {/* コース詳細 */}
        <div className="space-y-2">
          <h4 className="font-semibold text-slate-700">コース詳細</h4>
          <div className="grid grid-cols-1 gap-2">
            {/* 部署異動 */}
            <div className="flex items-center gap-2">
              {courseDetails.departmentTransfer ? (
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              ) : (
                <XCircle className="w-4 h-4 text-slate-400" />
              )}
              <span className="text-sm text-slate-600">
                部署異動: {courseDetails.departmentTransfer ? '可' : '不可'}
              </span>
            </div>

            {/* 施設間異動 */}
            <div className="flex items-center gap-2">
              {courseDetails.facilityTransfer !== 'なし' ? (
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              ) : (
                <XCircle className="w-4 h-4 text-slate-400" />
              )}
              <span className="text-sm text-slate-600">
                施設間異動: {courseDetails.facilityTransfer}
              </span>
            </div>

            {/* 夜勤 */}
            <div className="flex items-center gap-2">
              {courseDetails.nightShift === '必須' ? (
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              ) : courseDetails.nightShift === '選択可' ? (
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
              ) : (
                <XCircle className="w-4 h-4 text-slate-400" />
              )}
              <span className="text-sm text-slate-600">
                夜勤: {courseDetails.nightShift}
              </span>
            </div>

            {/* 管理職登用 */}
            <div className="flex items-center gap-2">
              {courseDetails.managementTrack ? (
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              ) : (
                <XCircle className="w-4 h-4 text-slate-400" />
              )}
              <span className="text-sm text-slate-600">
                管理職登用: {courseDetails.managementTrack ? '対象' : '対象外'}
              </span>
            </div>

            {/* 基本給係数 */}
            <div className="flex items-center gap-2">
              <TrendingUp className={`w-4 h-4 ${salaryMultiplier >= 1.1 ? 'text-blue-600' : 'text-slate-400'}`} />
              <span className="text-sm text-slate-600">
                基本給係数: <span className="font-semibold">{salaryMultiplier.toFixed(1)}倍</span>
              </span>
            </div>
          </div>
        </div>

        {/* 次回変更可能日 */}
        {careerCourse.nextChangeAvailableDate && (
          <div className={`p-3 rounded-lg ${courseInfo.bgColor} border ${courseInfo.borderColor}`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-600 mb-1">次回変更可能日</div>
                <div className={`text-sm font-semibold ${courseInfo.textColor}`}>
                  {new Date(careerCourse.nextChangeAvailableDate).toLocaleDateString('ja-JP')}
                </div>
              </div>
              {daysUntilNextChange !== null && (
                <Badge variant="secondary" className={courseInfo.bgColor}>
                  {daysUntilNextChange > 0 ? `あと${daysUntilNextChange}日` : '変更可能'}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* 特例変更事由（ある場合のみ表示） */}
        {careerCourse.specialChangeReason && (
          <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
            <div className="text-xs text-yellow-700 mb-1">特例変更事由</div>
            <div className="text-sm font-semibold text-yellow-800">
              {careerCourse.specialChangeReason === 'pregnancy' && '妊娠・出産'}
              {careerCourse.specialChangeReason === 'caregiving' && '介護'}
              {careerCourse.specialChangeReason === 'illness' && '疾病'}
            </div>
            {careerCourse.specialChangeNote && (
              <div className="text-xs text-yellow-600 mt-1">{careerCourse.specialChangeNote}</div>
            )}
          </div>
        )}

        {/* コース変更について */}
        <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
          <div className="flex items-start gap-2">
            <div className="text-blue-600 mt-0.5">ℹ️</div>
            <div className="text-xs text-blue-700 space-y-1">
              <div className="font-semibold">コース変更について</div>
              <ul className="list-disc list-inside space-y-0.5 text-blue-600">
                <li>年1回の定期変更が可能です</li>
                <li>妊娠・育児・介護等の特例事由の場合は即時変更可能</li>
                <li>変更申請は人事部の審査が必要です</li>
              </ul>
            </div>
          </div>
        </div>

        {/* コース変更申請ボタン */}
        {onChangeRequest && (
          <button
            onClick={onChangeRequest}
            className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            コース変更を申請する
          </button>
        )}
      </CardContent>
    </Card>
  );
};