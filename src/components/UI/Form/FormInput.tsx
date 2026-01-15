/**
 * FormInput Component
 * Reusable styled input field with label for auth forms
 */

import { ChangeEvent, InputHTMLAttributes } from 'react';

interface FormInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
    id: string;
    label: string;
    labelHint?: string;
    value: string;
    onChange: (value: string) => void;
    hint?: string;
}

export function FormInput({
    id,
    label,
    labelHint,
    value,
    onChange,
    hint,
    type = 'text',
    placeholder,
    required,
    autoComplete,
    ...rest
}: FormInputProps) {
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
    };

    return (
        <div className="space-y-4">
            <label
                htmlFor={id}
                className="block text-xs font-bold text-slate-300 uppercase tracking-wider ml-1"
            >
                {label}
                {labelHint && (
                    <span className="text-slate-500 font-normal normal-case lowercase"> {labelHint}</span>
                )}
            </label>
            <div className="relative group/input">
                <input
                    id={id}
                    type={type}
                    value={value}
                    onChange={handleChange}
                    required={required}
                    autoComplete={autoComplete}
                    placeholder={placeholder}
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all font-mono text-base shadow-inner"
                    {...rest}
                />
            </div>
            {hint && (
                <p className="mt-2 text-xs text-slate-500 ml-1 leading-relaxed">{hint}</p>
            )}
        </div>
    );
}
