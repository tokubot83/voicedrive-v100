import React from 'react';
import UnifiedInterviewFlow from './unified/UnifiedInterviewFlow';
import { UnifiedInterviewFlowState } from '../../types/unifiedInterview';

interface InterviewBookingCalendarProps {
  employeeId?: string;
  onBookingComplete?: () => void;
}

const InterviewBookingCalendar: React.FC<InterviewBookingCalendarProps> = ({
  employeeId = 'EMP001',
  onBookingComplete
}) => {
  const handleFlowComplete = (flowState: UnifiedInterviewFlowState) => {
    console.log('面談予約完了:', flowState);
    if (onBookingComplete) {
      onBookingComplete();
    }
  };

  return (
    <UnifiedInterviewFlow
      employeeId={employeeId}
      onComplete={handleFlowComplete}
    />
  );
};

export default InterviewBookingCalendar;