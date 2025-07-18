// 13段階権限レベル対応メニューシステム型定義

export interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  path: string;
  requiredLevel: number;
  category: MenuCategory;
  children?: MenuItem[];
}

export type MenuCategory = 
  | 'station'           // ステーション系
  | 'management'        // 管理機能
  | 'hr'               // 人事機能
  | 'strategic_hr'     // 戦略的人事機能
  | 'facility'         // 施設管理機能
  | 'analytics'        // 分析機能
  | 'executive';       // 経営機能

export interface StationMenu {
  personal: MenuItem;      // パーソナルステーション（全員）
  leader: MenuItem;        // リーダーステーション（レベル2〜）
  department: MenuItem;    // 部門ステーション（レベル3〜）
  section: MenuItem;       // 部署ステーション（レベル4〜）
}

export interface ManagementMenu {
  team: MenuItem;          // チーム管理（レベル2〜）
  authority_basic: MenuItem;  // 権限管理（基本）（レベル2〜）
  department: MenuItem;    // 部門管理（レベル3〜）
  section: MenuItem;       // 部署管理（レベル4〜）
  budget: MenuItem;        // 予算管理（レベル4〜）
}

export interface HRMenu {
  interview: MenuItem;     // 面談管理（レベル8〜）
  policy: MenuItem;        // ポリシー管理（レベル8〜）
  talent: MenuItem;        // タレント分析（レベル8〜）
  dashboard: MenuItem;     // 人事ダッシュボード（レベル9〜）
}

export interface StrategicHRMenu {
  planning: MenuItem;      // 戦略的人事計画（レベル10〜）
  org_development: MenuItem;  // 組織開発（レベル10〜）
  performance: MenuItem;   // パフォーマンス分析（レベル10〜）
  retirement: MenuItem;    // 退職管理（レベル10〜）
}

export interface FacilityMenu {
  own_facility: MenuItem;  // 所属施設管理（レベル5〜）
  own_strategy: MenuItem;  // 所属施設戦略概要（レベル5〜）
  own_budget: MenuItem;    // 所属施設予算計画（レベル5〜）
  all_facility: MenuItem; // 全施設管理（レベル10〜）
  all_strategy: MenuItem; // 全施設戦略概要（レベル10〜）
  all_budget: MenuItem;   // 全施設予算計画（レベル10〜）
}

export interface AnalyticsMenu {
  dept_user: MenuItem;        // 所属部門ユーザー分析（レベル3〜）
  dept_generation: MenuItem;  // 所属部門世代間分析（レベル3〜）
  facility_hierarchy: MenuItem; // 所属施設階層間分析（レベル5〜）
  facility_profession: MenuItem; // 所属施設職種間分析（レベル5〜）
  all_user: MenuItem;         // 全施設ユーザー分析（レベル10〜）
  all_generation: MenuItem;   // 全施設世代間分析（レベル10〜）
  all_hierarchy: MenuItem;    // 全施設階層間分析（レベル10〜）
  all_profession: MenuItem;   // 全施設職種間分析（レベル10〜）
  executive_report: MenuItem; // エグゼクティブレポート（レベル10〜）
}

export interface ExecutiveMenu {
  overview: MenuItem;         // 経営概要（レベル11〜）
  strategic_initiatives: MenuItem; // 戦略イニシアチブ（レベル11〜）
  organization_analytics: MenuItem; // 組織分析（レベル11〜）
  board_reports: MenuItem;    // 全体会議レポート（レベル11〜）
  governance: MenuItem;       // ガバナンス（レベル11〜）
}

// 完全なメニュー構造
export interface MenuStructure {
  station: StationMenu;
  management: ManagementMenu;
  hr: HRMenu;
  strategic_hr: StrategicHRMenu;
  facility: FacilityMenu;
  analytics: AnalyticsMenu;
  executive: ExecutiveMenu;
}

// 権限レベル別メニュー可視性
export interface MenuVisibility {
  [level: number]: {
    station: (keyof StationMenu)[];
    management: (keyof ManagementMenu)[];
    hr: (keyof HRMenu)[];
    strategic_hr: (keyof StrategicHRMenu)[];
    facility: (keyof FacilityMenu)[];
    analytics: (keyof AnalyticsMenu)[];
    executive: (keyof ExecutiveMenu)[];
  };
}