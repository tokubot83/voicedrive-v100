import React from 'react';

interface HRDateDividerProps {
  date: string;
}

const HRDateDivider: React.FC<HRDateDividerProps> = ({ date }) => {
  return (
    <div className="hr-date-divider">
      <span className="hr-date-label">{date}</span>
    </div>
  );
};

export default HRDateDivider;