'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface DashboardData {
    profile: { full_name: string; email: string } | null
    subscription: { plan: string; status: string; current_period_end: string; charity_percentage: number } | null
    scores: { id: string; score: number; played_at: string }[]
    charity: { name: string; icon: string } | null
    winnings: { total: number; pending: number }
    nextDraw: string
}

const CHARITY_ICONS: Record<string, string> = {
    'golf-foundation': '⛳',
    'macmillan': '💚',
    'wwf': '🌿',
    'bhf': '❤️',
    'rnli': '🌊',
    'alzheimers': '🧠',
}

export default function DashboardPage() {
    const supabase = createClient()
    const [data, setData] = useState<DashboardData>({
        profile: null, subscription: null, scores: [], charity: null,
        winnings: { total: 0, pending: 0 }, nextDraw: ''
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const [profileRes, subRes, scoresRes, winnersRes] = await Promise.all([
                supabase.from('profiles').select('full_name, email').eq('id', user.id).single(),
                supabase.from('subscriptions').select('plan, status, current_period_end, charity_id, charity_percentage').eq('user_id', user.id).eq('status', 'active').maybeSingle(),
                supabase.from('golf_scores').select('id, score, played_at').eq('user_id', user.id).order('played_at', { ascending: false }).limit(5),
                supabase.from('winners').select('prize_amount, payout_status').eq('user_id', user.id),
            ])

            const totalWon = winnersRes.data?.reduce((s, w) => s + w.prize_amount, 0) || 0
            const pendingWon = winnersRes.data?.filter(w => w.payout_status === 'pending').reduce((s, w) => s + w.prize_amount, 0) || 0

            // Get next draw date (last day of current month)
            const now = new Date()
            const nextDraw = new Date(now.getFullYear(), now.getMonth() + 1, 0)

            let charity = null
            if (subRes.data?.charity_id) {
                const { data: charityData } = await supabase.from('charities').select('name, slug').eq('id', subRes.data.charity_id).single()
                if (charityData) {
                    charity = { name: charityData.name, icon: CHARITY_ICONS[charityData.slug] || '💛' }
                }
            }

            setData({
                profile: profileRes.data,
                subscription: subRes.data || null,
                scores: scoresRes.data || [],
                charity,
                winnings: { total: totalWon, pending: pendingWon },
                nextDraw: nextDraw.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
            })
            setLoading(false)
        }
        fetchData()
    }, [])

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <div className="spinner" style={{ width: 40, height: 40 }} />
            </div>
        )
    }

    const name = data.profile?.full_name?.split(' ')[0] || 'Golfer'
    const isActive = data.subscription?.status === 'active'

    return (
        <>
            {/* Header */}
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 className="page-title">Welcome back, {name} 👋</h1>
                    <p className="page-subtitle">Here&apos;s your Par4Charity overview for this month.</p>
                </div>
                {!isActive && (
                    <Link href="/subscribe" className="btn btn-accent">Activate Subscription →</Link>
                )}
            </div>

            {/* Subscription Alert */}
            {!isActive && (
                <div className="alert alert-warning mb-4">
                    ⚠️ You don&apos;t have an active subscription. Subscribe to enter this month&apos;s draw and support your charity.
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid-4 mb-4">
                <div className="stat-card">
                    <div className="stat-label">Subscription</div>
                    <div className="stat-value" style={{ fontSize: '1.25rem' }}>
                        {isActive ? <span className="badge badge-success">Active</span> : <span className="badge badge-error">Inactive</span>}
                    </div>
                    <div className="stat-sub">
                        {isActive ? `${data.subscription?.plan === 'yearly' ? 'Yearly' : 'Monthly'} Plan` : 'No active plan'}
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Scores Entered</div>
                    <div className="stat-value">{data.scores.length}<span style={{ fontSize: '1rem', color: 'var(--color-text-muted)' }}>/5</span></div>
                    <div className="stat-sub">{5 - data.scores.length} more needed</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Total Won</div>
                    <div className="stat-value text-gold">£{(data.winnings.total / 100).toFixed(2)}</div>
                    <div className="stat-sub">£{(data.winnings.pending / 100).toFixed(2)} pending payout</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Next Draw</div>
                    <div className="stat-value" style={{ fontSize: '1rem' }}>{data.nextDraw}</div>
                    <div className="stat-sub">{isActive && data.scores.length >= 5 ? '✅ You are entered' : '⚠️ Not yet eligible'}</div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                {/* Scores */}
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                        <h3 style={{ fontSize: '1rem', color: 'var(--color-text)' }}>⛳ My Scores</h3>
                        <Link href="/dashboard/scores" className="btn btn-ghost btn-sm">Manage →</Link>
                    </div>
                    {data.scores.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--color-text-muted)' }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>⛳</div>
                            <p style={{ fontSize: '0.875rem' }}>No scores yet. Add your first golf score to enter draws.</p>
                            <Link href="/dashboard/scores" className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }}>Add Scores</Link>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {data.scores.map((score, i) => (
                                <div key={score.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div className={`score-ball ${i === 0 ? 'score-ball-accent' : 'score-ball-primary'}`}>{score.score}</div>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text)' }}>{score.score} pts</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)' }}>
                                            {new Date(score.played_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </div>
                                    </div>
                                    {i === 0 && <span className="badge badge-accent" style={{ marginLeft: 'auto', fontSize: '0.65rem' }}>Latest</span>}
                                </div>
                            ))}
                            {data.scores.length < 5 && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', opacity: 0.5 }}>
                                    <div className="score-ball score-ball-empty">+</div>
                                    <span style={{ fontSize: '0.875rem', color: 'var(--color-text-dim)' }}>Add {5 - data.scores.length} more score{5 - data.scores.length !== 1 ? 's' : ''}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Right Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Charity */}
                    <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <h3 style={{ fontSize: '1rem', color: 'var(--color-text)' }}>🌱 My Charity</h3>
                            <Link href="/dashboard/charity" className="btn btn-ghost btn-sm">Change →</Link>
                        </div>
                        {data.charity ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ fontSize: '2.5rem' }}>{data.charity.icon}</div>
                                <div>
                                    <div style={{ fontWeight: 700, color: 'var(--color-text)' }}>{data.charity.name}</div>
                                    <div style={{ fontSize: '0.825rem', color: 'var(--color-accent)', fontWeight: 600, marginTop: '0.25rem' }}>
                                        {data.subscription?.charity_percentage || 10}% of your subscription
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '1.5rem 0', color: 'var(--color-text-muted)' }}>
                                <p className="text-sm">No charity selected yet.</p>
                                <Link href="/dashboard/charity" className="btn btn-accent btn-sm" style={{ marginTop: '1rem' }}>Pick a Charity</Link>
                            </div>
                        )}
                    </div>

                    {/* Subscription Info */}
                    {isActive && (
                        <div className="card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                                <h3 style={{ fontSize: '1rem', color: 'var(--color-text)' }}>💳 Subscription</h3>
                                <Link href="/dashboard/subscription" className="btn btn-ghost btn-sm">Manage →</Link>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                    <span style={{ color: 'var(--color-text-muted)' }}>Plan</span>
                                    <strong style={{ textTransform: 'capitalize' }}>{data.subscription?.plan}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                    <span style={{ color: 'var(--color-text-muted)' }}>Renews</span>
                                    <strong>{data.subscription?.current_period_end ? new Date(data.subscription.current_period_end).toLocaleDateString('en-GB') : 'N/A'}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                    <span style={{ color: 'var(--color-text-muted)' }}>Status</span>
                                    <span className="badge badge-success">Active</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Quick Actions */}
                    <div className="card">
                        <h3 style={{ fontSize: '1rem', color: 'var(--color-text)', marginBottom: '1rem' }}>⚡ Quick Actions</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <Link href="/dashboard/scores" className="btn btn-outline btn-sm" style={{ justifyContent: 'flex-start', gap: '0.5rem' }}>⛳ Add New Score</Link>
                            <Link href="/dashboard/draws" className="btn btn-outline btn-sm" style={{ justifyContent: 'flex-start', gap: '0.5rem' }}>🎰 View Draw Results</Link>
                            <Link href="/dashboard/winnings" className="btn btn-outline btn-sm" style={{ justifyContent: 'flex-start', gap: '0.5rem' }}>🏆 My Winnings</Link>
                            {!isActive && <Link href="/subscribe" className="btn btn-accent btn-sm" style={{ justifyContent: 'flex-start', gap: '0.5rem' }}>💳 Subscribe Now</Link>}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
