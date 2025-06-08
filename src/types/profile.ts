// プロフィール関連の型定義
import { PermissionLevel } from '../permissions/types/PermissionTypes';

export interface MedicalProfile {
  // 基本情報
  id: string; // ユーザーID
  employeeNumber: string; // 職員番号
  
  // 個人情報
  name: string; // 氏名
  furigana: string; // ふりがな
  
  // 組織情報
  facility: string; // 所属施設ID
  department: string; // 所属部署ID
  profession: string; // 職種ID
  position: string; // 役職ID
  
  // 入職・経験情報
  hireDate: string; // 入職日（YYYY-MM-DD）
  experienceYears: number; // 経験年数（自動計算）
  previousExperience: number; // 前職経験年数
  totalExperience: number; // 総経験年数（自動計算）
  
  // プロフィール情報
  motto: string; // モットー（座右の銘から変更）
  selfIntroduction: string; // 自己紹介
  hobbies: string[]; // 趣味（選択肢から複数選択）
  skills: string[]; // スキル・特技
  
  // 画像情報
  profileImage?: string; // プロフィール画像URL（デフォルト：null）
  coverImage?: string; // カバー画像URL（デフォルト：グラデーション）
  
  // 計算フィールド（自動生成）
  votingWeight: number; // 投票重み（職種・役職・経験から自動計算）
  permissionLevel: PermissionLevel; // 権限レベル（役職から自動決定）
  approvalAuthority: string; // 承認権限レベル
  
  // メタデータ
  createdAt: string;
  updatedAt: string;
  lastProfileUpdate: string;
  profileCompleteRate: number; // プロフィール完成度（0-100%）
}

export interface ProfileFormData {
  // 個人情報
  name: string;
  furigana: string;
  
  // 組織情報
  facility: string;
  department: string;
  profession: string;
  position: string;
  
  // 入職・経験情報
  hireDate: string;
  previousExperience: number;
  
  // プロフィール情報
  motto: string;
  selfIntroduction: string;
  hobbies: string[];
  skills: string[];
  
  // 画像情報
  profileImage?: string;
  coverImage?: string;
}