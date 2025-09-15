import React from 'react';
import SimpleInterviewFlow from './simple/SimpleInterviewFlow';

interface InterviewBookingCalendarProps {
  employeeId?: string;
  onBookingComplete?: () => void;
  onCancel?: () => void;
}

const InterviewBookingCalendar: React.FC<InterviewBookingCalendarProps> = ({
  employeeId = 'EMP001',
  onBookingComplete,
  onCancel
}) => {
  const handleFlowComplete = (flowState: any) => {
    console.log('面談予約完了:', flowState);
    if (onBookingComplete) {
      onBookingComplete();
    }
  };

  return (
    <SimpleInterviewFlow
      employeeId={employeeId}
      onComplete={handleFlowComplete}
      onCancel={onCancel}
    />
  );
};

export default InterviewBookingCalendar;