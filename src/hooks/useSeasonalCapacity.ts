import { useState, useEffect, useCallback } from 'react';
import { SeasonalManager } from '../utils/SeasonalManager';

interface UseSeasonalCapacityResult {
  currentSeason: string;
  capacityInfo: any;
  capacityStatus: any;
  checkCanSubmit: (currentCount: number) => boolean;
  getSeasonalAdvice: (activityType: string) => any;
  refreshSeasonInfo: () => void;
}

export const useSeasonalCapacity = (currentProposalCount: number = 0): UseSeasonalCapacityResult => {
  const [manager] = useState(() => new SeasonalManager());
  const [currentSeason, setCurrentSeason] = useState(manager.getCurrentSeason());
  const [capacityInfo, setCapacityInfo] = useState(manager.getCapacityInfo());
  const [capacityStatus, setCapacityStatus] = useState(manager.checkCapacityStatus(currentProposalCount));

  useEffect(() => {
    const updateStatus = () => {
      const status = manager.checkCapacityStatus(currentProposalCount);
      setCapacityStatus(status);
    };

    updateStatus();
  }, [currentProposalCount, manager]);

  const checkCanSubmit = useCallback((count: number) => {
    const status = manager.checkCapacityStatus(count);
    return status.canAccept;
  }, [manager]);

  const getSeasonalAdvice = useCallback((activityType: string) => {
    return manager.getSeasonalAdvice(activityType);
  }, [manager]);

  const refreshSeasonInfo = useCallback(() => {
    const newManager = new SeasonalManager();
    setCurrentSeason(newManager.getCurrentSeason());
    setCapacityInfo(newManager.getCapacityInfo());
    setCapacityStatus(newManager.checkCapacityStatus(currentProposalCount));
  }, [currentProposalCount]);

  useEffect(() => {
    const checkSeasonChange = setInterval(() => {
      const newSeason = new SeasonalManager().getCurrentSeason();
      if (newSeason !== currentSeason) {
        refreshSeasonInfo();
      }
    }, 60000);

    return () => clearInterval(checkSeasonChange);
  }, [currentSeason, refreshSeasonInfo]);

  return {
    currentSeason,
    capacityInfo,
    capacityStatus,
    checkCanSubmit,
    getSeasonalAdvice,
    refreshSeasonInfo
  };
};