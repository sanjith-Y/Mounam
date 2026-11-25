import React from 'react';
import { Link } from 'react-router-dom';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  to?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  to,
  icon,
  children,
  className = '',
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";

  const variantStyles = {
    primary: "bg-brand-purple-800 text-white hover:bg-brand-purple-900 focus:ring-brand-purple-600 shadow-sm hover:shadow-md shadow-brand-purple-900/20",
    secondary: "bg-brand-blue-600 text-white hover:bg-brand-blue-700 focus:ring-brand-blue-500 shadow-sm hover:shadow-md shadow-brand-blue-600/20",
    outline: "border-2 border-brand-purple-200 text-brand-purple-900 hover:bg-brand-purple-50 focus:ring-brand-purple-500 bg-white",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm hover:shadow-md shadow-red-600/20",
    ghost: "text-slate-700 hover:text-brand-purple-900 hover:bg-brand-purple-50 focus:ring-brand-purple-300"
  };

  const sizeStyles = {
    sm: "text-xs px-3 py-1.5 gap-1.5",
    md: "text-sm px-4 py-2.5 gap-2",
    lg: "text-base px-6 py-3.5 gap-2.5",
    xl: "text-lg px-8 py-4 gap-3 rounded-2xl"
  };

  const combinedClasses = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;

  if (to) {
    return (
      <Link to={to} className={combinedClasses}>
        {icon && <span className="shrink-0">{icon}</span>}
        <span>{children}</span>
      </Link>
    );
  }

  return (
    <button className={combinedClasses} {...props}>
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
