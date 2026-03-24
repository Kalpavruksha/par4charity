'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

import Navbar from '@/components/Navbar'

const PLANS = {
    monthly: { name: 'Monthly', price: '£9.99', per: '/month', amount: 999 },
    yearly: { name: 'Yearly', price: '£99.99', per: '/year', amount: 9999, badge: 'Best Value' },
}

const charities = [
    { id: 'golf-foundation', name: 'Golf Foundation', icon: '⛳', category: 'Youth & Sport' },
    { id: 'macmillan', name: 'Macmillan Cancer Support', icon: '💚', category: 'Health' },
    { id: 'wwf', name: 'WWF', icon: '🌿', category: 'Environment' },
    { id: 'bhf', name: 'British Heart Foundation', icon: '❤️', category: 'Health' },
    { id: 'rnli', name: 'RNLI', icon: '🌊', category: 'Emergency Services' },
    { id: 'alzheimers', name: "Alzheimer's Society", icon: '🧠', category: 'Health' },
]

function SubscribeContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const supabase = createClient()

    const [step, setStep] = useState(1) // 1=plan, 2=charity, 3=payment
    const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>(
        (searchParams.get('plan') as 'monthly' | 'yearly') || 'monthly'
    )
    const [selectedCharity, setSelectedCharity] = useState('')
    const [charityPercent, setCharityPercent] = useState(10)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [user, setUser] = useState<{ id: string; email: string } | null>(null)

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            if (data.user) {
                setUser({ id: data.user.id, email: data.user.email || '' })
            }
        })
    }, [])

    const handleCheckout = async () => {
        if (!user) { router.push('/auth/signup?plan=' + selectedPlan); return }
        if (!selectedCharity) { setError('Please select a charity.'); return }
        setLoading(true)
        setError('')
        try {
            const res = await fetch('/api/stripe/create-checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plan: selectedPlan, charityId: selectedCharity, charityPercent }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Checkout failed')
            window.location.href = data.url
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Something went wrong.')
        } finally {
            setLoading(false)
        }
    }

    const plan = PLANS[selectedPlan]

    return (
        <div style={{
            minHeight: '100vh',
            background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(108,99,255,0.1) 0%, transparent 60%), var(--color-bg)',
            paddingTop: '5rem',
        }}>
            <Navbar />
            <div style={{ maxWidth: 720, margin: '2rem auto 3rem', padding: '0 1rem' }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <Link href="/" className="nav-logo" style={{ fontSize: '1.5rem', display: 'inline-block' }}>Par4Charity</Link>
                </div>

                {/* Progress */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '2.5rem' }}>
                    {['Choose Plan', 'Pick Charity', 'Payment'].map((s, i) => (
                        <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{
                                width: 28, height: 28, borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.8rem', fontWeight: 700,
                                background: step > i + 1 ? 'var(--color-accent)' : step === i + 1 ? 'var(--color-primary)' : 'var(--color-surface)',
                                color: step > i + 1 ? '#09090f' : step === i + 1 ? 'white' : 'var(--color-text-dim)',
                                border: `1px solid ${step >= i + 1 ? 'transparent' : 'var(--color-border)'}`,
                            }}>
                                {step > i + 1 ? '✓' : i + 1}
                            </div>
                            <span style={{ fontSize: '0.8rem', color: step === i + 1 ? 'var(--color-text)' : 'var(--color-text-dim)', fontWeight: step === i + 1 ? 600 : 400 }}>{s}</span>
                            {i < 2 && <span style={{ color: 'var(--color-border-hover)', margin: '0 0.25rem' }}>—</span>}
                        </div>
                    ))}
                </div>

                {/* STEP 1: Plan */}
                {step === 1 && (
                    <div className="animate-fade-up">
                        <h2 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>Choose Your <span className="text-gradient">Plan</span></h2>
                        <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginBottom: '2rem' }}>Both plans give full access to draws, scores, and charity contributions.</p>
                        <div className="plan-cards">
                            {(Object.entries(PLANS) as ['monthly' | 'yearly', typeof PLANS.monthly][]).map(([key, p]) => (
                                <div
                                    key={key}
                                    id={`plan-${key}`}
                                    className={`plan-card ${selectedPlan === key ? 'selected' : ''} ${'badge' in p ? 'featured' : ''}`}
                                    onClick={() => setSelectedPlan(key)}
                                >
                                    {('badge' in p && typeof (p as { badge?: string }).badge === 'string') ? <div className="plan-badge">{(p as { badge: string }).badge}</div> : null}
                                    <div className="plan-name">{p.name}</div>
                                    <div className="plan-price">{p.price}<span>{p.per}</span></div>
                                    {key === 'yearly' && <div style={{ fontSize: '0.8rem', color: 'var(--color-accent)', fontWeight: 600 }}>Save £19.89</div>}
                                    <div className="plan-features" style={{ marginTop: '1.25rem' }}>
                                        {['All monthly prize draws', 'Score tracking', 'Charity contribution', 'Winner verification'].map(f => (
                                            <div key={f} className="plan-feature">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                                                {f}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                            <button className="btn btn-primary btn-lg" onClick={() => setStep(2)}>
                                Continue with {plan.name} — {plan.price}
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 2: Charity */}
                {step === 2 && (
                    <div className="animate-fade-up">
                        <h2 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>Pick Your <span className="text-gradient">Charity</span></h2>
                        <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginBottom: '2rem' }}>At least 10% of your subscription will go directly to your chosen charity.</p>
                        {error && <div className="alert alert-error mb-3">{error}</div>}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                            {charities.map((c) => (
                                <div
                                    key={c.id}
                                    id={`charity-${c.id}`}
                                    className="card"
                                    style={{
                                        cursor: 'pointer',
                                        border: selectedCharity === c.id ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
                                        background: selectedCharity === c.id ? 'rgba(0,212,170,0.06)' : 'var(--color-surface)',
                                    }}
                                    onClick={() => { setSelectedCharity(c.id); setError('') }}
                                >
                                    <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{c.icon}</div>
                                    <div style={{ fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.25rem', fontSize: '0.95rem' }}>{c.name}</div>
                                    <div className="badge badge-muted" style={{ fontSize: '0.65rem' }}>{c.category}</div>
                                </div>
                            ))}
                        </div>

                        {selectedCharity && (
                            <div className="card mb-4" style={{ background: 'rgba(0,212,170,0.05)', borderColor: 'rgba(0,212,170,0.2)' }}>
                                <label className="form-label" style={{ marginBottom: '0.75rem', display: 'block' }}>
                                    Your charity contribution: <strong style={{ color: 'var(--color-accent)' }}>{charityPercent}%</strong> of subscription
                                </label>
                                <input
                                    type="range" min={10} max={100} value={charityPercent}
                                    onChange={e => setCharityPercent(parseInt(e.target.value))}
                                    style={{ width: '100%', accentColor: 'var(--color-accent)' }}
                                />
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-text-dim)', marginTop: '0.5rem' }}>
                                    <span>Min 10%</span><span>Max 100%</span>
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button className="btn btn-outline" onClick={() => setStep(1)}>← Back</button>
                            <button className="btn btn-primary btn-lg" onClick={() => { if (!selectedCharity) { setError('Please select a charity to continue.'); return } setStep(3) }}>
                                Continue to Payment →
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 3: Payment Summary */}
                {step === 3 && (
                    <div className="animate-fade-up">
                        <h2 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>Order <span className="text-gradient">Summary</span></h2>
                        <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginBottom: '2rem' }}>Review your subscription details before completing payment.</p>
                        {error && <div className="alert alert-error mb-3">{error}</div>}

                        <div className="card mb-3">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Plan</span>
                                <strong>{plan.name} — {plan.price}{plan.per}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Charity</span>
                                <strong>{charities.find(c => c.id === selectedCharity)?.icon} {charities.find(c => c.id === selectedCharity)?.name}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Your charity contribution</span>
                                <strong style={{ color: 'var(--color-accent)' }}>{charityPercent}% of subscription</strong>
                            </div>
                            <div className="divider" />
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 700 }}>Total due today</span>
                                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text)' }}>{plan.price}</span>
                            </div>
                        </div>

                        <div className="alert alert-info mb-3" style={{ fontSize: '0.8rem' }}>
                            🔒 Payments are processed securely via Stripe. Your card details are never stored on our servers.
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button className="btn btn-outline" onClick={() => setStep(2)}>← Back</button>
                            <button id="subscribe-checkout" className="btn btn-accent btn-lg" onClick={handleCheckout} disabled={loading}>
                                {loading ? <><span className="spinner" /> Redirecting...</> : `Pay ${plan.price} Securely`}
                            </button>
                        </div>

                        {!user && (
                            <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                                You&apos;ll be asked to create an account before payment.
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default function SubscribePage() {
    return (
        <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner" /></div>}>
            <SubscribeContent />
        </Suspense>
    )
}
