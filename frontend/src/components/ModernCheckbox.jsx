import { useState, useEffect } from 'react';

const ModernCheckbox = ({
  label,
  checked = false,
  onChange,
  disabled = false,
  required = false,
  className = '',
  id,
  name,
}) => {
  const [isChecked, setIsChecked] = useState(checked);

  // Sync with parent state if it changes externally
  useEffect(() => {
    setIsChecked(checked);
  }, [checked]);

  const handleChange = (e) => {
    if (disabled) return;
    const newChecked = e.target.checked;
    setIsChecked(newChecked);
    if (onChange) {
      onChange(newChecked);
    }
  };

  const handleToggle = (e) => {
    // Prevent default to avoid double-firing if wrapped in label or other weirdness
    e.preventDefault();
    if (disabled) return;
    const newChecked = !isChecked;
    setIsChecked(newChecked);
    if (onChange) {
      onChange(newChecked);
    }
  };

  const containerClasses = `
    flex items-start space-x-3
    ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
    ${className}
  `;

  const checkboxClasses = `
    relative w-5 h-5 mt-0.5
    rounded border-2 transition-all duration-200
    flex-shrink-0
    ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
    ${isChecked 
      ? 'bg-accent border-accent' 
      : 'bg-surface border-border hover:border-accent'
    }
  `;

  const checkmarkClasses = `
    absolute inset-0 flex items-center justify-center
    transition-all duration-200
    ${isChecked ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}
  `;

  return (
    <div className={containerClasses}>
      <div className="relative flex-shrink-0">
        {/* Hidden native input for form submissions and accessibility */}
        <input
          type="checkbox"
          id={id}
          name={name}
          checked={isChecked}
          onChange={handleChange}
          disabled={disabled}
          required={required}
          className="sr-only"
        />
        {/* Visual custom checkbox */}
        <div 
          className={checkboxClasses}
          onClick={handleToggle}
          role="checkbox"
          aria-checked={isChecked}
          tabIndex={disabled ? -1 : 0}
          onKeyDown={(e) => {
            if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault();
              handleToggle(e);
            }
          }}
        >
          <div className={checkmarkClasses}>
            <svg 
              className="w-3 h-3 text-white" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="3" 
                d="M5 13l4 4L19 7" 
              />
            </svg>
          </div>
        </div>
      </div>
      
      {label && (
        <label 
          htmlFor={id}
          className={`text-sm ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'} ${
            isChecked ? 'text-text-primary' : 'text-text-secondary'
          }`}
          onClick={(e) => {
            // Because the label has htmlFor, clicking it natively toggles the hidden input.
            // We shouldn't call toggle manually to prevent double toggles,
            // but for reliability with custom UI, we will prevent default and toggle manually.
            e.preventDefault();
            handleToggle(e);
          }}
        >
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </label>
      )}
    </div>
  );
};

export default ModernCheckbox;