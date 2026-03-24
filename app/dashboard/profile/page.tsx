'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Profile {
    full_name: string
    phone: string
    handicap: string
    avatar_url: string
}

export default function ProfilePage() {
    const supabase = createClient()
    const [profile, setProfile] = useState<Profile>({ full_name: '', phone: '', handicap: '', avatar_url: '' })
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const [success, setSuccess] = useState('')
    const [error, setError] = useState('')

    useEffect(() => {
        const fetch = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return
            setEmail(user.email || '')
            const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
            if (data) setProfile({ full_name: data.full_name || '', phone: data.phone || '', handicap: data.handicap || '', avatar_url: data.avatar_url || '' })
            setFetching(false)
        }
        fetch()
    }, [])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true); setError(''); setSuccess('')
        const { data: { user } } = await supabase.auth.getUser()
        const { error: err } = await supabase.from('profiles').update({
            full_name: profile.full_name,
            phone: profile.phone,
            handicap: profile.handicap ? parseInt(profile.handicap) : null,
        }).eq('id', user!.id)
        if (err) setError(err.message)
        else setSuccess('Profile updated successfully!')
        setLoading(false)
    }

    if (fetching) return <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" /></div>

    return (
        <>
            <div className="page-header">
                <h1 className="page-title">👤 My Profile</h1>
                <p className="page-subtitle">Update your personal information and golf handicap.</p>
            </div>

            <div style={{ maxWidth: 560 }}>
                {success && <div className="alert alert-success mb-4">{success}</div>}
                {error && <div className="alert alert-error mb-4">{error}</div>}
                <div className="card">
                    <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input className="form-input" type="email" value={email} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                            <div className="form-hint">Email cannot be changed here.</div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input id="profile-name" className="form-input" type="text" value={profile.full_name} onChange={e => setProfile({ ...profile, full_name: e.target.value })} placeholder="Your full name" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Phone Number</label>
                            <input id="profile-phone" className="form-input" type="tel" value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} placeholder="+44 7700 900000" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Golf Handicap</label>
                            <input id="profile-handicap" className="form-input" type="number" min={0} max={54} value={profile.handicap} onChange={e => setProfile({ ...profile, handicap: e.target.value })} placeholder="e.g. 14" />
                        </div>
                        <button id="profile-save" className="btn btn-primary" type="submit" disabled={loading}>
                            {loading ? <><span className="spinner" /> Saving...</> : 'Save Profile'}
                        </button>
                    </form>
                </div>
            </div>
        </>
    )
}
