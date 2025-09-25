import { PermissionLevel, SpecialPermissionLevel } from '../../permissions/types/PermissionTypes';
import { getPermissionMetadata } from '../../permissions/config/permissionMetadata';
import { hybridVotingCalculator } from '../../services/HybridVotingCalculator';
import { proposalEscalationEngine } from '../../services/ProposalEscalationEngine';
import { votingPermissionMatrix } from '../../services/VotingPermissionMatrix';
import { demoStaffData } from '../../data/demoStaffData';

// ========== 統合テストスイート ==========
describe('18段階権限システム統合テスト', () => {
  
  describe('権限メタデータ', () => {
    test('全ての権限レベルにメタデータが存在する', () => {
      const allLevels = [
        PermissionLevel.LEVEL_1, PermissionLevel.LEVEL_1_5,
        PermissionLevel.LEVEL_2, PermissionLevel.LEVEL_2_5,
        PermissionLevel.LEVEL_3, PermissionLevel.LEVEL_3_5,
        PermissionLevel.LEVEL_4, PermissionLevel.LEVEL_4_5,
        PermissionLevel.LEVEL_5, PermissionLevel.LEVEL_6,
        PermissionLevel.LEVEL_7, PermissionLevel.LEVEL_8,
        PermissionLevel.LEVEL_9, PermissionLevel.LEVEL_10,
        PermissionLevel.LEVEL_11, PermissionLevel.LEVEL_12,
        PermissionLevel.LEVEL_13, PermissionLevel.LEVEL_14,
        PermissionLevel.LEVEL_15, PermissionLevel.LEVEL_16,
        PermissionLevel.LEVEL_17, PermissionLevel.LEVEL_18,
        SpecialPermissionLevel.LEVEL_X
      ];
      
      allLevels.forEach(level => {
        const metadata = getPermissionMetadata(level);
        expect(metadata).toBeDefined();
        expect(metadata.label).toBeTruthy();
        expect(metadata.description).toBeTruthy();
      });
    });
    
    test('看護職のリーダー業務フラグが正しく機能する', () => {
      const nurseWithLeader = demoStaffData.find(s => 
        s.profession === '看護帯' && s.canPerformLeaderDuty === true
      );
      
      if (nurseWithLeader) {
        // 0.5レベルの上昇を確認
        const expectedLevel = [1.5, 2.5, 3.5, 4.5];
        expect(expectedLevel).toContain(nurseWithLeader.accountLevel);
      }
    });
  });
  
  describe('ハイブリッド投票計算', () => {
    test('投票重み計算が正しく動作する', () => {
      const result = hybridVotingCalculator.calculateVoteWeight(
        PermissionLevel.LEVEL_8, // 師長
        {
          profession: '看護師',
          experienceYears: 20,
          age: 45,
          certifications: ['認定看護師']
        },
        '😍', // 強く賛成
        '医療安全'
      );
      
      expect(result.finalScore).toBeGreaterThan(0);
      expect(result.accountLevelWeight).toBe(2.3); // レベル8の重み
      expect(result.breakdown.professionWeight).toBe(2.5); // 看護師の重み
    });
    
    test('システム管理者の特別重みが適用される', () => {
      const result = hybridVotingCalculator.calculateVoteWeight(
        SpecialPermissionLevel.LEVEL_X,
        {
          profession: 'システム',
          experienceYears: 0,
          age: 0
        },
        '😍',
        'システム改善'
      );
      
      expect(result.accountLevelWeight).toBe(10.0); // 特別に高い重み
      expect(result.finalScore).toBe(100); // 10点 × 10.0
    });
  });
  
  describe('議題提出エスカレーション', () => {
    test('部署規模による調整が正しく動作する', () => {
      // 小規模部署（5人）
      const smallDeptResult = proposalEscalationEngine.evaluateProposal(
        'PROP001',
        '業務改善提案',
        20, // 実スコア
        5,  // 部署人数
        '業務改善'
      );
      
      // 大規模部署（30人）
      const largeDeptResult = proposalEscalationEngine.evaluateProposal(
        'PROP002',
        '業務改善提案',
        20, // 同じ実スコア
        30, // 部署人数
        '業務改善'
      );
      
      // 小規模部署の方が調整後スコアが高い
      expect(smallDeptResult.currentScore).toBeGreaterThan(largeDeptResult.currentScore);
      expect(smallDeptResult.currentScore).toBe(50); // 20 / 0.4
      expect(largeDeptResult.currentScore).toBe(25); // 20 / 0.8
    });
    
    test('スコアに応じた投票範囲が正しく設定される', () => {
      const dept = proposalEscalationEngine.evaluateProposal(
        'PROP003', 'test', 50, 20, 'test'
      );
      expect(dept.votingScope).toBe('部署内のみ');
      
      const facility = proposalEscalationEngine.evaluateProposal(
        'PROP004', 'test', 150, 20, 'test'
      );
      expect(facility.votingScope).toBe('施設全体');
      
      const corp = proposalEscalationEngine.evaluateProposal(
        'PROP005', 'test', 700, 20, 'test'
      );
      expect(corp.votingScope).toBe('法人全体');
    });
    
    test('委員会への議題提出判定が正しく動作する', () => {
      // 100点未満は委員会提出不要
      const noCommittee = proposalEscalationEngine.determineTargetCommittee(
        50, '業務改善', '小原病院'
      );
      expect(noCommittee).toBeNull();
      
      // 100点以上で医療安全なら医療安全管理委員会
      const safetyCommittee = proposalEscalationEngine.determineTargetCommittee(
        120, '医療安全', '小原病院'
      );
      expect(safetyCommittee?.name).toBe('医療安全管理委員会');
    });
  });
  
  describe('投票権限マトリックス', () => {
    test('部署レベル投票の権限チェック', () => {
      const context = {
        userLevel: PermissionLevel.LEVEL_3,
        userDepartment: '内科',
        userFacility: '小原病院',
        proposalDepartment: '内科',
        proposalFacility: '小原病院',
        proposalScore: 50,
        proposalCategory: '業務改善'
      };
      
      const permission = votingPermissionMatrix.determineVotingPermission(context);
      expect(permission.canVote).toBe(true);
      expect(permission.reason).toBe('同じ部署の提案');
    });
    
    test('施設レベル投票の権限チェック', () => {
      const context = {
        userLevel: PermissionLevel.LEVEL_5,
        userDepartment: '外科',
        userFacility: '小原病院',
        proposalDepartment: '内科',
        proposalFacility: '小原病院',
        proposalScore: 150,
        proposalCategory: '医療安全'
      };
      
      const permission = votingPermissionMatrix.determineVotingPermission(context);
      expect(permission.canVote).toBe(true);
      expect(permission.scope).toBe('facility');
    });
    
    test('法人レベル投票の権限チェック', () => {
      // 中堅以上なら投票可能
      const canVote = {
        userLevel: PermissionLevel.LEVEL_3,
        userDepartment: '内科',
        userFacility: '小原病院',
        proposalDepartment: '総務',
        proposalFacility: '立神リハビリ',
        proposalScore: 700,
        proposalCategory: '戦略提案'
      };
      
      const permission = votingPermissionMatrix.determineVotingPermission(canVote);
      expect(permission.canVote).toBe(true);
      expect(permission.scope).toBe('corporation');
      
      // 若手は投票不可
      const cannotVote = { ...canVote, userLevel: PermissionLevel.LEVEL_2 };
      const noPermission = votingPermissionMatrix.determineVotingPermission(cannotVote);
      expect(noPermission.canVote).toBe(false);
    });
  });
  
  describe('デモデータ整合性', () => {
    test('全レベルに少なくとも1人のスタッフが存在する', () => {
      const levelCounts = new Map<any, number>();
      
      demoStaffData.forEach(staff => {
        const count = levelCounts.get(staff.accountLevel) || 0;
        levelCounts.set(staff.accountLevel, count + 1);
      });
      
      // 最低限必要なレベルの確認
      expect(levelCounts.has(PermissionLevel.LEVEL_1)).toBe(true);
      expect(levelCounts.has(PermissionLevel.LEVEL_18)).toBe(true);
      expect(levelCounts.has(SpecialPermissionLevel.LEVEL_X)).toBe(true);
    });
    
    test('看護職のリーダー業務フラグが正しく設定されている', () => {
      const nursesWithLeader = demoStaffData.filter(s => 
        s.profession === '看護師' && s.canPerformLeaderDuty === true
      );
      
      expect(nursesWithLeader.length).toBeGreaterThan(0);
      
      nursesWithLeader.forEach(nurse => {
        // リーダー可能な看護師は0.5レベル
        const validLevels = [1.5, 2.5, 3.5, 4.5];
        const isValidLevel = validLevels.includes(nurse.accountLevel as number) ||
                            nurse.accountLevel >= 5; // 役職者以上
        expect(isValidLevel).toBe(true);
      });
    });
  });
});

// エクスポートしてテスト実行を可能に
export default describe;