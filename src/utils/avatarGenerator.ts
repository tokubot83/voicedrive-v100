import { User, AnonymityLevel } from '../types';

// アバター生成のための定数
const AVATAR_COLORS = [
  'from-blue-400 to-blue-600',
  'from-green-400 to-green-600',
  'from-purple-400 to-purple-600',
  'from-pink-400 to-pink-600',
  'from-indigo-400 to-indigo-600',
  'from-teal-400 to-teal-600',
  'from-orange-400 to-orange-600',
  'from-red-400 to-red-600',
  'from-cyan-400 to-cyan-600',
  'from-emerald-400 to-emerald-600'
];

const MEDICAL_DEPARTMENT_COLORS = {
  '看護部': 'from-pink-400 to-pink-600',
  '医局': 'from-blue-400 to-blue-600',
  'リハビリテーション科': 'from-green-400 to-green-600',
  'リハビリテーション部': 'from-green-400 to-green-600',
  '薬剤部': 'from-purple-400 to-purple-600',
  '事務部': 'from-gray-400 to-gray-600',
  '総務部': 'from-gray-400 to-gray-600',
  '経営企画部': 'from-indigo-400 to-indigo-600',
  '人事部': 'from-orange-400 to-orange-600',
  '施設管理部': 'from-yellow-400 to-yellow-600',
  '温泉療法科': 'from-cyan-400 to-cyan-600'
};

const DEPARTMENT_ICONS = {
  '看護部': '🏥',
  '医局': '👨‍⚕️',
  'リハビリテーション科': '🏃‍♂️',
  'リハビリテーション部': '🏃‍♂️',
  '薬剤部': '💊',
  '事務部': '📊',
  '総務部': '📋',
  '経営企画部': '📈',
  '人事部': '👥',
  '施設管理部': '🏢',
  '温泉療法科': '♨️'
};

const ANONYMOUS_ICONS = ['👤', '🔵', '⭐', '🔶', '🔸', '🔹', '◯', '△', '◾', '◽'];

// 文字列から一意のハッシュを生成
const generateHash = (input: string): number => {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 32bit整数に変換
  }
  return Math.abs(hash);
};

// ユーザーの個人アバター生成
export const generatePersonalAvatar = (user: User) => {
  const hash = generateHash(user.id + user.name);
  const departmentColor = MEDICAL_DEPARTMENT_COLORS[user.department] || AVATAR_COLORS[hash % AVATAR_COLORS.length];
  const departmentIcon = DEPARTMENT_ICONS[user.department] || '👤';
  
  return {
    gradient: departmentColor,
    primaryText: user.name.charAt(0),
    secondaryText: user.department.slice(0, 2),
    icon: departmentIcon,
    borderColor: 'border-white',
    textColor: 'text-white'
  };
};

// 部署レベルアバター生成
export const generateDepartmentAvatar = (department: string, userId?: string) => {
  const hash = userId ? generateHash(userId) : generateHash(department);
  const departmentColor = MEDICAL_DEPARTMENT_COLORS[department] || AVATAR_COLORS[hash % AVATAR_COLORS.length];
  const departmentIcon = DEPARTMENT_ICONS[department] || '🏢';
  
  return {
    gradient: departmentColor,
    primaryText: department.slice(0, 2),
    secondaryText: '',
    icon: departmentIcon,
    borderColor: 'border-gray-300',
    textColor: 'text-white'
  };
};

// 施設レベルアバター生成
export const generateFacilityAvatar = (facility: string, userId?: string) => {
  const hash = userId ? generateHash(userId) : generateHash(facility);
  const facilityColors = {
    '小原病院': 'from-blue-400 to-blue-600',
    '立神リハ温泉病院': 'from-green-400 to-green-600',
    '本部': 'from-purple-400 to-purple-600'
  };
  
  const facilityIcons = {
    '小原病院': '🏥',
    '立神リハ温泉病院': '♨️',
    '本部': '🏢'
  };
  
  const color = facilityColors[facility] || AVATAR_COLORS[hash % AVATAR_COLORS.length];
  const icon = facilityIcons[facility] || '🏢';
  
  return {
    gradient: color,
    primaryText: facility.slice(0, 2),
    secondaryText: '',
    icon: icon,
    borderColor: 'border-gray-300',
    textColor: 'text-white'
  };
};

// 完全匿名アバター生成
export const generateAnonymousAvatar = (postId: string) => {
  const hash = generateHash(postId);
  const color = AVATAR_COLORS[hash % AVATAR_COLORS.length];
  const icon = ANONYMOUS_ICONS[hash % ANONYMOUS_ICONS.length];
  
  return {
    gradient: color,
    primaryText: '',
    secondaryText: '',
    icon: icon,
    borderColor: 'border-gray-400',
    textColor: 'text-white'
  };
};

// 匿名性レベルに応じたアバター生成
export const generateAvatarByAnonymity = (
  anonymityLevel: AnonymityLevel, 
  user: User, 
  postId?: string
) => {
  switch (anonymityLevel) {
    case 'anonymous':
      return generateAnonymousAvatar(postId || user.id);
    case 'partial':
      return generateDepartmentAvatar(user.department, user.id);
    case 'selective':
      // 施設情報を取得（デモデータから）
      const facility = getFacilityFromDepartment(user.department);
      return generateFacilityAvatar(facility, user.id);
    case 'full':
    default:
      return generatePersonalAvatar(user);
  }
};

// 部署から施設を取得（既存のロジックと統一）
const getFacilityFromDepartment = (department: string): string => {
  const facilityMap: Record<string, string> = {
    'リハビリテーション科': '立神リハ温泉病院',
    'リハビリテーション部': '立神リハ温泉病院',
    '温泉療法科': '立神リハ温泉病院',
    '看護部': '小原病院',
    '医局': '小原病院',
    '外来': '小原病院',
    '病棟': '小原病院',
    '事務部': '小原病院',
    '薬剤部': '小原病院',
    '経営企画部': '本部',
    '人事部': '本部',
    '総務部': '本部'
  };
  return facilityMap[department] || '小原病院';
};

// アバター表示用の名前生成
export const getDisplayName = (
  anonymityLevel: AnonymityLevel,
  user: User
): string => {
  switch (anonymityLevel) {
    case 'anonymous':
      return '匿名ユーザー';
    case 'partial':
      return `${user.department} 職員`;
    case 'selective':
      const facility = getFacilityFromDepartment(user.department);
      return `${user.name} (${facility})`;
    case 'full':
    default:
      return `${user.name} (${user.position || user.department})`;
  }
};