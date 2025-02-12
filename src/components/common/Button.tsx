import React, { ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'danger' | 'warning';

const VARIANTS: Record<ButtonVariant | 'disabled', string> = {
  primary: 'border-green-500 bg-black hover:bg-green-500/10 text-green-500 hover:shadow-[0_0_10px_rgba(34,197,94,0.5)]',
  danger: 'border-red-500 bg-black hover:bg-red-500/10 text-red-500 hover:shadow-[0_0_10px_rgba(239,68,68,0.5)]',
  warning: 'border-yellow-500 bg-black hover:bg-yellow-500/10 text-yellow-500 hover:shadow-[0_0_10px_rgba(234,179,8,0.5)]',
  disabled: 'border-gray-500 bg-black/50 text-gray-500 cursor-not-allowed'
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  disabled = false,
  variant = 'primary',
  className = '',
  type = 'button',
  fullWidth = false,
  ...props
}) => {
  const baseClasses = 'py-2 px-4 border rounded transition-all duration-200 font-mono';
  const variantClasses = disabled ? VARIANTS.disabled : VARIANTS[variant];
  const widthClasses = fullWidth ? 'w-full' : '';
  
  return (
    <button
      type={type}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses} ${widthClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button; 