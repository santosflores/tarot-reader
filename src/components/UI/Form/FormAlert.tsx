/**
 * FormAlert Component
 * Alert box for displaying error or success messages
 */

interface FormAlertProps {
    message: string;
    type?: 'error' | 'success';
}

export function FormAlert({ message, type = 'error' }: FormAlertProps) {
    const isError = type === 'error';

    return (
        <div
            className={`${isError
                    ? 'bg-red-500/10 border-red-500/30 text-red-300'
                    : 'bg-green-500/10 border-green-500/30 text-green-300'
                } border rounded-xl p-4 text-sm flex items-center gap-3 animate-shake`}
        >
            <span className="text-lg">{isError ? '⚠️' : '✓'}</span>
            {message}
        </div>
    );
}
