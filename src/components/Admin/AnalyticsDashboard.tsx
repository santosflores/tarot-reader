
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from 'recharts';

interface DailyStats {
    publish_date: string;
    total_views: number;
    conversions: number;
    avg_seconds: number;
}

interface SignStats {
    zodiac_sign: string;
    views: number;
}

export function AnalyticsDashboard() {
    const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
    const [signStats, setSignStats] = useState<SignStats[]>([]);
    const [loading, setLoading] = useState(true);

    // Admin Controls State
    const [operationLoading, setOperationLoading] = useState<string | null>(null);
    const [operationMsg, setOperationMsg] = useState<string | null>(null);

    useEffect(() => {
        async function fetchStats() {
            setLoading(true);

            // Fetch Daily Stats
            const { data: dailyData, error: dailyError } = await supabase.rpc('get_daily_horoscope_stats');

            // Fetch Sign Stats
            const { data: signData, error: signError } = await supabase.rpc('get_horoscope_sign_stats');

            if (!dailyError && dailyData) setDailyStats(dailyData);
            if (!signError && signData) setSignStats(signData);

            setLoading(false);
        }

        fetchStats();
    }, []);

    async function handleOperation(opType: 'generate' | 'publish') {
        setOperationLoading(opType);
        setOperationMsg(null);
        try {
            const endpoint = opType === 'generate' ? 'generate-daily-horoscopes' : 'publish-horoscopes';
            // Note: In local dev we might need to use the full URL if invoke doesn't resolve automatically
            // But invoke is the standard way. 
            const { data, error } = await supabase.functions.invoke(endpoint, {
                body: { date: new Date().toISOString().split('T')[0] }
            });

            if (error) throw error;
            setOperationMsg(`Success: ${data.message || 'Operation completed'}`);
        } catch (e: any) {
            console.error(e);
            setOperationMsg(`Error: ${e.message || 'Operation failed'}`);
        } finally {
            setOperationLoading(null);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 text-slate-200 p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-white">Horoscope Admin</h1>
                <div className="text-sm text-slate-400">
                    Sitemap: <a href={`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/serve-sitemap`} target="_blank" rel="noreferrer" className="text-purple-400 hover:underline">/serve-sitemap</a>
                </div>
            </div>

            {/* Content Controls */}
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-12">
                <h2 className="text-xl font-bold text-white mb-4">Content Controls</h2>
                <div className="flex flex-wrap items-center gap-4">
                    <button
                        onClick={() => handleOperation('generate')}
                        disabled={!!operationLoading}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
                    >
                        {operationLoading === 'generate' ? 'Generating...' : 'Generate Today\'s Content'}
                    </button>
                    <button
                        onClick={() => handleOperation('publish')}
                        disabled={!!operationLoading}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
                    >
                        {operationLoading === 'publish' ? 'Publishing...' : 'Publish Drafts'}
                    </button>

                    <a
                        href={`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/serve-sitemap`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-medium transition-colors ml-auto"
                    >
                        Check Sitemap XML
                    </a>
                </div>
                {operationMsg && (
                    <div className={`mt-4 p-3 rounded-lg text-sm border ${operationMsg.startsWith('Error') ? 'bg-red-900/20 border-red-900 text-red-200' : 'bg-green-900/20 border-green-900 text-green-200'}`}>
                        {operationMsg}
                    </div>
                )}
            </div>

            <h2 className="text-2xl font-bold text-white mb-6">Analytics Overview</h2>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="p-6 bg-slate-800 rounded-xl border border-slate-700">
                    <h3 className="text-sm text-slate-400 uppercase mb-2">Total Views (Last 7 Days)</h3>
                    <p className="text-3xl font-bold text-white">
                        {dailyStats.reduce((acc, curr) => acc + curr.total_views, 0).toLocaleString()}
                    </p>
                </div>
                <div className="p-6 bg-slate-800 rounded-xl border border-slate-700">
                    <h3 className="text-sm text-slate-400 uppercase mb-2">Avg. Engagement Time</h3>
                    <p className="text-3xl font-bold text-purple-400">
                        {dailyStats.length > 0
                            ? Math.round(dailyStats.reduce((acc, curr) => acc + curr.avg_seconds, 0) / dailyStats.length) + 's'
                            : '0s'}
                    </p>
                </div>
                <div className="p-6 bg-slate-800 rounded-xl border border-slate-700">
                    <h3 className="text-sm text-slate-400 uppercase mb-2">Conversion Rate (To Tarot)</h3>
                    <p className="text-3xl font-bold text-pink-400">
                        {(() => {
                            const totalViews = dailyStats.reduce((acc, curr) => acc + curr.total_views, 0);
                            const totalConversions = dailyStats.reduce((acc, curr) => acc + curr.conversions, 0);
                            return totalViews > 0 ? ((totalConversions / totalViews) * 100).toFixed(1) + '%' : '0%';
                        })()}
                    </p>
                </div>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">

                {/* Traffic Trend */}
                <div className="p-6 bg-slate-800 rounded-xl border border-slate-700">
                    <h3 className="text-xl font-bold text-white mb-6">Daily Traffic Trend</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={[...dailyStats].reverse()}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey="publish_date" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
                                />
                                <Line type="monotone" dataKey="total_views" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Conversion Trend */}
                <div className="p-6 bg-slate-800 rounded-xl border border-slate-700">
                    <h3 className="text-xl font-bold text-white mb-6">Daily Conversions</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[...dailyStats].reverse()}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey="publish_date" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
                                />
                                <Bar dataKey="conversions" fill="#ec4899" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Sign Performance */}
            <div className="p-6 bg-slate-800 rounded-xl border border-slate-700">
                <h3 className="text-xl font-bold text-white mb-6">Popularity by Zodiac Sign</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={signStats}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="zodiac_sign" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
                            />
                            <Bar dataKey="views" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
