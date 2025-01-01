import { LucideIcon } from 'lucide-react';

interface FormFieldProps {
  label: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  icon?: LucideIcon;
  helperText?: string;
  placeholder?: string;
  error?: string;
}

export function FormField({
  label,
  type,
  value,
  onChange,
  required,
  icon: Icon,
  helperText,
  placeholder,
  error
}: FormFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          className={`
            w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent
            ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-2
            ${error ? 'border-red-500' : ''}
          `}
        />
      </div>
      {error ? (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      ) : null}
    </div>
  );
}