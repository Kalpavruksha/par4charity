'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface Subscription {
    id: string
    plan: string
    status: string
    current_period_start: string
    current_period_end: string
    cancel_at_period_end: boolean
    charity_percentage: number
}

export default function SubscriptionPage() {
    const supabase = createClient()
    const [sub, setSub] = useState<Subscription | null>(null)
    const [loading, setLoading] = useState(true)
    const [cancelling, setCancelling] = useState(false)
    const [message, setMessage] = useState('')

    useEffect(() => {
        const fetch = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return
            const { data } = await supabase.from('subscriptions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle()
            setSub(data)
            setLoading(false)
        }
        fetch()
    }, [])

    const handlePortal = async () => {
        setCancelling(true)
        const res = await fetch('/api/stripe/portal', { method: 'POST' })
        const data = await res.json()
        if (data.url) window.location.href = data.url
        setCancelling(false)
    }

    if (loading) return <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" /></div>

    return (
        <>
            <div className="page-header">
                <h1 className="page-title">💳 Subscription</h1>
                <p className="page-subtitle">Manage your plan, billing, and renewal settings.</p>
            </div>

            {message && <div className="alert alert-info mb-4">{message}</div>}

            {!sub || sub.status === 'inactive' || sub.status === 'cancelled' ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>💳</div>
                    <h3 style={{ color: 'var(--color-text)', marginBottom: '0.75rem' }}>No active subscription</h3>
                    <p style={{ marginBottom: '2rem' }}>Subscribe to enter monthly prize draws and support your charity.</p>
                    <Link href="/subscribe" className="btn btn-accent btn-lg">Choose a Plan</Link>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div className="card">
                        <h3 style={{ fontSize: '1rem', color: 'var(--color-text)', marginBottom: '1.5rem' }}>📋 Plan Details</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {[
                                { label: 'Plan', value: <strong style={{ textTransform: 'capitalize' }}>{sub.plan}</strong> },
                                { label: 'Status', value: <span className={`badge ${sub.status === 'active' ? 'badge-success' : 'badge-warning'}`}>{sub.status}</span> },
                                { label: 'Current period', value: <strong>{new Date(sub.current_period_start).toLocaleDateString('en-GB')} – {new Date(sub.current_period_end).toLocaleDateString('en-GB')}</strong> },
                                { label: 'Renewal', value: sub.cancel_at_period_end ? <span className="badge badge-error">Cancels at period end</span> : <strong>Auto-renews {new Date(sub.current_period_end).toLocaleDateString('en-GB')}</strong> },
                                { label: 'Charity contribution', value: <strong style={{ color: 'var(--color-accent)' }}>{sub.charity_percentage}%</strong> },
                            ].map(item => (
                                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--color-border)' }}>
                                    <span style={{ color: 'var(--color-text-muted)' }}>{item.label}</span>
                                    {item.value}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div className="card">
                            <h3 style={{ fontSize: '1rem', color: 'var(--color-text)', marginBottom: '1rem' }}>⚙️ Manage Billing</h3>
                            <p className="text-sm mb-3">Access Stripe&apos;s customer portal to update payment details, view invoices, or cancel your subscription.</p>
                            <button className="btn btn-outline w-full" onClick={handlePortal} disabled={cancelling}>
                                {cancelling ? <><span className="spinner" /> Redirecting...</> : '🔗 Open Billing Portal'}
                            </button>
                        </div>

                        <div className="card" style={{ background: 'rgba(34,197,94,0.05)', borderColor: 'rgba(34,197,94,0.2)' }}>
                            <h3 style={{ fontSize: '1rem', color: 'var(--color-text)', marginBottom: '1rem' }}>✅ What&apos;s included</h3>
                            {['Monthly prize draw entry', 'Score tracking dashboard', 'Charity contribution', 'Winner verification support', 'Email draw notifications'].map(f => (
                                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                                    <span style={{ color: 'var(--color-success)' }}>✓</span> {f}
                                </div>
                            ))}
                        </div>

                        <div className="alert alert-info" style={{ fontSize: '0.8rem' }}>
                            💡 Want to upgrade or change plans? Use the Billing Portal above.
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
