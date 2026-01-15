/**
 * TransactionHistory component
 * Displays a collapsible list of the user's credit transactions
 */

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase.ts';
import { useAuthContext } from '../../hooks/useAuthContext.ts';

interface CreditTransaction {
    id: string;
    amount: number;
    balance_after: number;
    transaction_type: string;
    description: string | null;
    session_id: string | null;
    created_at: string;
}

export function TransactionHistory() {
    const { user } = useAuthContext();
    const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const fetchTransactions = async (limit = 10, offset = 0) => {
        if (!user) return;

        setLoading(true);
        const { data, error } = await supabase
            .from('credit_transactions')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (!error && data) {
            if (offset === 0) {
                setTransactions(data);
            } else {
                setTransactions(prev => [...prev, ...data]);
            }
            setHasMore(data.length === limit);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (isOpen && transactions.length === 0) {
            fetchTransactions();
        }
    }, [isOpen, user]);

    const loadMore = () => {
        fetchTransactions(10, transactions.length);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTypeBadge = (type: string) => {
        const styles: Record<string, string> = {
            purchase: 'bg-green-500/20 text-green-400 border-green-500/30',
            deduction: 'bg-red-500/20 text-red-400 border-red-500/30',
            bonus: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
            refund: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        };
        return styles[type] || 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    };

    return (
        <div className="border-t border-purple-400/20">
            {/* Header */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-purple-900/20 transition-colors"
            >
                <span className="text-sm font-bold text-purple-300 uppercase tracking-wider">
                    Transaction History
                </span>
                <svg
                    className={`w-4 h-4 text-purple-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Content */}
            {isOpen && (
                <div className="px-5 pb-4">
                    {loading && transactions.length === 0 ? (
                        <div className="text-center py-4 text-slate-400 text-sm">Loading...</div>
                    ) : transactions.length === 0 ? (
                        <div className="text-center py-4 text-slate-500 text-sm">No transactions yet</div>
                    ) : (
                        <>
                            <div className="space-y-2">
                                {transactions.map((tx) => (
                                    <div
                                        key={tx.id}
                                        className="flex items-center justify-between py-2 px-3 bg-slate-800/50 rounded-lg border border-slate-700/50"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-xs px-2 py-0.5 rounded border ${getTypeBadge(tx.transaction_type)}`}>
                                                    {tx.transaction_type}
                                                </span>
                                                <span className="text-xs text-slate-500">{formatDate(tx.created_at)}</span>
                                            </div>
                                            {tx.description && (
                                                <p className="text-xs text-slate-400 truncate">{tx.description}</p>
                                            )}
                                        </div>
                                        <div className="text-right ml-3">
                                            <div className={`text-sm font-bold ${tx.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                {tx.amount >= 0 ? '+' : ''}{tx.amount}
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                bal: {tx.balance_after}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {hasMore && (
                                <button
                                    onClick={loadMore}
                                    disabled={loading}
                                    className="w-full mt-3 py-2 text-xs text-purple-400 hover:text-purple-300 disabled:opacity-50"
                                >
                                    {loading ? 'Loading...' : 'Load More'}
                                </button>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
