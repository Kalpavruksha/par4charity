'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Subscription {
    id: string
    user_id: string
    plan: string
    status: string
    current_period_end: string
    cancel_at_period_end: boolean
    stripe_subscription_id: string | null
    profiles: { email: string; full_name: string | null } | null
}

export default function AdminSubscriptionsPage() {
    const supabase = createClient()
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')
    const [search, setSearch] = useState('')

    useEffect(() => {
        const fetch = async () => {
            const { data } = await supabase
                .from('subscriptions')
                .select('*, profiles(email, full_name)')
                .order('created_at', { ascending: false })
            setSubscriptions((data as Subscription[]) || [])
            setLoading(false)
        }
        fetch()
    }, [])

    const filtered = subscriptions.filter(s => {
        const matchFilter = filter === 'all' ? true : s.status === filter
        const matchSearch = !search || s.profiles?.email?.toLowerCase().includes(search.toLowerCase()) || s.profiles?.full_name?.toLowerCase().includes(search.toLowerCase())
        return matchFilter && matchSearch
    })

    const activeCount = subscriptions.filter(s => s.status === 'active').length
    const monthlyCount = subscriptions.filter(s => s.plan === 'monthly' && s.status === 'active').length
    const yearlyCount = subscriptions.filter(s => s.plan === 'yearly' && s.status === 'active').length
    const mrr = (monthlyCount * 999 + yearlyCount * (9999 / 12)) / 100

    return (
        <>
            <div className="page-header">
                <h1 className="page-title">💳 Subscriptions</h1>
                <p className="page-subtitle">View and manage all subscriber accounts and their subscription status.</p>
            </div>

            <div className="grid-4 mb-4">
                <div className="stat-card">
                    <div className="stat-label">Active Subscribers</div>
                    <div className="stat-value text-gradient">{activeCount}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Monthly Plans</div>
                    <div className="stat-value">{monthlyCount}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Yearly Plans</div>
                    <div className="stat-value">{yearlyCount}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">MRR</div>
                    <div className="stat-value text-gold">£{mrr.toFixed(0)}</div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {['all', 'active', 'cancelled', 'past_due'].map(f => (
                        <button key={f} className={`badge ${filter === f ? 'badge-primary' : 'badge-muted'}`} style={{ cursor: 'pointer', padding: '0.4rem 1rem' }} onClick={() => setFilter(f)}>
                            {f.replace(/_/g, ' ')}
                        </button>
                    ))}
                </div>
                <input className="form-input" placeholder="🔍 Search..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 240, fontSize: '0.875rem' }} />
            </div>

            <div className="card">
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" /></div>
                ) : (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Plan</th>
                                    <th>Status</th>
                                    <th>Renews</th>
                                    <th>Cancel at end</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(s => (
                                    <tr key={s.id}>
                                        <td>
                                            <strong>{s.profiles?.email}</strong>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)' }}>{s.profiles?.full_name}</div>
                                        </td>
                                        <td>
                                            <span className={`badge ${s.plan === 'yearly' ? 'badge-gold' : 'badge-primary'}`} style={{ fontSize: '0.7rem', textTransform: 'capitalize' }}>
                                                {s.plan}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${s.status === 'active' ? 'badge-success' : s.status === 'past_due' ? 'badge-warning' : 'badge-error'}`} style={{ fontSize: '0.7rem' }}>
                                                {s.status}
                                            </span>
                                        </td>
                                        <td style={{ fontSize: '0.825rem' }}>{s.current_period_end ? new Date(s.current_period_end).toLocaleDateString('en-GB') : '—'}</td>
                                        <td>
                                            {s.cancel_at_period_end
                                                ? <span className="badge badge-error" style={{ fontSize: '0.7rem' }}>Yes</span>
                                                : <span className="badge badge-muted" style={{ fontSize: '0.7rem' }}>No</span>}
                                        </td>
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
