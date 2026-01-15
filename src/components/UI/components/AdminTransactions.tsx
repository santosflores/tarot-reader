/**
 * AdminTransactions component
 * Admin-only view for querying all user credit transactions
 */

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase.ts';
import { CollapsibleSection } from './CollapsibleSection';

interface CreditTransaction {
    id: string;
    user_id: string;
    amount: number;
    balance_after: number;
    transaction_type: string;
    description: string | null;
    session_id: string | null;
    created_at: string;
}

export function AdminTransactions() {
    const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [hasFetched, setHasFetched] = useState(false);

    const fetchTransactions = async () => {
        setLoading(true);

        let query = supabase
            .from('credit_transactions')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);

        if (searchQuery.trim()) {
            // Search by user_id or session_id
            query = query.or(`user_id.eq.${searchQuery},session_id.eq.${searchQuery}`);
        }

        const { data, error } = await query;

        if (!error && data) {
            setTransactions(data);
        }
        setLoading(false);
        setHasFetched(true);
    };

    useEffect(() => {
        if (!hasFetched) {
            fetchTransactions();
        }
    }, [hasFetched]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchTransactions();
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
        <CollapsibleSection title="Admin: All Transactions" icon="🔐" defaultExpanded={false} className="mt-0">
            <div className="space-y-3">
                {/* Search Form */}
                <form onSubmit={handleSearch} className="flex gap-2">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by user_id or session_id"
                        className="flex-1 px-3 py-2 text-xs bg-slate-800/80 backdrop-blur-sm border border-purple-400/30 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                    />
                    <button
                        type="submit"
                        className="px-4 py-2 text-xs font-medium bg-purple-800/50 hover:bg-purple-700/60 backdrop-blur-sm border border-purple-400/30 hover:border-purple-300/50 text-purple-200 hover:text-white rounded-lg transition-all duration-200"
                    >
                        Search
                    </button>
                </form>

                {loading && (
                    <div className="flex items-center justify-center py-6">
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                            <div className="text-xs text-purple-300/80">Loading transactions...</div>
                        </div>
                    </div>
                )}

                {!loading && transactions.length === 0 && (
                    <div className="text-center py-6">
                        <div className="text-3xl mb-2 opacity-50">🔍</div>
                        <div className="text-xs font-medium text-purple-300/80 mb-1">No transactions found</div>
                        <div className="text-xs text-purple-400/60">Try a different search query</div>
                    </div>
                )}

                {!loading && transactions.length > 0 && (
                    <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                        {transactions.map((tx) => (
                            <div
                                key={tx.id}
                                className="group relative bg-slate-800/90 backdrop-blur-sm border border-purple-400/30 rounded-lg p-3 hover:border-purple-300/60 hover:bg-slate-800 transition-all duration-200"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className={`text-xs px-2 py-0.5 rounded border ${getTypeBadge(tx.transaction_type)}`}>
                                        {tx.transaction_type}
                                    </span>
                                    <span className={`text-sm font-bold ${tx.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {tx.amount >= 0 ? '+' : ''}{tx.amount}
                                    </span>
                                </div>
                                <div className="text-xs text-purple-300/80 space-y-1">
                                    <div className="flex items-center gap-1">
                                        <span className="text-purple-400/60">User:</span>
                                        <span className="font-mono truncate">{tx.user_id.substring(0, 16)}...</span>
                                    </div>
                                    {tx.session_id && (
                                        <div className="flex items-center gap-1">
                                            <span className="text-purple-400/60">Session:</span>
                                            <span className="font-mono truncate">{tx.session_id.substring(0, 16)}...</span>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between">
                                        <span>{formatDate(tx.created_at)}</span>
                                        <span className="text-purple-400/60">bal: {tx.balance_after}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && transactions.length > 0 && (
                    <button
                        type="button"
                        onClick={fetchTransactions}
                        className="w-full flex items-center justify-center gap-2 text-xs font-medium bg-slate-800/90 hover:bg-purple-800/90 backdrop-blur-sm border border-purple-400/30 hover:border-purple-300/50 text-purple-200 hover:text-white px-3 py-2 rounded-lg transition-all duration-200 hover:scale-[1.02] shadow-lg"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh
                    </button>
                )}
            </div>
        </CollapsibleSection>
    );
}

