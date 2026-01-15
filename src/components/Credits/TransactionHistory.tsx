/**
 * TransactionHistory component
 * Displays a collapsible list of the user's credit transactions
 */

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase.ts';
import { useAuthContext } from '../../hooks/useAuthContext.ts';
import { CollapsibleSection } from '../UI/components/CollapsibleSection';

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
    const [hasMore, setHasMore] = useState(true);
    const [hasFetched, setHasFetched] = useState(false);

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
        setHasFetched(true);
    };

    useEffect(() => {
        if (user && !hasFetched) {
            fetchTransactions();
        }
    }, [user, hasFetched]);

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
        <CollapsibleSection title="Transaction History" icon="💳" defaultExpanded={false} className="mt-0">
            <div className="space-y-3">
                {loading && transactions.length === 0 && (
                    <div className="flex items-center justify-center py-6">
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                            <div className="text-xs text-purple-300/80">Loading transactions...</div>
                        </div>
                    </div>
                )}

                {!loading && transactions.length === 0 && (
                    <div className="text-center py-6">
                        <div className="text-3xl mb-2 opacity-50">💳</div>
                        <div className="text-xs font-medium text-purple-300/80 mb-1">No transactions yet</div>
                        <div className="text-xs text-purple-400/60">Your credit activity will appear here</div>
                    </div>
                )}

                {transactions.length > 0 && (
                    <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                        {transactions.map((tx) => (
                            <div
                                key={tx.id}
                                className="group relative bg-slate-800/90 backdrop-blur-sm border border-purple-400/30 rounded-lg p-3 hover:border-purple-300/60 hover:bg-slate-800 transition-all duration-200"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-xs px-2 py-0.5 rounded border ${getTypeBadge(tx.transaction_type)}`}>
                                                {tx.transaction_type}
                                            </span>
                                            <span className="text-xs text-purple-300/80">{formatDate(tx.created_at)}</span>
                                        </div>
                                        {tx.description && (
                                            <p className="text-xs text-purple-200/80 truncate">{tx.description}</p>
                                        )}
                                    </div>
                                    <div className="text-right ml-3">
                                        <div className={`text-sm font-bold ${tx.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {tx.amount >= 0 ? '+' : ''}{tx.amount}
                                        </div>
                                        <div className="text-xs text-purple-300/60">
                                            bal: {tx.balance_after}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {hasMore && transactions.length > 0 && (
                    <button
                        type="button"
                        onClick={loadMore}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 text-xs font-medium bg-slate-800/90 hover:bg-purple-800/90 backdrop-blur-sm border border-purple-400/30 hover:border-purple-300/50 text-purple-200 hover:text-white px-3 py-2 rounded-lg transition-all duration-200 hover:scale-[1.02] shadow-lg disabled:opacity-50"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                                Loading...
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                                Load more transactions
                            </>
                        )}
                    </button>
                )}
            </div>
        </CollapsibleSection>
    );
}

