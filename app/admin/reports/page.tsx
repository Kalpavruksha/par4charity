'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface ReportData {
    totalUsers: number
    activeSubscriptions: number
    monthlyRevenue: number
    yearlyRevenue: number
    totalCharityContributions: number
    charityBreakdown: { name: string; total: number; slug: string }[]
    drawStats: { draw_month: string; status: string; prize_pool_total: number; jackpot_amount: number }[]
    winnerStats: { verification_status: string; count: number; total_prize: number }[]
}

const CHARITY_ICONS: Record<string, string> = {
    'golf-foundation': '⛳', 'macmillan-cancer-support': '💚', 'wwf': '🌿',
    'british-heart-foundation': '❤️', 'rnli': '🌊', 'alzheimers-society': '🧠',
}

export default function AdminReportsPage() {
    const supabase = createClient()
    const [data, setData] = useState<ReportData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetch = async () => {
            const [
                { count: totalUsers },
                { data: subs },
                { data: contributions },
                { data: charities },
                { data: draws },
                { data: winners },
            ] = await Promise.all([
                supabase.from('profiles').select('*', { count: 'exact', head: true }),
                supabase.from('subscriptions').select('plan, status').eq('status', 'active'),
                supabase.from('charity_contributions').select('charity_id, amount'),
                supabase.from('charities').select('id, name, slug'),
                supabase.from('draws').select('draw_month, status, prize_pool_total, jackpot_amount').order('draw_month', { ascending: false }).limit(12),
                supabase.from('winners').select('verification_status, prize_amount'),
            ])

            const activeMonthly = subs?.filter(s => s.plan === 'monthly').length || 0
            const activeYearly = subs?.filter(s => s.plan === 'yearly').length || 0
            const totalCharity = contributions?.reduce((s, c) => s + c.amount, 0) || 0

            const charityTotals: Record<string, number> = {}
            contributions?.forEach(c => { charityTotals[c.charity_id] = (charityTotals[c.charity_id] || 0) + c.amount })
            const charityBreakdown = charities?.map(c => ({ name: c.name, slug: c.slug, total: charityTotals[c.id] || 0 })).sort((a, b) => b.total - a.total) || []

            const winnerByStatus: Record<string, { count: number; total: number }> = {}
            winners?.forEach(w => {
                if (!winnerByStatus[w.verification_status]) winnerByStatus[w.verification_status] = { count: 0, total: 0 }
                winnerByStatus[w.verification_status].count++
                winnerByStatus[w.verification_status].total += w.prize_amount
            })
            const winnerStats = Object.entries(winnerByStatus).map(([status, d]) => ({ verification_status: status, count: d.count, total_prize: d.total }))

            setData({
                totalUsers: totalUsers || 0,
                activeSubscriptions: (subs?.length || 0),
                monthlyRevenue: activeMonthly * 999,
                yearlyRevenue: activeYearly * 9999,
                totalCharityContributions: totalCharity,
                charityBreakdown,
                drawStats: draws || [],
                winnerStats,
            })
            setLoading(false)
        }
        fetch()
    }, [])

    if (loading) return <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" /></div>
    if (!data) return null

    const monthlyMRR = (data.monthlyRevenue + data.yearlyRevenue / 12) / 100

    return (
        <>
            <div className="page-header">
                <h1 className="page-title">📈 Reports & Analytics</h1>
                <p className="page-subtitle">Platform-wide statistics, revenue, charity impact, and draw performance.</p>
            </div>

            {/* Revenue Stats */}
            <div className="grid-4 mb-4">
                <div className="stat-card">
                    <div className="stat-label">Total Users</div>
                    <div className="stat-value">{data.totalUsers}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Active Subscribers</div>
                    <div className="stat-value text-gradient">{data.activeSubscriptions}</div>
                    <div className="stat-sub">MRR: £{monthlyMRR.toFixed(2)}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Total Charity Raised</div>
                    <div className="stat-value" style={{ color: 'var(--color-accent)' }}>£{(data.totalCharityContributions / 100).toFixed(2)}</div>
                    <div className="stat-sub">All time</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Monthly Revenue</div>
                    <div className="stat-value text-gold">£{((data.monthlyRevenue + data.yearlyRevenue) / 100).toFixed(2)}</div>
                    <div className="stat-sub">Current period</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                {/* Charity Breakdown */}
                <div className="card">
                    <h3 style={{ fontSize: '1rem', color: 'var(--color-text)', marginBottom: '1.25rem' }}>🌱 Charity Contributions</h3>
                    {data.charityBreakdown.length === 0 ? (
                        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>No contributions yet.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {data.charityBreakdown.map(c => {
                                const maxTotal = Math.max(...data.charityBreakdown.map(x => x.total), 1)
                                const pct = (c.total / maxTotal) * 100
                                return (
                                    <div key={c.name}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.375rem' }}>
                                            <span><span style={{ marginRight: '0.375rem' }}>{CHARITY_ICONS[c.slug] || '💛'}</span>{c.name}</span>
                                            <strong style={{ color: 'var(--color-accent)' }}>£{(c.total / 100).toFixed(2)}</strong>
                                        </div>
                                        <div className="progress-bar-wrapper">
                                            <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* Winner Stats */}
                <div className="card">
                    <h3 style={{ fontSize: '1rem', color: 'var(--color-text)', marginBottom: '1.25rem' }}>🏆 Winner Statistics</h3>
                    {data.winnerStats.length === 0 ? (
                        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>No winners yet.</p>
                    ) : (
                        <div className="table-wrapper">
                            <table>
                                <thead>
                                    <tr><th>Status</th><th>Count</th><th>Total Prizes</th></tr>
                                </thead>
                                <tbody>
                                    {data.winnerStats.map(w => (
                                        <tr key={w.verification_status}>
                                            <td><span className="badge badge-muted" style={{ textTransform: 'capitalize', fontSize: '0.7rem' }}>{w.verification_status.replace(/_/g, ' ')}</span></td>
                                            <td><strong>{w.count}</strong></td>
                                            <td><strong style={{ color: 'var(--color-gold-light)' }}>£{(w.total_prize / 100).toFixed(2)}</strong></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Draw History */}
            <div className="card">
                <h3 style={{ fontSize: '1rem', color: 'var(--color-text)', marginBottom: '1.25rem' }}>🎰 Draw History</h3>
                {data.drawStats.length === 0 ? (
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>No draws yet.</p>
                ) : (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr><th>Month</th><th>Status</th><th>Prize Pool</th><th>Jackpot</th></tr>
                            </thead>
                            <tbody>
                                {data.drawStats.map(d => (
                                    <tr key={d.draw_month}>
                                        <td><strong>{d.draw_month}</strong></td>
                                        <td><span className={`badge ${d.status === 'published' || d.status === 'completed' ? 'badge-success' : d.status === 'simulated' ? 'badge-primary' : 'badge-muted'}`}>{d.status}</span></td>
                                        <td>£{((d.prize_pool_total || 0) / 100).toFixed(2)}</td>
                                        <td className="text-gold">£{((d.jackpot_amount || 0) / 100).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    )
}
