import { User } from '../types';

// カバー画像のパターン定義
export interface CoverPattern {
  type: 'gradient' | 'geometric' | 'wave' | 'abstract';
  colors: string;
  pattern?: string;
  opacity?: number;
}

// 部署別のカバーパターン
const DEPARTMENT_COVER_PATTERNS: Record<string, CoverPattern> = {
  '看護部': {
    type: 'wave',
    colors: 'from-[#ff9a9e] via-[#fecfef] to-[#ffecd2]',
    opacity: 0.9
  },
  '医局': {
    type: 'geometric',
    colors: 'from-[#667eea] via-[#764ba2] to-[#9b59b6]',
    opacity: 0.85
  },
  'リハビリテーション科': {
    type: 'abstract',
    colors: 'from-[#ffecd2] via-[#fcb69f] to-[#ff8a80]',
    opacity: 0.9
  },
  'リハビリテーション部': {
    type: 'abstract',
    colors: 'from-[#ffecd2] via-[#fcb69f] to-[#ff8a80]',
    opacity: 0.9
  },
  '薬剤部': {
    type: 'gradient',
    colors: 'from-[#a8edea] via-[#fed6e3] to-[#d299c2]',
    opacity: 0.85
  },
  '事務部': {
    type: 'geometric',
    colors: 'from-[#4facfe] via-[#00d2ff] to-[#00f2fe]',
    opacity: 0.8
  },
  '総務部': {
    type: 'geometric',
    colors: 'from-[#4facfe] via-[#00d2ff] to-[#00f2fe]',
    opacity: 0.8
  },
  '経営企画部': {
    type: 'gradient',
    colors: 'from-[#667eea] via-[#764ba2] to-[#9b59b6]',
    opacity: 0.85
  },
  '人事部': {
    type: 'wave',
    colors: 'from-[#f6d365] via-[#fda085] to-[#ff6b9d]',
    opacity: 0.9
  },
  '施設管理部': {
    type: 'abstract',
    colors: 'from-[#ffd89b] via-[#ffb870] to-[#ff9770]',
    opacity: 0.85
  },
  '温泉療法科': {
    type: 'wave',
    colors: 'from-[#84fab0] via-[#8fd3f4] to-[#a6c0fe]',
    opacity: 0.9
  }
};

// デフォルトパターン
const DEFAULT_PATTERNS: CoverPattern[] = [
  {
    type: 'gradient',
    colors: 'from-[#667eea] via-[#764ba2] to-[#f093fb]',
    opacity: 0.85
  },
  {
    type: 'wave',
    colors: 'from-[#ff6b6b] via-[#feca57] to-[#48dbfb]',
    opacity: 0.9
  },
  {
    type: 'geometric',
    colors: 'from-[#a8edea] via-[#fed6e3] to-[#d299c2]',
    opacity: 0.8
  },
  {
    type: 'abstract',
    colors: 'from-[#84fab0] via-[#8fd3f4] to-[#a6c0fe]',
    opacity: 0.9
  }
];

// SVGパターン生成
export const generateSVGPattern = (type: string, id: string): string => {
  switch (type) {
    case 'wave':
      return `
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="${id}" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <path d="M0,50 Q25,30 50,50 T100,50 L100,100 L0,100 Z" fill="rgba(255,255,255,0.1)" />
              <path d="M0,30 Q25,10 50,30 T100,30 L100,50 L0,50 Z" fill="rgba(255,255,255,0.15)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#${id})" />
        </svg>
      `;
    
    case 'geometric':
      return `
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="${id}" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <polygon points="30,0 60,30 30,60 0,30" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
              <circle cx="30" cy="30" r="10" fill="rgba(255,255,255,0.05)"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#${id})" />
        </svg>
      `;
    
    case 'abstract':
      return `
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="${id}" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              <circle cx="20" cy="20" r="15" fill="rgba(255,255,255,0.08)" />
              <circle cx="60" cy="60" r="20" fill="rgba(255,255,255,0.06)" />
              <path d="M40,0 Q60,20 40,40 T40,80" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="2"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#${id})" />
        </svg>
      `;
    
    default: // gradient
      return '';
  }
};

// ハッシュ生成（avatarGeneratorと同じ）
const generateHash = (input: string): number => {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
};

// プロフィールカバー生成
export const generateProfileCover = (user: User): {
  pattern: CoverPattern;
  svgPattern: string;
} => {
  const departmentPattern = DEPARTMENT_COVER_PATTERNS[user.department];
  const hash = generateHash(user.id + user.name);
  const defaultPattern = DEFAULT_PATTERNS[hash % DEFAULT_PATTERNS.length];
  
  const pattern = departmentPattern || defaultPattern;
  const patternId = `pattern-${user.id}`;
  const svgPattern = pattern.type !== 'gradient' ? generateSVGPattern(pattern.type, patternId) : '';
  
  return {
    pattern,
    svgPattern
  };
};

// 施設別カバー生成
export const generateFacilityCover = (facility: string): {
  pattern: CoverPattern;
  svgPattern: string;
} => {
  const facilityPatterns: Record<string, CoverPattern> = {
    '小原病院': {
      type: 'wave',
      colors: 'from-[#4facfe] via-[#00d2ff] to-[#0099ff]',
      opacity: 0.85
    },
    '立神リハ温泉病院': {
      type: 'abstract',
      colors: 'from-[#84fab0] via-[#8fd3f4] to-[#3bb78f]',
      opacity: 0.9
    },
    '本部': {
      type: 'geometric',
      colors: 'from-[#667eea] via-[#764ba2] to-[#9b59b6]',
      opacity: 0.8
    }
  };
  
  const pattern = facilityPatterns[facility] || DEFAULT_PATTERNS[0];
  const patternId = `pattern-${facility}`;
  const svgPattern = pattern.type !== 'gradient' ? generateSVGPattern(pattern.type, patternId) : '';
  
  return {
    pattern,
    svgPattern
  };
};