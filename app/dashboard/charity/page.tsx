'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const charities = [
    { id: null as null, slug: 'golf-foundation', name: 'Golf Foundation', icon: '⛳', category: 'Youth & Sport', desc: 'Introducing golf to young people across the UK.' },
    { id: null as null, slug: 'macmillan-cancer-support', name: 'Macmillan Cancer Support', icon: '💚', category: 'Health', desc: 'Supporting people living with cancer.' },
    { id: null as null, slug: 'wwf', name: 'WWF', icon: '🌿', category: 'Environment', desc: 'Conservation of nature worldwide.' },
    { id: null as null, slug: 'british-heart-foundation', name: 'British Heart Foundation', icon: '❤️', category: 'Health', desc: 'Funding heart disease research.' },
    { id: null as null, slug: 'rnli', name: 'RNLI', icon: '🌊', category: 'Emergency Services', desc: 'Saving lives at sea.' },
    { id: null as null, slug: 'alzheimers-society', name: "Alzheimer's Society", icon: '🧠', category: 'Health', desc: 'Supporting those affected by dementia.' },
]

export default function CharityDashPage() {
    const supabase = createClient()
    const [selectedSlug, setSelectedSlug] = useState('')
    const [percentage, setPercentage] = useState(10)
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const [success, setSuccess] = useState('')
    const [error, setError] = useState('')
    const [dbCharities, setDbCharities] = useState<Record<string, string>>({})  // slug -> id

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return
            const [{ data: charityData }, { data: sub }] = await Promise.all([
                supabase.from('charities').select('id, slug'),
                supabase.from('subscriptions').select('charity_id, charity_percentage').eq('user_id', user.id).eq('status', 'active').maybeSingle(),
            ])
            const slugMap: Record<string, string> = {}
            charityData?.forEach(c => { slugMap[c.slug] = c.id })
            setDbCharities(slugMap)
            if (sub?.charity_id) {
                const slug = charityData?.find(c => c.id === sub.charity_id)?.slug || ''
                setSelectedSlug(slug)
                setPercentage(sub.charity_percentage || 10)
            }
            setFetching(false)
        }
        fetchData()
    }, [])

    const handleSave = async () => {
        if (!selectedSlug) { setError('Please select a charity.'); return }
        setLoading(true); setError(''); setSuccess('')
        const { data: { user } } = await supabase.auth.getUser()
        const charityId = dbCharities[selectedSlug]
        const { error: err } = await supabase.from('subscriptions')
            .update({ charity_id: charityId, charity_percentage: percentage })
            .eq('user_id', user!.id)
        if (err) { setError(err.message) } else { setSuccess('Your charity preference has been saved!') }
        setLoading(false)
    }

    const selected = charities.find(c => c.slug === selectedSlug)

    return (
        <>
            <div className="page-header">
                <h1 className="page-title">🌱 My Charity</h1>
                <p className="page-subtitle">Choose which charity receives a portion of your subscription every month.</p>
            </div>

            {fetching ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" /></div>
            ) : (
                <>
                    {success && <div className="alert alert-success mb-4">{success}</div>}
                    {error && <div className="alert alert-error mb-4">{error}</div>}

                    {/* Current Charity */}
                    {selected && (
                        <div className="card mb-4" style={{ background: 'rgba(0,212,170,0.05)', borderColor: 'rgba(0,212,170,0.2)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ fontSize: '3rem' }}>{selected.icon}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--color-text)' }}>{selected.name}</div>
                                    <div style={{ color: 'var(--color-accent)', fontWeight: 700, fontSize: '1rem' }}>{percentage}% of subscription → this charity</div>
                                </div>
                                <span className="badge badge-accent">Currently Selected</span>
                            </div>
                        </div>
                    )}

                    {/* Charity Grid */}
                    <div className="grid-3 mb-4">
                        {charities.map((c) => (
                            <div
                                key={c.slug}
                                className="charity-card"
                                style={{ cursor: 'pointer', border: selectedSlug === c.slug ? '2px solid var(--color-accent)' : '1px solid var(--color-border)', background: selectedSlug === c.slug ? 'rgba(0,212,170,0.06)' : 'var(--color-surface)' }}
                                onClick={() => { setSelectedSlug(c.slug); setSuccess(''); setError('') }}
                            >
                                <div className="charity-banner">{c.icon}</div>
                                <div className="charity-body">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <h3 className="charity-name" style={{ fontSize: '0.95rem' }}>{c.name}</h3>
                                        {selectedSlug === c.slug && <span className="badge badge-accent" style={{ fontSize: '0.6rem' }}>✓</span>}
                                    </div>
                                    <p className="charity-desc" style={{ fontSize: '0.8rem' }}>{c.desc}</p>
                                    <span className="badge badge-muted" style={{ fontSize: '0.65rem' }}>{c.category}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Contribution Slider */}
                    {selectedSlug && (
                        <div className="card mb-4">
                            <h3 style={{ fontSize: '1rem', color: 'var(--color-text)', marginBottom: '1rem' }}>💰 Contribution Percentage</h3>
                            <p className="text-sm mb-3">How much of your subscription should go to <strong style={{ color: 'var(--color-accent)' }}>{selected?.name}</strong>?</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                                <input type="range" min={10} max={100} value={percentage} onChange={e => setPercentage(parseInt(e.target.value))} style={{ flex: 1, accentColor: 'var(--color-accent)' }} />
                                <span style={{ fontWeight: 800, fontSize: '1.5rem', color: 'var(--color-accent)', minWidth: 60, textAlign: 'right' }}>{percentage}%</span>
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-dim)' }}>Minimum 10% · Maximum 100% · Monthly subscription: £9.99 → <strong style={{ color: 'var(--color-accent)' }}>£{(9.99 * percentage / 100).toFixed(2)}</strong> to charity</div>
                        </div>
                    )}

                    <button id="charity-save" className="btn btn-accent btn-lg" onClick={handleSave} disabled={loading || !selectedSlug}>
                        {loading ? <><span className="spinner" /> Saving...</> : 'Save Charity Preference'}
                    </button>
                </>
            )}
        </>
    )
}
