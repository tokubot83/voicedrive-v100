import { useDemoMode } from '../components/demo/DemoModeController';

export interface AnalysisScope {
  type: 'department' | 'facility' | 'corporate';
  name: string;
  description: string;
}

/**
 * 権限レベルに応じた分析スコープを取得
 */
export const getAnalysisScopeByPermission = (permissionLevel: number, department?: string, facility?: string): AnalysisScope => {
  if (permissionLevel >= 7) {
    return {
      type: 'corporate',
      name: '全体',
      description: '全施設・全部門を対象とした組織全体の分析'
    };
  } else if (permissionLevel >= 4) {
    return {
      type: 'facility',
      name: '管轄施設',
      description: `${facility || '所属施設'}内の全部門を対象とした施設レベルの分析`
    };
  } else {
    return {
      type: 'department',
      name: '管轄部門',
      description: `${department || '所属部門'}内のメンバーを対象とした部門レベルの分析`
    };
  }
};

/**
 * 権限レベルに応じた分析タイトルを生成
 */
export const getAnalysisTitle = (analysisType: string, permissionLevel: number, department?: string, facility?: string): string => {
  const scope = getAnalysisScopeByPermission(permissionLevel, department, facility);
  
  const titles: { [key: string]: string } = {
    'user': 'ユーザー分析',
    'generational': '世代間分析', 
    'hierarchical': '階層間分析',
    'professional': '職種間分析'
  };
  
  const baseTitle = titles[analysisType] || '分析';
  
  return `${baseTitle}（${scope.name}）`;
};

/**
 * 権限レベルに応じた役職名を取得
 */
export const getPositionByLevel = (permissionLevel: number): string => {
  const positions: { [key: number]: string } = {
    1: '一般職員',
    2: '主任', 
    3: '師長',
    4: '部長・課長',
    5: '事務長',
    6: '副院長',
    7: '院長・施設長',
    8: '人財統括本部事務員',
    9: '人財統括本部キャリア支援部門員',
    10: '人財統括本部各部門長',
    11: '人財統括本部統括管理部門長',
    12: '厚生会本部統括事務局長',
    13: '理事長'
  };
  
  return positions[permissionLevel] || `レベル${permissionLevel}`;
};

/**
 * 部門名を日本語表示に変換
 */
export const getDepartmentDisplayName = (department: string): string => {
  const departmentNames: { [key: string]: string } = {
    'nursing_ward': '看護部',
    'medical_department': '医局',
    'rehabilitation_ward': 'リハビリテーション科',
    'pharmacy': '薬剤部',
    'radiology': '放射線科',
    'laboratory': '検査科',
    'administration': '事務部',
    'nutrition': '栄養科',
    'medical_engineering': '臨床工学科',
    'medical_safety': '医療安全管理室'
  };
  
  return departmentNames[department] || department;
};

/**
 * 施設名を日本語表示に変換
 */
export const getFacilityDisplayName = (facilityId: string): string => {
  const facilityNames: { [key: string]: string } = {
    'kohara_hospital': 'さつき台病院',
    'midorikaze_facility': '介護老人保健施設 緑風園',
    'satsuki_nursing': '訪問看護ステーション さつき'
  };
  
  return facilityNames[facilityId] || facilityId;
};

/**
 * 権限レベルに応じてデータをフィルタリング
 */
export const filterDataByPermission = <T extends { department?: string; facilityId?: string }>(
  data: T[], 
  permissionLevel: number, 
  userDepartment?: string, 
  userFacility?: string
): T[] => {
  if (permissionLevel >= 7) {
    // レベル7以上：全データアクセス可能
    return data;
  } else if (permissionLevel >= 4) {
    // レベル4-6：施設内データのみ
    return data.filter(item => item.facilityId === userFacility);
  } else {
    // レベル3以下：部門内データのみ
    return data.filter(item => item.department === userDepartment);
  }
};