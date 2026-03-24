'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function SignupForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const plan = searchParams.get('plan') || 'monthly'
    const supabase = createClient()

    const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return }
        if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return }
        setLoading(true)
        try {
            const { error: supaErr } = await supabase.auth.signUp({
                email: form.email,
                password: form.password,
                options: { data: { full_name: form.fullName } }
            })
            if (supaErr) throw supaErr
            router.push(`/subscribe?plan=${plan}&new=1`)
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Signup failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card animate-fade-up">
                <div className="auth-logo">
                    <div className="nav-logo" style={{ fontSize: '1.5rem', display: 'inline-block' }}>Par4Charity</div>
                </div>
                <h1 className="auth-title">Create your account</h1>
                <p className="auth-subtitle">Start playing for good. No commitment needed.</p>

                {error && <div className="alert alert-error mb-3">{error}</div>}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input
                            id="fullName"
                            className="form-input"
                            type="text"
                            placeholder="Jane Golfer"
                            value={form.fullName}
                            onChange={e => setForm({ ...form, fullName: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                            id="email"
                            className="form-input"
                            type="email"
                            placeholder="jane@example.com"
                            value={form.email}
                            onChange={e => setForm({ ...form, email: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            id="password"
                            className="form-input"
                            type="password"
                            placeholder="At least 8 characters"
                            value={form.password}
                            onChange={e => setForm({ ...form, password: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Confirm Password</label>
                        <input
                            id="confirmPassword"
                            className="form-input"
                            type="password"
                            placeholder="Repeat your password"
                            value={form.confirmPassword}
                            onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                            required
                        />
                    </div>
                    <button id="signup-submit" className="btn btn-accent w-full" type="submit" disabled={loading} style={{ marginTop: '0.5rem' }}>
                        {loading ? <><span className="spinner" /> Creating account...</> : 'Create Account'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.8rem', color: 'var(--color-text-dim)' }}>
                    By signing up you agree to our <Link href="/terms" style={{ color: 'var(--color-primary-light)' }}>Terms</Link> and <Link href="/privacy" style={{ color: 'var(--color-primary-light)' }}>Privacy Policy</Link>.
                </p>
                <div className="auth-footer">
                    Already have an account? <Link href="/auth/login">Log in</Link>
                </div>
            </div>
        </div>
    )
}

export default function SignupPage() {
    return (
        <Suspense fallback={<div className="auth-page"><div className="auth-card"><div className="spinner" /></div></div>}>
            <SignupForm />
        </Suspense>
    )
}
