import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  color?: 'gray' | 'red' | 'yellow' | 'green' | 'blue' | 'indigo' | 'purple' | 'pink';
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  color = 'gray',
  variant = 'default',
  size = 'md',
  className = ''
}) => {
  const colorClasses = {
    gray: 'bg-gray-100 text-gray-800',
    red: 'bg-red-100 text-red-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    green: 'bg-green-100 text-green-800',
    blue: 'bg-blue-100 text-blue-800',
    indigo: 'bg-indigo-100 text-indigo-800',
    purple: 'bg-purple-100 text-purple-800',
    pink: 'bg-pink-100 text-pink-800'
  };

  const variantClasses = {
    default: 'bg-primary text-primary-foreground',
    secondary: 'bg-slate-100 text-slate-800 border border-slate-200',
    destructive: 'bg-red-100 text-red-800 border border-red-200',
    outline: 'border border-slate-300 text-slate-700'
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1'
  };

  const baseClass = variant === 'default' && !className.includes('bg-') ? variantClasses[variant] : colorClasses[color];

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${baseClass} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </span>
  );
};