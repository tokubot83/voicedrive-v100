import { User, AnonymityLevel, CommentPrivacyLevel } from '../types';

// アバター生成のための定数
const AVATAR_COLORS = [
  'from-blue-400 via-blue-500 to-purple-600',
  'from-green-400 via-emerald-500 to-teal-600',
  'from-purple-400 via-pink-500 to-rose-600',
  'from-pink-400 via-rose-500 to-orange-600',
  'from-indigo-400 via-purple-500 to-pink-600',
  'from-teal-400 via-cyan-500 to-blue-600',
  'from-orange-400 via-amber-500 to-red-600',
  'from-red-400 via-rose-500 to-pink-600',
  'from-cyan-400 via-blue-500 to-indigo-600',
  'from-emerald-400 via-green-500 to-cyan-600'
];

// リッチグラデーションカラー（多色展開）
const RICH_GRADIENTS = [
  { colors: 'from-[#667eea] via-[#764ba2] to-[#f093fb]', shadow: 'shadow-purple-500/50' },
  { colors: 'from-[#ff6b6b] via-[#feca57] to-[#48dbfb]', shadow: 'shadow-orange-500/50' },
  { colors: 'from-[#a8edea] via-[#fed6e3] to-[#d299c2]', shadow: 'shadow-pink-500/50' },
  { colors: 'from-[#ffecd2] via-[#fcb69f] to-[#ff8a80]', shadow: 'shadow-orange-400/50' },
  { colors: 'from-[#ff9a9e] via-[#fecfef] to-[#ffecd2]', shadow: 'shadow-pink-400/50' },
  { colors: 'from-[#f6d365] via-[#fda085] to-[#ff6b9d]', shadow: 'shadow-amber-500/50' },
  { colors: 'from-[#84fab0] via-[#8fd3f4] to-[#a6c0fe]', shadow: 'shadow-teal-500/50' },
  { colors: 'from-[#d4fc79] via-[#96e6a1] to-[#3bb78f]', shadow: 'shadow-green-500/50' }
];

const MEDICAL_DEPARTMENT_COLORS = {
  '看護部': { gradient: 'from-[#ff9a9e] via-[#fecfef] to-[#ffecd2]', shadow: 'shadow-pink-400/50' },
  '医局': { gradient: 'from-[#667eea] via-[#764ba2] to-[#9b59b6]', shadow: 'shadow-purple-500/50' },
  'リハビリテーション科': { gradient: 'from-[#ffecd2] via-[#fcb69f] to-[#ff8a80]', shadow: 'shadow-orange-400/50' },
  'リハビリテーション部': { gradient: 'from-[#ffecd2] via-[#fcb69f] to-[#ff8a80]', shadow: 'shadow-orange-400/50' },
  '薬剤部': { gradient: 'from-[#a8edea] via-[#fed6e3] to-[#d299c2]', shadow: 'shadow-pink-500/50' },
  '事務部': { gradient: 'from-[#a8edea] via-[#fed6e3] to-[#d299c2]', shadow: 'shadow-blue-400/50' },
  '総務部': { gradient: 'from-[#a8edea] via-[#fed6e3] to-[#d299c2]', shadow: 'shadow-blue-400/50' },
  '経営企画部': { gradient: 'from-[#667eea] via-[#764ba2] to-[#9b59b6]', shadow: 'shadow-indigo-500/50' },
  '人事部': { gradient: 'from-[#f6d365] via-[#fda085] to-[#ff6b9d]', shadow: 'shadow-orange-500/50' },
  '施設管理部': { gradient: 'from-[#ffd89b] via-[#ffb870] to-[#ff9770]', shadow: 'shadow-yellow-500/50' },
  '温泉療法科': { gradient: 'from-[#84fab0] via-[#8fd3f4] to-[#a6c0fe]', shadow: 'shadow-cyan-500/50' }
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
  const departmentData = MEDICAL_DEPARTMENT_COLORS[user.department];
  const defaultGradient = RICH_GRADIENTS[hash % RICH_GRADIENTS.length];
  const departmentIcon = DEPARTMENT_ICONS[user.department] || '👤';
  
  return {
    gradient: departmentData?.gradient || defaultGradient.colors,
    shadowClass: departmentData?.shadow || defaultGradient.shadow,
    primaryText: user.name.charAt(0),
    secondaryText: user.department.slice(0, 2),
    icon: departmentIcon,
    borderColor: 'border-white',
    textColor: 'text-white',
    isRichGradient: true
  };
};

