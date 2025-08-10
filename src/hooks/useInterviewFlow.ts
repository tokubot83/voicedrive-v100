import { useState, useCallback, useMemo } from 'react';
import { InterviewType, InterviewCategory } from '../types/interview';
import { 
  INTERVIEW_CLASSIFICATIONS,
  shouldShowCategorySelection 
} from '../utils/interviewMappingUtils';

export interface InterviewFlowState {
  currentStep: 1 | 2 | 3 | 4;
  selectedClassification?: 'regular' | 'special' | 'support';
  selectedType?: InterviewType;
  selectedCategory?: InterviewCategory;
  selectedDateTime?: Date;
  selectedStaff?: string;
}

export interface UseInterviewFlowReturn {
  flowState: InterviewFlowState;
  selectClassification: (classification: 'regular' | 'special' | 'support') => void;
  selectType: (type: InterviewType) => void;
  selectCategory: (category: InterviewCategory) => void;
  selectDateTime: (dateTime: Date, staff: string) => void;
  goBack: () => void;
  reset: () => void;
  canProceed: boolean;
  availableTypes: InterviewType[];
  needsCategory: boolean;
}

const initialState: InterviewFlowState = {
  currentStep: 1
};

export const useInterviewFlow = (): UseInterviewFlowReturn => {
  const [flowState, setFlowState] = useState<InterviewFlowState>(initialState);

  const availableTypes = useMemo(() => {
    if (!flowState.selectedClassification) return [];
    const classification = INTERVIEW_CLASSIFICATIONS.find(
      c => c.id === flowState.selectedClassification
    );
    return classification?.types || [];
  }, [flowState.selectedClassification]);

  const needsCategory = useMemo(() => {
    if (!flowState.selectedType) return false;
    return shouldShowCategorySelection(flowState.selectedType);
  }, [flowState.selectedType]);

  const selectClassification = useCallback((classification: 'regular' | 'special' | 'support') => {
    setFlowState({
      ...flowState,
      selectedClassification: classification,
      currentStep: 2,
      selectedType: undefined,
      selectedCategory: undefined,
      selectedDateTime: undefined,
      selectedStaff: undefined
    });
  }, [flowState]);

  const selectType = useCallback((type: InterviewType) => {
    const requiresCategory = shouldShowCategorySelection(type);
    setFlowState({
      ...flowState,
      selectedType: type,
      currentStep: requiresCategory ? 3 : 4,
      selectedCategory: undefined,
      selectedDateTime: undefined,
      selectedStaff: undefined
    });
  }, [flowState]);

  const selectCategory = useCallback((category: InterviewCategory) => {
    setFlowState({
      ...flowState,
      selectedCategory: category,
      currentStep: 4,
      selectedDateTime: undefined,
      selectedStaff: undefined
    });
  }, [flowState]);

  const selectDateTime = useCallback((dateTime: Date, staff: string) => {
    setFlowState({
      ...flowState,
      selectedDateTime: dateTime,
      selectedStaff: staff
    });
  }, [flowState]);

  const goBack = useCallback(() => {
    switch (flowState.currentStep) {
      case 2:
        setFlowState({
          currentStep: 1,
          selectedClassification: undefined,
          selectedType: undefined,
          selectedCategory: undefined,
          selectedDateTime: undefined,
          selectedStaff: undefined
        });
        break;
      case 3:
        setFlowState({
          ...flowState,
          currentStep: 2,
          selectedCategory: undefined,
          selectedDateTime: undefined,
          selectedStaff: undefined
        });
        break;
      case 4:
        const prevStep = needsCategory ? 3 : 2;
        setFlowState({
          ...flowState,
          currentStep: prevStep,
          selectedDateTime: undefined,
          selectedStaff: undefined
        });
        break;
      default:
        break;
    }
  }, [flowState, needsCategory]);

  const reset = useCallback(() => {
    setFlowState(initialState);
  }, []);

  const canProceed = useMemo(() => {
    switch (flowState.currentStep) {
      case 1:
        return !!flowState.selectedClassification;
      case 2:
        return !!flowState.selectedType;
      case 3:
        return !!flowState.selectedCategory;
      case 4:
        return !!flowState.selectedDateTime && !!flowState.selectedStaff;
      default:
        return false;
    }
  }, [flowState]);

  return {
    flowState,
    selectClassification,
    selectType,
    selectCategory,
    selectDateTime,
    goBack,
    reset,
    canProceed,
    availableTypes,
    needsCategory
  };
};