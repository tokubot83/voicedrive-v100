// 役職マスターデータ（権限レベル対応）
import { PermissionLevel } from '../../permissions/types/PermissionTypes';

export const POSITIONS = {
  'director': {
    id: 'director',
    name: '院長',
    permissionLevel: PermissionLevel.LEVEL_8, // 理事長
    votingWeightMultiplier: 3.0,
    approvalAuthority: 'highest'
  },
  'vice_director': {
    id: 'vice_director',
    name: '副院長',
    permissionLevel: PermissionLevel.LEVEL_7, // 役員・法人本部事務局長
    votingWeightMultiplier: 2.5,
    approvalAuthority: 'very_high'
  },
  'nursing_director': {
    id: 'nursing_director',
    name: '看護部長',
    permissionLevel: PermissionLevel.LEVEL_6, // 人財統括本部統括管理部門長
    votingWeightMultiplier: 2.2,
    approvalAuthority: 'high'
  },
  'ward_manager': {
    id: 'ward_manager',
    name: '病棟師長',
    permissionLevel: PermissionLevel.LEVEL_5, // 人財統括本部部門長
    votingWeightMultiplier: 2.0,
    approvalAuthority: 'high'
  },
  'ward_supervisor': {
    id: 'ward_supervisor',
    name: '病棟主任',
    permissionLevel: PermissionLevel.LEVEL_4, // 施設管理者
    votingWeightMultiplier: 1.8,
    approvalAuthority: 'medium'
  },
  'office_manager': {
    id: 'office_manager',
    name: '事務長',
    permissionLevel: PermissionLevel.LEVEL_5, // 人財統括本部部門長
    votingWeightMultiplier: 2.0,
    approvalAuthority: 'high'
  },
  'department_chief': {
    id: 'department_chief',
    name: '科長・部門長',
    permissionLevel: PermissionLevel.LEVEL_4, // 施設管理者
    votingWeightMultiplier: 1.8,
    approvalAuthority: 'medium'
  },
  'supervisor': {
    id: 'supervisor',
    name: '主任',
    permissionLevel: PermissionLevel.LEVEL_3, // 部署長
    votingWeightMultiplier: 1.5,
    approvalAuthority: 'medium'
  },
  'team_leader': {
    id: 'team_leader',
    name: 'チームリーダー',
    permissionLevel: PermissionLevel.LEVEL_2, // チーム・主任
    votingWeightMultiplier: 1.3,
    approvalAuthority: 'low'
  },
  'general_staff': {
    id: 'general_staff',
    name: '一般職員',
    permissionLevel: PermissionLevel.LEVEL_1, // 一般職員
    votingWeightMultiplier: 1.0,
    approvalAuthority: 'basic'
  }
};