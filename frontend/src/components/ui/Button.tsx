import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 rounded-xl';

    const variants: Record<string, string> = {
      primary: 'bg-[#7c6bff] text-white hover:bg-[#6b5aee] hover:-translate-y-px hover:shadow-[0_8px_24px_rgba(124,107,255,0.4)] active:translate-y-0',
      secondary: 'bg-[#1a1a24] text-[#e8e8f0] border border-[#2a2a3a] hover:border-[#7c6bff] hover:text-[#7c6bff]',
      outline: 'border border-[#7c6bff] text-[#7c6bff] hover:bg-[#7c6bff]/10',
      ghost: 'text-[#666680] hover:text-[#e8e8f0] hover:bg-[#1a1a24]',
      danger: 'border border-[#2a2a3a] text-[#666680] hover:border-[#ff6b9d] hover:text-[#ff6b9d]',
    };

    const sizes: Record<string, string> = {
      sm: 'h-9 px-4 text-sm',
      md: 'h-11 px-5 text-base',
      lg: 'h-13 px-7 text-lg',
    };

    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <svg className="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Loading...
          </>
        ) : children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