// 部署レベルアバター生成
export const generateDepartmentAvatar = (department: string, userId?: string) => {
  const hash = userId ? generateHash(userId) : generateHash(department);
  const departmentData = MEDICAL_DEPARTMENT_COLORS[department];
  const defaultGradient = RICH_GRADIENTS[hash % RICH_GRADIENTS.length];
  const departmentIcon = DEPARTMENT_ICONS[department] || '🏢';
  
  return {
    gradient: departmentData?.gradient || defaultGradient.colors,
    shadowClass: departmentData?.shadow || defaultGradient.shadow,
    primaryText: department.slice(0, 2),
    secondaryText: '',
    icon: departmentIcon,
    borderColor: 'border-gray-300',
    textColor: 'text-white',
    isRichGradient: true
  };
};

// 施設レベルアバター生成
export const generateFacilityAvatar = (facility: string, userId?: string) => {
  const hash = userId ? generateHash(userId) : generateHash(facility);
  const facilityColors = {
    '小原病院': { gradient: 'from-[#4facfe] via-[#00d2ff] to-[#0099ff]', shadow: 'shadow-blue-500/50' },
    '立神リハ温泉病院': { gradient: 'from-[#84fab0] via-[#8fd3f4] to-[#3bb78f]', shadow: 'shadow-green-500/50' },
    '本部': { gradient: 'from-[#667eea] via-[#764ba2] to-[#9b59b6]', shadow: 'shadow-purple-500/50' }
  };
  
  const facilityIcons = {
    '小原病院': '🏥',
    '立神リハ温泉病院': '♨️',
    '本部': '🏢'
  };
  
  const colorData = facilityColors[facility];
  const defaultGradient = RICH_GRADIENTS[hash % RICH_GRADIENTS.length];
  const icon = facilityIcons[facility] || '🏢';
  
  return {
    gradient: colorData?.gradient || defaultGradient.colors,
    shadowClass: colorData?.shadow || defaultGradient.shadow,
    primaryText: facility.slice(0, 2),
    secondaryText: '',
    icon: icon,
    borderColor: 'border-gray-300',
    textColor: 'text-white',
    isRichGradient: true
  };
};

// 完全匿名アバター生成
export const generateAnonymousAvatar = (postId: string) => {
  const hash = generateHash(postId);
  // 匿名時はモノクロームグラデーション
  const anonymousGradients = [
    { gradient: 'from-gray-400 via-gray-500 to-gray-600', shadow: 'shadow-gray-500/30' },
    { gradient: 'from-slate-400 via-slate-500 to-slate-600', shadow: 'shadow-slate-500/30' },
    { gradient: 'from-zinc-400 via-zinc-500 to-zinc-600', shadow: 'shadow-zinc-500/30' },
    { gradient: 'from-neutral-400 via-neutral-500 to-neutral-600', shadow: 'shadow-neutral-500/30' }
  ];
  const colorData = anonymousGradients[hash % anonymousGradients.length];
  const icon = ANONYMOUS_ICONS[hash % ANONYMOUS_ICONS.length];
  
  return {
    gradient: colorData.gradient,
    shadowClass: colorData.shadow,
    primaryText: '',
    secondaryText: '',
    icon: icon,
    borderColor: 'border-gray-400',
    textColor: 'text-white',
    isRichGradient: false
  };
};

// 匿名性レベルに応じたアバター生成（Post用）
export const generateAvatarByAnonymity = (
  anonymityLevel: AnonymityLevel, 
  user: User, 
  postId?: string
) => {
  switch (anonymityLevel) {
    case 'anonymous':
      return generateAnonymousAvatar(postId || user.id);
    case 'department_only':
      return generateDepartmentAvatar(user.department, user.id);
    case 'facility_anonymous':
    case 'facility_department':
      // 施設情報を取得（デモデータから）
      const facility = getFacilityFromDepartment(user.department);
      return generateFacilityAvatar(facility, user.id);
    case 'real_name':
    default:
      return generatePersonalAvatar(user);
  }
};

// コメント用のプライバシーレベルに応じたアバター生成
export const generateAvatarByCommentPrivacy = (
  privacyLevel: CommentPrivacyLevel, 
  user: User, 
  commentId?: string
) => {
  switch (privacyLevel) {
    case 'anonymous':
      return generateAnonymousAvatar(commentId || user.id);
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

// アバター表示用の名前生成（Post用）
export const getDisplayName = (
  anonymityLevel: AnonymityLevel,
  user: User
): string => {
  switch (anonymityLevel) {
    case 'anonymous':
      return '匿名ユーザー';
    case 'department_only':
      return `${user.department} 職員`;
    case 'facility_anonymous':
      const facility = getFacilityFromDepartment(user.department);
      return `${facility} 職員`;
    case 'facility_department':
      const facility2 = getFacilityFromDepartment(user.department);
      return `${user.department} (${facility2})`;
    case 'real_name':
    default:
      return `${user.name} (${user.position || user.department})`;
  }
};

// コメント用の表示名生成
export const getCommentDisplayName = (
  privacyLevel: CommentPrivacyLevel,
  user: User
): string => {
  switch (privacyLevel) {
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