/**
 * AdminTransactions component
 * Admin-only view for querying all user credit transactions
 */

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase.ts';

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
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

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
    };

    useEffect(() => {
        if (isOpen) {
            fetchTransactions();
        }
    }, [isOpen]);

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
            purchase: 'bg-green-500/20 text-green-400',
            deduction: 'bg-red-500/20 text-red-400',
            bonus: 'bg-purple-500/20 text-purple-400',
            refund: 'bg-blue-500/20 text-blue-400',
        };
        return styles[type] || 'bg-slate-500/20 text-slate-400';
    };

    return (
        <div className="border-t border-purple-400/20">
            {/* Header */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-purple-900/20 transition-colors"
            >
                <span className="text-sm font-bold text-amber-400 uppercase tracking-wider">
                    🔐 Admin: All Transactions
                </span>
                <svg
                    className={`w-4 h-4 text-amber-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
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
                    {/* Search Form */}
                    <form onSubmit={handleSearch} className="mb-4">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by user_id or session_id"
                                className="flex-1 px-3 py-2 text-xs bg-slate-800/80 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                            />
                            <button
                                type="submit"
                                className="px-3 py-2 text-xs bg-purple-600/80 hover:bg-purple-500/80 text-white rounded-lg transition-colors"
                            >
                                Search
                            </button>
                        </div>
                    </form>

                    {loading ? (
                        <div className="text-center py-4 text-slate-400 text-sm">Loading...</div>
                    ) : transactions.length === 0 ? (
                        <div className="text-center py-4 text-slate-500 text-sm">No transactions found</div>
                    ) : (
                        <div className="space-y-2 max-h-80 overflow-y-auto">
                            {transactions.map((tx) => (
                                <div
                                    key={tx.id}
                                    className="py-2 px-3 bg-slate-800/50 rounded-lg border border-slate-700/50 text-xs"
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className={`px-2 py-0.5 rounded ${getTypeBadge(tx.transaction_type)}`}>
                                            {tx.transaction_type}
                                        </span>
                                        <span className={`font-bold ${tx.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {tx.amount >= 0 ? '+' : ''}{tx.amount}
                                        </span>
                                    </div>
                                    <div className="text-slate-500 space-y-0.5">
                                        <div className="truncate">User: {tx.user_id.substring(0, 12)}...</div>
                                        {tx.session_id && <div className="truncate">Session: {tx.session_id.substring(0, 12)}...</div>}
                                        <div>{formatDate(tx.created_at)} | Balance: {tx.balance_after}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
