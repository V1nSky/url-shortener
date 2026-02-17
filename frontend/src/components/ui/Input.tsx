import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, type = 'text', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="mb-2 block text-xs font-semibold text-[#666680] uppercase tracking-widest" style={{ fontFamily: "'Space Mono', monospace" }}>
            {label}
          </label>
        )}
        <input
          type={type}
          className={`
            w-full h-11 px-4 rounded-xl text-sm
            bg-[#1a1a24] border text-[#e8e8f0]
            placeholder:text-[#444460]
            outline-none transition-all duration-200
            ${error
              ? 'border-[#ff6b9d] focus:shadow-[0_0_0_3px_rgba(255,107,157,0.15)]'
              : 'border-[#2a2a3a] focus:border-[#7c6bff] focus:shadow-[0_0_0_3px_rgba(124,107,255,0.15)]'
            }
            ${className}
          `}
          ref={ref}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs text-[#ff6b9d]" style={{ fontFamily: "'Space Mono', monospace" }}>{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
