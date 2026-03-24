'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
    const router = useRouter()
    const supabase = createClient()

    const [form, setForm] = useState({ email: '', password: '' })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const { data, error: supaErr } = await supabase.auth.signInWithPassword({
                email: form.email,
                password: form.password,
            })
            if (supaErr) throw supaErr

            // Check if admin
            const { data: profile } = await supabase
                .from('profiles')
                .select('is_admin')
                .eq('id', data.user.id)
                .single()

            if (profile?.is_admin) {
                router.push('/admin')
            } else {
                router.push('/dashboard')
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Login failed. Check your credentials.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card animate-fade-up">
                <div className="auth-logo">
                    <Link href="/" className="nav-logo" style={{ fontSize: '1.5rem', display: 'inline-block' }}>Par4Charity</Link>
                </div>
                <h1 className="auth-title">Welcome back</h1>
                <p className="auth-subtitle">Log in to your account to continue.</p>

                {error && <div className="alert alert-error mb-3">{error}</div>}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                            id="login-email"
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
                            id="login-password"
                            className="form-input"
                            type="password"
                            placeholder="••••••••"
                            value={form.password}
                            onChange={e => setForm({ ...form, password: e.target.value })}
                            required
                        />
                    </div>

                    <div style={{ textAlign: 'right' }}>
                        <Link href="/auth/forgot-password" style={{ fontSize: '0.825rem', color: 'var(--color-primary-light)' }}>
                            Forgot password?
                        </Link>
                    </div>

                    <button id="login-submit" className="btn btn-primary w-full" type="submit" disabled={loading}>
                        {loading ? <><span className="spinner" /> Logging in...</> : 'Log In'}
                    </button>
                </form>

                <div className="auth-footer">
                    Don&apos;t have an account? <Link href="/auth/signup">Sign up free</Link>
                </div>
            </div>
        </div>
    )
}
