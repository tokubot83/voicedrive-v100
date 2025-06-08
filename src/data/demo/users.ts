import { User, StakeholderCategory } from '../../types';

export interface DemoUser extends User {
  permissionLevel: number;
  email: string;
  position: string;
  joinDate: Date;
  directReports?: number;
  stakeholderCategory: StakeholderCategory;
}

// Permission levels:
// 1: Entry-level employee
// 2: Senior employee
// 3: Team lead
// 4: Supervisor
// 5: Manager
// 6: Senior Manager
// 7: Director
// 8: Executive

export const demoUsers: DemoUser[] = [
  // Level 1: Entry-level employees
  {
    id: 'user-1',
    name: '田中太郎',
    department: '営業部',
    role: 'employee',
    position: '営業担当',
    permissionLevel: 1,
    email: 'tanaka.taro@voicedrive.jp',
    joinDate: new Date('2023-04-01'),
    stakeholderCategory: 'zGen' as StakeholderCategory,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tanaka'
  },
  {
    id: 'user-2',
    name: '佐藤花子',
    department: '人事部',
    role: 'employee',
    position: '人事担当',
    permissionLevel: 1,
    email: 'sato.hanako@voicedrive.jp',
    joinDate: new Date('2023-06-15'),
    stakeholderCategory: 'zGen' as StakeholderCategory,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sato'
  },
  
  // Level 2: Senior employees
  {
    id: 'user-3',
    name: '山田一郎',
    department: '技術部',
    role: 'employee',
    position: 'シニアエンジニア',
    permissionLevel: 2,
    email: 'yamada.ichiro@voicedrive.jp',
    joinDate: new Date('2021-09-01'),
    stakeholderCategory: 'frontline' as StakeholderCategory,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=yamada'
  },
  {
    id: 'user-4',
    name: '鈴木美咲',
    department: 'マーケティング部',
    role: 'employee',
    position: 'シニアマーケター',
    permissionLevel: 2,
    email: 'suzuki.misaki@voicedrive.jp',
    joinDate: new Date('2022-03-20'),
    stakeholderCategory: 'frontline' as StakeholderCategory,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=suzuki'
  },
  
  // Level 3: Team leads
  {
    id: 'user-5',
    name: '高橋健太',
    department: '製造部',
    role: 'chief',
    position: 'チームリーダー',
    permissionLevel: 3,
    email: 'takahashi.kenta@voicedrive.jp',
    joinDate: new Date('2020-11-01'),
    directReports: 8,
    stakeholderCategory: 'frontline' as StakeholderCategory,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=takahashi'
  },
  {
    id: 'user-6',
    name: '伊藤さくら',
    department: 'カスタマーサポート部',
    role: 'chief',
    position: 'チームリーダー',
    permissionLevel: 3,
    email: 'ito.sakura@voicedrive.jp',
    joinDate: new Date('2021-02-15'),
    directReports: 6,
    stakeholderCategory: 'frontline' as StakeholderCategory,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ito'
  },
  
  // Level 4: Supervisors
  {
    id: 'user-7',
    name: '渡辺大輔',
    department: '品質管理部',
    role: 'chief',
    position: 'スーパーバイザー',
    permissionLevel: 4,
    email: 'watanabe.daisuke@voicedrive.jp',
    joinDate: new Date('2019-07-01'),
    directReports: 12,
    stakeholderCategory: 'veteran' as StakeholderCategory,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=watanabe'
  },
  
  // Level 5: Managers
  {
    id: 'user-8',
    name: '中村恵子',
    department: '財務部',
    role: 'manager',
    position: 'マネージャー',
    permissionLevel: 5,
    email: 'nakamura.keiko@voicedrive.jp',
    joinDate: new Date('2018-04-10'),
    directReports: 15,
    stakeholderCategory: 'management' as StakeholderCategory,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nakamura'
  },
  {
    id: 'user-9',
    name: '小林勇気',
    department: 'IT部',
    role: 'manager',
    position: 'ITマネージャー',
    permissionLevel: 5,
    email: 'kobayashi.yuki@voicedrive.jp',
    joinDate: new Date('2017-09-01'),
    directReports: 20,
    stakeholderCategory: 'management' as StakeholderCategory,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kobayashi'
  },
  
  // Level 6: Senior Managers
  {
    id: 'user-10',
    name: '加藤真理',
    department: '事業開発部',
    role: 'manager',
    position: 'シニアマネージャー',
    permissionLevel: 6,
    email: 'kato.mari@voicedrive.jp',
    joinDate: new Date('2016-05-01'),
    directReports: 25,
    stakeholderCategory: 'veteran' as StakeholderCategory,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kato'
  },
  {
    id: 'user-11',
    name: '斎藤孝',
    department: '戦略企画部',
    role: 'manager',
    position: 'シニアマネージャー',
    permissionLevel: 6,
    email: 'saito.takashi@voicedrive.jp',
    joinDate: new Date('2015-10-15'),
    directReports: 18,
    stakeholderCategory: 'veteran' as StakeholderCategory,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=saito'
  },
  
  // Level 7: Directors
  {
    id: 'user-12',
    name: '藤田洋平',
    department: '営業本部',
    role: 'executive',
    position: '営業本部長',
    permissionLevel: 7,
    email: 'fujita.yohei@voicedrive.jp',
    joinDate: new Date('2014-04-01'),
    directReports: 45,
    stakeholderCategory: 'management' as StakeholderCategory,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=fujita'
  },
  {
    id: 'user-13',
    name: '松本由美',
    department: '技術本部',
    role: 'executive',
    position: '技術本部長',
    permissionLevel: 7,
    email: 'matsumoto.yumi@voicedrive.jp',
    joinDate: new Date('2013-07-01'),
    directReports: 60,
    stakeholderCategory: 'management' as StakeholderCategory,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=matsumoto'
  },
  
  // Level 8: Executives
  {
    id: 'user-14',
    name: '森田誠',
    department: '経営企画室',
    role: 'executive',
    position: '代表取締役社長',
    permissionLevel: 8,
    email: 'morita.makoto@voicedrive.jp',
    joinDate: new Date('2010-01-01'),
    directReports: 8,
    stakeholderCategory: 'management' as StakeholderCategory,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=morita'
  },
  {
    id: 'user-15',
    name: '橋本明美',
    department: '経営企画室',
    role: 'executive',
    position: '取締役副社長',
    permissionLevel: 8,
    email: 'hashimoto.akemi@voicedrive.jp',
    joinDate: new Date('2011-04-01'),
    directReports: 6,
    stakeholderCategory: 'management' as StakeholderCategory,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=hashimoto'
  }
];

// Helper function to get user by ID
export const getDemoUserById = (id: string): DemoUser | undefined => {
  return demoUsers.find(user => user.id === id);
};

// Helper function to get users by permission level
export const getDemoUsersByPermissionLevel = (level: number): DemoUser[] => {
  return demoUsers.filter(user => user.permissionLevel === level);
};

// Helper function to get users by department
export const getDemoUsersByDepartment = (department: string): DemoUser[] => {
  return demoUsers.filter(user => user.department === department);
};

// Current logged-in demo user (default to level 5 manager)
export const getCurrentDemoUser = (): DemoUser => {
  return demoUsers[7]; // Default to user-8 (Manager)
};