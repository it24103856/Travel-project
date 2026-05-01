import React from 'react';

const defaultMonthlyData = [
    {
        month: 'April 2026',
        revenue: 122692,
        transactions: 6,
        growth: 513.5,
        tone: 'positive',
    },
    {
        month: 'August 2020',
        revenue: 20000,
        transactions: 2,
        growth: -83.7,
        tone: 'negative',
    },
];

const formatCurrency = (value) => `Rs. ${Number(value || 0).toLocaleString()}`;

const MonthlyPerformanceSummary = ({ monthlyData = defaultMonthlyData }) => {
    const safeData = Array.isArray(monthlyData) && monthlyData.length > 0 ? monthlyData : defaultMonthlyData;
    const topEntry = safeData.reduce((best, entry) => (entry.revenue > best.revenue ? entry : best), safeData[0]);
    const totalRevenue = safeData.reduce((sum, entry) => sum + (Number(entry.revenue) || 0), 0);
    const maxRevenue = Math.max(...safeData.map(entry => Number(entry.revenue) || 0), 1);

    return (
        <section className="relative mb-12 overflow-hidden rounded-4xl border border-slate-200 bg-white p-6 md:p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
                <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />
                <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-slate-200 to-transparent" />
            </div>

            <div className="relative z-10 grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
                <div className="space-y-6">
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-[10px] font-black uppercase tracking-[0.35em] text-emerald-700">
                        Monthly Performance Summary
                    </div>

                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500">Monthly Overview</p>
                            <h2 className="mt-3 text-3xl md:text-4xl font-black leading-none text-slate-900">
                                {topEntry.month}
                            </h2>
                            <p className="mt-3 max-w-2xl text-sm md:text-base text-slate-600">
                                Dark-themed performance snapshot for the admin dashboard, highlighting revenue, transaction volume, and month-to-month movement.
                            </p>
                        </div>

                        <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 px-5 py-4 shadow-sm">
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Total Revenue</p>
                            <div className="mt-2 flex items-end gap-2">
                                <span className="text-3xl md:text-5xl font-black tracking-tight text-slate-900">{formatCurrency(totalRevenue)}</span>
                            </div>
                            <p className="mt-2 text-xs font-medium text-slate-400">
                                Growth: <span className={topEntry.growth >= 0 ? 'text-emerald-300' : 'text-rose-300'}>{topEntry.growth >= 0 ? '+' : ''}{topEntry.growth.toFixed(1)}%</span>
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        {safeData.map((item) => (
                            <div key={item.month} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">{item.month}</p>
                                        <p className="mt-2 text-xl font-black text-slate-900">{formatCurrency(item.revenue)}</p>
                                    </div>
                                    <span className={`rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-[0.25em] ${item.growth >= 0 ? 'bg-emerald-400/15 text-emerald-300' : 'bg-rose-400/15 text-rose-300'}`}>
                                        {item.growth >= 0 ? 'Growth' : 'Drop'}
                                    </span>
                                </div>
                                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                                        <p className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-500">Transactions</p>
                                        <p className="mt-1 text-lg font-black text-slate-900">{item.transactions}</p>
                                    </div>
                                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                                        <p className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-500">Growth</p>
                                        <p className={`mt-1 text-lg font-black ${item.growth >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                                            {item.growth >= 0 ? '+' : ''}{item.growth.toFixed(1)}%
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5 md:p-6 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Revenue Comparison</p>
                            <h3 className="mt-2 text-xl font-black text-slate-900">Visual Monthly Breakdown</h3>
                        </div>
                        <div className="rounded-full bg-cyan-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-cyan-700">
                            Bars
                        </div>
                    </div>

                    <div className="mt-6 space-y-5">
                        {safeData.map((item) => {
                            const width = Math.max((Number(item.revenue) / maxRevenue) * 100, 12);
                            return (
                                <div key={item.month} className="space-y-2">
                                    <div className="flex items-center justify-between gap-3 text-xs font-bold uppercase tracking-[0.25em] text-slate-500">
                                        <span>{item.month}</span>
                                        <span>{formatCurrency(item.revenue)}</span>
                                    </div>
                                    <div className="h-4 rounded-full bg-slate-200 p-1">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${item.growth >= 0 ? 'bg-linear-to-r from-emerald-400 to-cyan-400' : 'bg-linear-to-r from-rose-400 to-orange-400'}`}
                                            style={{ width: `${width}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-4">
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 mb-3">Monthly Breakdown</p>
                        <div className="overflow-hidden rounded-2xl border border-slate-200">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 text-[9px] uppercase tracking-[0.3em] text-slate-500">
                                    <tr>
                                        <th className="px-4 py-3">Month</th>
                                        <th className="px-4 py-3">Revenue</th>
                                        <th className="px-4 py-3">Transactions</th>
                                        <th className="px-4 py-3 text-right">Growth</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {safeData.map((item, index) => (
                                        <tr key={item.month} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                                            <td className="px-4 py-3 text-sm font-bold text-slate-900">{item.month}</td>
                                            <td className="px-4 py-3 text-sm text-slate-600">{formatCurrency(item.revenue)}</td>
                                            <td className="px-4 py-3 text-sm text-slate-600">{item.transactions}</td>
                                            <td className={`px-4 py-3 text-right text-sm font-black ${item.growth >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                                                {item.growth >= 0 ? '+' : ''}{item.growth.toFixed(1)}%
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default MonthlyPerformanceSummary;