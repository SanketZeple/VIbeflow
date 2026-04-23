import { useState, forwardRef } from 'react';

const ModernInput = forwardRef(({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  success,
  disabled = false,
  required = false,
  className = '',
  icon,
  onIconClick,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  const containerClasses = `
    relative w-full
    ${error ? 'text-danger' : success ? 'text-success' : 'text-text-primary'}
    ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
  `;

  const inputClasses = `
    w-full px-4 pt-6 pb-2
    bg-surface border rounded-lg
    text-text-primary placeholder-transparent
    outline-none transition-all duration-200
    ${error 
      ? 'border-danger focus:border-danger focus:ring-1 focus:ring-danger' 
      : success 
        ? 'border-success focus:border-success focus:ring-1 focus:ring-success'
        : 'border-border focus:border-accent focus:ring-1 focus:ring-accent'
    }
    ${disabled ? 'cursor-not-allowed' : ''}
    ${className}
  `;

  const labelClasses = `
    absolute left-4 transition-all duration-200 pointer-events-none
    ${isFocused || value 
      ? 'top-2 text-xs opacity-80' 
      : 'top-4 text-sm opacity-60'
    }
    ${error ? 'text-danger' : success ? 'text-success' : 'text-text-secondary'}
  `;

  return (
    <div className={containerClasses}>
      <div className="relative">
        <input
          ref={ref}
          type={inputType}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          required={required}
          className={inputClasses}
          placeholder={placeholder || label}
          {...props}
        />
        
        <label className={labelClasses}>
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </label>

        {/* Icon or password toggle */}
        {(icon || isPassword) && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center">
            {isPassword ? (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1 text-text-muted hover:text-text-primary transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9.27-3.11-11-7 1.01-2.27 2.67-4.1 4.75-5.3M9.88 9.88a3 3 0 104.24 4.24M6.1 6.1l11.8 11.8" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            ) : icon && (
              <button
                type="button"
                onClick={onIconClick}
                className="p-1 text-text-muted hover:text-text-primary transition-colors"
                aria-label="Input action"
              >
                {icon}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Error or success message */}
      {(error || success) && (
        <div className={`mt-2 text-sm flex items-center ${error ? 'text-danger' : 'text-success'}`}>
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            {error ? (
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            ) : (
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            )}
          </svg>
          <span>{error || success}</span>
        </div>
      )}
    </div>
  );
});

ModernInput.displayName = 'ModernInput';

export default ModernInput;