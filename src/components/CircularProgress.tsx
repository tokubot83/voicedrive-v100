import React from 'react';

interface CircularProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  showPercentage?: boolean;
  className?: string;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  size = 60,
  strokeWidth = 4,
  color = 'blue',
  showPercentage = true,
  className = ''
}) => {
  const normalizedValue = Math.min(100, Math.max(0, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (normalizedValue / 100) * circumference;

  const colorClasses = {
    blue: 'text-blue-400',
    green: 'text-green-400',
    yellow: 'text-yellow-400',
    red: 'text-red-400',
    purple: 'text-purple-400'
  };

  const strokeColors = {
    blue: '#60A5FA',
    green: '#34D399',
    yellow: '#FBBF24',
    red: '#F87171',
    purple: '#A78BFA'
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}
      >
        {/* Background circle */}
        <circle
          className="text-gray-700"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="none"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress circle */}
        <circle
          className={`${colorClasses[color]} transition-all duration-700 ease-out`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          stroke={strokeColors[color]}
          fill="none"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      {showPercentage && (
        <span className={`absolute text-sm font-semibold ${colorClasses[color]}`}>
          {normalizedValue}%
        </span>
      )}
    </div>
  );
};

export default CircularProgress;