import React from 'react';
import { Spinner } from './Spinner';

// FIX: Added 'size' to ButtonProps to allow for different button sizes.
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    isLoading?: boolean;
    variant?: 'primary' | 'secondary' | 'danger';
    size?: 'default' | 'sm';
    children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    isLoading = false,
    variant = 'primary',
    // FIX: Added 'size' prop with a default value.
    size = 'default',
    children,
    className,
    disabled,
    ...props
}) => {
    // FIX: Removed padding from base classes to be handled by the new 'size' prop.
    const baseClasses = 'flex items-center justify-center font-bold rounded-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:cursor-not-allowed disabled:opacity-50';

    const variantClasses = {
        primary: 'bg-cyan-600 hover:bg-cyan-700 text-white focus:ring-cyan-500',
        secondary: 'bg-slate-600 hover:bg-slate-700 text-white focus:ring-slate-500',
        danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
    };

    // FIX: Added size classes to control padding and font size.
    const sizeClasses = {
        default: 'py-2 px-4',
        sm: 'py-1 px-3 text-sm',
    };

    return (
        <button
            className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <>
                    <Spinner className="mr-2 h-5 w-5" />
                    Processando...
                </>
            ) : (
                children
            )}
        </button>
    );
};
