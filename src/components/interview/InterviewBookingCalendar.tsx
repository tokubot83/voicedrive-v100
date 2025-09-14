import React from 'react';
import SimpleInterviewFlow from './simple/SimpleInterviewFlow';

interface InterviewBookingCalendarProps {
  employeeId?: string;
  onBookingComplete?: () => void;
}

const InterviewBookingCalendar: React.FC<InterviewBookingCalendarProps> = ({
  employeeId = 'EMP001',
  onBookingComplete
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
    />
  );
};

export default InterviewBookingCalendar;