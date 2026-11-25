import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = true
}) => {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-100 p-6 md:p-8 transition-all duration-300 ${
        hover
          ? 'hover:shadow-soft-lg hover:-translate-y-1 hover:border-brand-purple-100'
          : 'shadow-soft-sm'
      } ${className}`}
    >
      {children}
    </div>
  );
};
