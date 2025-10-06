// モード対応のレベル表示コンポーネント
import React from 'react';
import { systemModeManager, SystemMode } from '../../config/systemMode';
import { AgendaLevelIndicator } from '../post/AgendaLevelIndicator';
import ProjectLevelBadge from '../projects/ProjectLevelBadge';
import { agendaLevelEngine } from '../../systems/agenda/engines/AgendaLevelEngine';
import { projectLevelEngine } from '../../systems/project/engines/ProjectLevelEngine';
import { Post, User } from '../../types';

interface ModeAwareLevelIndicatorProps {
  post: Post;
  currentUser: User;
  currentScore: number;
  compact?: boolean;
  showNextLevel?: boolean;
  supportRate?: number;
  totalVotes?: number;
}

/**
 * システムモードに応じて適切なレベル表示を切り替えるコンポーネント
 */
export const ModeAwareLevelIndicator: React.FC<ModeAwareLevelIndicatorProps> = ({
  post,
  currentUser,
  currentScore,
  compact = false,
  showNextLevel = true,
  supportRate,
  totalVotes
}) => {
  const currentMode = systemModeManager.getCurrentMode();

  if (currentMode === SystemMode.AGENDA) {
    // 議題モード: AgendaLevelIndicatorを表示
    const agendaLevel = agendaLevelEngine.getAgendaLevel(currentScore);
    const permissions = agendaLevelEngine.getAgendaPermissions(post, currentUser, currentScore);

    return (
      <AgendaLevelIndicator
        agendaLevel={agendaLevel}
        currentScore={currentScore}
        permissions={permissions}
        supportRate={supportRate}
        totalVotes={totalVotes}
      />
    );
  } else {
    // プロジェクトモード: ProjectLevelBadgeを表示
    const projectLevel = projectLevelEngine.getProjectLevel(currentScore);
    const nextLevelInfo = projectLevelEngine.getScoreToNextLevel(currentScore);

    return (
      <ProjectLevelBadge
        level={projectLevel}
        score={currentScore}
        compact={compact}
        showNextLevel={showNextLevel && nextLevelInfo !== null}
        nextLevelInfo={nextLevelInfo ? {
          label: projectLevelEngine.getProjectLevelDescription(nextLevelInfo.nextLevel),
          remainingPoints: nextLevelInfo.requiredScore
        } : undefined}
      />
    );
  }
};

export default ModeAwareLevelIndicator;
