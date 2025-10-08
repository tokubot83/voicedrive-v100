import { PostVisibilityEngine } from './PostVisibilityEngine';
import { Post, User, VoteOption } from '../types';

describe('PostVisibilityEngine - 段階的閲覧制御', () => {
  let visibilityEngine: PostVisibilityEngine;

  beforeEach(() => {
    visibilityEngine = new PostVisibilityEngine();
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

  describe('PENDING/TEAMレベル（0-99点）', () => {
    test('同一部署のユーザーは閲覧可能', () => {
      const post = createPost(50, 'リハビリテーション科');
      const user = createUser('リハビリテーション科', 5);

      const config = visibilityEngine.getDisplayConfig(post, user);

      expect(config.canView).toBe(true);
      expect(config.showVoteButtons).toBe(true);
    });

    test('他部署の一般ユーザーは閲覧不可', () => {
      const post = createPost(50, 'リハビリテーション科');
      const user = createUser('看護部', 5);

      const config = visibilityEngine.getDisplayConfig(post, user);

      expect(config.canView).toBe(false);
      expect(config.viewRestrictionReason).toContain('他部署での検討中案件');
    });

    test('管理職（Lv.8以上）は他部署でも閲覧可能', () => {
      const post = createPost(50, 'リハビリテーション科');
      const user = createUser('看護部', 8);

      const config = visibilityEngine.getDisplayConfig(post, user);

      expect(config.canView).toBe(true);
      expect(config.showVoteButtons).toBe(false); // 投票は不可
    });
  });

  describe('DEPARTMENTレベル（100-299点）', () => {
    test('同一部署のユーザーは閲覧・投票可能', () => {
      const post = createPost(150, 'リハビリテーション科');
      const user = createUser('リハビリテーション科', 5);

      const config = visibilityEngine.getDisplayConfig(post, user);

      expect(config.canView).toBe(true);
      expect(config.showVoteButtons).toBe(true);
    });

    test('同一施設の一般ユーザーは閲覧不可', () => {
      const post = createPost(150, 'リハビリテーション科');
      const user = createUser('看護部', 5); // 同一施設（立神病院）

      const config = visibilityEngine.getDisplayConfig(post, user);

      expect(config.canView).toBe(false);
    });

    test('同一施設の管理職は閲覧可能（投票不可）', () => {
      const post = createPost(150, 'リハビリテーション科');
      const user = createUser('看護部', 8);

      const config = visibilityEngine.getDisplayConfig(post, user);

      expect(config.canView).toBe(true);
      expect(config.showVoteButtons).toBe(false);
    });
  });

  describe('FACILITYレベル以上（300点以上）', () => {
    test('施設レベルでは全員閲覧可能', () => {
      const post = createPost(400, 'リハビリテーション科');
      const user = createUser('医療情報部', 5); // 他施設（小原病院）

      const config = visibilityEngine.getDisplayConfig(post, user);

      expect(config.canView).toBe(true);
    });

    test('同一施設のユーザーは投票可能', () => {
      const post = createPost(400, 'リハビリテーション科');
      const user = createUser('看護部', 5); // 同一施設

      const config = visibilityEngine.getDisplayConfig(post, user);

      expect(config.canView).toBe(true);
      expect(config.showVoteButtons).toBe(true);
    });

    test('他施設のユーザーは閲覧のみ', () => {
      const post = createPost(400, 'リハビリテーション科');
      const user = createUser('医療情報部', 5); // 他施設

      const config = visibilityEngine.getDisplayConfig(post, user);

      expect(config.canView).toBe(true);
      expect(config.showVoteButtons).toBe(false);
    });
  });

  describe('ORGANIZATIONレベル（800点以上）', () => {
    test('法人レベルでは全員が閲覧・投票可能', () => {
      const post = createPost(900, 'リハビリテーション科');
      const user = createUser('医療情報部', 5); // 他施設

      const config = visibilityEngine.getDisplayConfig(post, user);

      expect(config.canView).toBe(true);
      expect(config.showVoteButtons).toBe(true);
      expect(config.showCommentForm).toBe(true);
    });
  });

  describe('権限制限メッセージ', () => {
    test('PENDING時の他部署ユーザーへのメッセージ', () => {
      const post = createPost(50, 'リハビリテーション科');
      const user = createUser('看護部', 5);

      const config = visibilityEngine.getDisplayConfig(post, user);

      expect(config.viewRestrictionReason).toBe('他部署での検討中案件のため、閲覧できません');
    });

    test('DEPARTMENT時の他施設ユーザーへのメッセージ', () => {
      const post = createPost(250, 'リハビリテーション科'); // 200点以上でDEPARTMENTレベル
      const user = createUser('医療情報部', 5); // 他施設（小原病院）

      const config = visibilityEngine.getDisplayConfig(post, user);

      expect(config.viewRestrictionReason).toBe('他施設のプロジェクトのため、閲覧できません');
    });
  });
});
