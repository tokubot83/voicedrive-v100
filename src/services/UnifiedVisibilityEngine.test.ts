import { UnifiedVisibilityEngine } from './UnifiedVisibilityEngine';
import { systemModeManager, SystemMode } from '../config/systemMode';
import { Post, User } from '../types';

// LocalStorageモック
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

Object.defineProperty(global, 'localStorage', { value: localStorageMock });

describe('UnifiedVisibilityEngine - モード自動切替', () => {
  let unifiedEngine: UnifiedVisibilityEngine;

  beforeEach(() => {
    // LocalStorageをクリア
    localStorage.clear();
    unifiedEngine = new UnifiedVisibilityEngine();
  });

  // テスト用ユーザー
  const createUser = (department: string, permissionLevel: number = 5): User => ({
    id: `user-${department}`,
    name: `テストユーザー${department}`,
    department,
    role: '職員',
    permissionLevel
  });

  // テスト用投稿
  const createPost = (score: number, authorDepartment: string = 'リハビリテーション科'): Post => ({
    id: 'test-post',
    type: 'improvement',
    content: 'テスト投稿',
    author: createUser(authorDepartment),
    anonymityLevel: 'real_name',
    priority: 'medium',
    timestamp: new Date(),
    votes: {
      'strongly-oppose': 0,
      'oppose': 0,
      'neutral': 0,
      'support': 0,
      'strongly-support': 0
    },
    comments: [],
    projectStatus: {
      stage: 'active',
      score,
      threshold: 400,
      progress: (score / 400) * 100
    }
  });

  describe('プロジェクト化モード', () => {
    beforeEach(() => {
      // プロジェクト化モードに設定
      const adminUser = createUser('経営企画部', 99);
      systemModeManager.setMode(SystemMode.PROJECT, adminUser);
    });

    test('検討中案件は同一部署のみ閲覧可能', () => {
      const post = createPost(50, 'リハビリテーション科');
      const sameUser = createUser('リハビリテーション科', 5);
      const otherUser = createUser('看護部', 5);

      const sameDeptConfig = unifiedEngine.getDisplayConfig(post, sameUser);
      const otherDeptConfig = unifiedEngine.getDisplayConfig(post, otherUser);

      expect(sameDeptConfig.canView).toBe(true);
      expect(otherDeptConfig.canView).toBe(false);
    });

    test('施設レベルでは全員閲覧可能', () => {
      const post = createPost(450, 'リハビリテーション科');
      const otherFacilityUser = createUser('医療情報部', 5); // 他施設

      const config = unifiedEngine.getDisplayConfig(post, otherFacilityUser);

      expect(config.canView).toBe(true);
      expect(config.showVoteButtons).toBe(false); // 他施設なので投票不可
    });
  });

  describe('議題モード', () => {
    beforeEach(() => {
      // 議題モードに設定
      const adminUser = createUser('経営企画部', 99);
      systemModeManager.setMode(SystemMode.AGENDA, adminUser);
    });

    test('検討中案件は同一部署のみ閲覧可能', () => {
      const post = createPost(20, 'リハビリテーション科'); // 0-29点 = PENDING
      const sameUser = createUser('リハビリテーション科', 5);
      const otherUser = createUser('看護部', 5);

      const sameDeptConfig = unifiedEngine.getDisplayConfig(post, sameUser);
      const otherDeptConfig = unifiedEngine.getDisplayConfig(post, otherUser);

      expect(sameDeptConfig.canView).toBe(true);
      expect(otherDeptConfig.canView).toBe(false);
    });

    test('施設議題（100-299点）では法人内全員閲覧可能', () => {
      const post = createPost(150, 'リハビリテーション科');
      const otherFacilityUser = createUser('医療情報部', 5);

      const config = unifiedEngine.getDisplayConfig(post, otherFacilityUser);

      expect(config.canView).toBe(true); // 議題モードでは100点以上で全員閲覧可
      expect(config.showVoteButtons).toBe(false); // 他施設なので投票不可
    });
  });

  describe('モード切替の動作確認', () => {
    test('モード切替時に表示設定が変わる', () => {
      const post = createPost(150, 'リハビリテーション科');
      const otherFacilityUser = createUser('医療情報部', 5);
      const adminUser = createUser('経営企画部', 99);

      // プロジェクト化モード
      systemModeManager.setMode(SystemMode.PROJECT, adminUser);
      const projectConfig = unifiedEngine.getDisplayConfig(post, otherFacilityUser);

      // 議題モード
      systemModeManager.setMode(SystemMode.AGENDA, adminUser);
      const agendaConfig = unifiedEngine.getDisplayConfig(post, otherFacilityUser);

      // プロジェクト化モード: 150点はTEAMレベル → 他施設は閲覧不可
      expect(projectConfig.canView).toBe(false);

      // 議題モード: 150点は施設議題レベル → 他施設も閲覧可能
      expect(agendaConfig.canView).toBe(true);
    });
  });

  describe('モード情報取得', () => {
    test('現在のモードを取得できる', () => {
      const adminUser = createUser('経営企画部', 99);

      systemModeManager.setMode(SystemMode.AGENDA, adminUser);
      expect(unifiedEngine.getCurrentMode()).toBe(SystemMode.AGENDA);

      systemModeManager.setMode(SystemMode.PROJECT, adminUser);
      expect(unifiedEngine.getCurrentMode()).toBe(SystemMode.PROJECT);
    });

    test('モード説明を取得できる', () => {
      const adminUser = createUser('経営企画部', 99);

      systemModeManager.setMode(SystemMode.AGENDA, adminUser);
      expect(unifiedEngine.getModeDescription()).toContain('議題システムモード');

      systemModeManager.setMode(SystemMode.PROJECT, adminUser);
      expect(unifiedEngine.getModeDescription()).toContain('プロジェクト化モード');
    });
  });
});
