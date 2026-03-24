'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface Stats {
    totalUsers: number
    activeSubscriptions: number
    totalPrizePool: number
    totalCharityRaised: number
    pendingWinners: number
    totalDraws: number
}

export default function AdminPage() {
    const supabase = createClient()
    const [stats, setStats] = useState<Stats>({ totalUsers: 0, activeSubscriptions: 0, totalPrizePool: 0, totalCharityRaised: 0, pendingWinners: 0, totalDraws: 0 })
    const [loading, setLoading] = useState(true)
    const [recentUsers, setRecentUsers] = useState<{ email: string; created_at: string }[]>([])

    useEffect(() => {
        const fetch = async () => {
            const [
                { count: users },
                { count: subs },
                { data: draws },
                { data: contributions },
                { count: pending },
                { data: recent },
            ] = await Promise.all([
                supabase.from('profiles').select('*', { count: 'exact', head: true }),
                supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
                supabase.from('draws').select('prize_pool_total'),
                supabase.from('charity_contributions').select('amount'),
                supabase.from('winners').select('*', { count: 'exact', head: true }).eq('verification_status', 'under_review'),
                supabase.from('profiles').select('email, created_at').order('created_at', { ascending: false }).limit(5),
            ])
            const totalPool = draws?.reduce((s, d) => s + (d.prize_pool_total || 0), 0) || 0
            const totalCharity = contributions?.reduce((s, c) => s + c.amount, 0) || 0
            setStats({
                totalUsers: users || 0,
                activeSubscriptions: subs || 0,
                totalPrizePool: totalPool,
                totalCharityRaised: totalCharity,
                pendingWinners: pending || 0,
                totalDraws: draws?.length || 0,
            })
            setRecentUsers(recent || [])
            setLoading(false)
        }
        fetch()
    }, [])

    if (loading) return <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" /></div>

    return (
        <>
            <div className="page-header">
                <h1 className="page-title">📊 Admin Overview</h1>
                <p className="page-subtitle">Par4Charity platform at a glance. {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>

            {stats.pendingWinners > 0 && (
                <div className="alert alert-warning mb-4">
                    ⚠️ <strong>{stats.pendingWinners} winner{stats.pendingWinners !== 1 ? 's' : ''}</strong> awaiting verification.{' '}
                    <Link href="/admin/winners" style={{ color: 'var(--color-warning)', textDecoration: 'underline', fontWeight: 600 }}>Review now →</Link>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid-3 mb-4">
                <div className="stat-card">
                    <div className="stat-label">Total Users</div>
                    <div className="stat-value">{stats.totalUsers.toLocaleString()}</div>
                    <div className="stat-sub">Registered accounts</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Active Subscribers</div>
                    <div className="stat-value text-gradient">{stats.activeSubscriptions.toLocaleString()}</div>
                    <div className="stat-sub">{stats.totalUsers > 0 ? ((stats.activeSubscriptions / stats.totalUsers) * 100).toFixed(0) : 0}% conversion rate</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Total Prize Pool (All time)</div>
                    <div className="stat-value text-gold">£{(stats.totalPrizePool / 100).toLocaleString('en-GB', { minimumFractionDigits: 2 })}</div>
                    <div className="stat-sub">Across {stats.totalDraws} draws</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Charity Raised (All time)</div>
                    <div className="stat-value" style={{ color: 'var(--color-accent)' }}>£{(stats.totalCharityRaised / 100).toLocaleString('en-GB', { minimumFractionDigits: 2 })}</div>
                    <div className="stat-sub">For all charity partners</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Pending Verifications</div>
                    <div className="stat-value" style={{ color: stats.pendingWinners > 0 ? 'var(--color-warning)' : 'var(--color-success)' }}>{stats.pendingWinners}</div>
                    <div className="stat-sub">Winners awaiting review</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Total Draws Run</div>
                    <div className="stat-value">{stats.totalDraws}</div>
                    <div className="stat-sub">Published draws</div>
                </div>
            </div>

            {/* Quick Actions + Recent Users */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="card">
                    <h3 style={{ fontSize: '1rem', color: 'var(--color-text)', marginBottom: '1.25rem' }}>⚡ Quick Actions</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <Link href="/admin/draws" className="btn btn-primary" style={{ justifyContent: 'flex-start', gap: '0.75rem' }}>🎰 Manage Draws</Link>
                        <Link href="/admin/winners" className="btn btn-outline" style={{ justifyContent: 'flex-start', gap: '0.75rem' }}>🏆 Verify Winners</Link>
                        <Link href="/admin/users" className="btn btn-outline" style={{ justifyContent: 'flex-start', gap: '0.75rem' }}>👥 Manage Users</Link>
                        <Link href="/admin/charities" className="btn btn-outline" style={{ justifyContent: 'flex-start', gap: '0.75rem' }}>🌱 Manage Charities</Link>
                        <Link href="/admin/reports" className="btn btn-outline" style={{ justifyContent: 'flex-start', gap: '0.75rem' }}>📈 View Reports</Link>
                    </div>
                </div>

                <div className="card">
                    <h3 style={{ fontSize: '1rem', color: 'var(--color-text)', marginBottom: '1.25rem' }}>👤 Recent Signups</h3>
                    {recentUsers.length === 0 ? (
                        <p className="text-sm" style={{ textAlign: 'center', padding: '1.5rem 0', color: 'var(--color-text-muted)' }}>No users yet.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {recentUsers.map((u, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem', paddingBottom: '0.75rem', borderBottom: i < recentUsers.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                                    <span style={{ color: 'var(--color-text)' }}>{u.email}</span>
                                    <span style={{ color: 'var(--color-text-dim)', fontSize: '0.75rem' }}>
                                        {new Date(u.created_at).toLocaleDateString('en-GB')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}
