/**
 * FormButton Component
 * Gradient submit button with loading spinner state
 */

import { ReactNode, ButtonHTMLAttributes } from 'react';

interface FormButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
    loading?: boolean;
    loadingText?: string;
    children: ReactNode;
}

export function FormButton({
    loading = false,
    loadingText = 'Loading...',
    children,
    disabled,
    type = 'submit',
    ...rest
}: FormButtonProps) {
    return (
        <button
            type={type}
            disabled={loading || disabled}
            className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-purple-900/20 uppercase tracking-[0.2em] text-xs relative overflow-hidden group/btn active:scale-[0.98]"
            {...rest}
        >
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
            {loading ? (
                <span className="flex items-center justify-center gap-3 relative z-10">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                    {loadingText}
                </span>
            ) : (
                <span className="relative z-10 flex items-center justify-center gap-2">
                    {children} <span className="text-sm">→</span>
                </span>
            )}
        </button>
    );
}
