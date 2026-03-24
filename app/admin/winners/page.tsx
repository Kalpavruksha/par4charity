'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Winner {
    id: string
    match_type: number
    matched_numbers: number[]
    prize_amount: number
    proof_url: string | null
    verification_status: string
    payout_status: string
    admin_notes: string | null
    proof_submitted_at: string | null
    draws: { draw_month: string } | null
    profiles: { email: string; full_name: string | null } | null
}

const BADGE_MAP: Record<string, string> = {
    pending: 'badge-warning',
    proof_required: 'badge-warning',
    under_review: 'badge-primary',
    approved: 'badge-success',
    rejected: 'badge-error',
}

export default function AdminWinnersPage() {
    const supabase = createClient()
    const [winners, setWinners] = useState<Winner[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')
    const [processing, setProcessing] = useState<string | null>(null)
    const [notes, setNotes] = useState<Record<string, string>>({})
    const [message, setMessage] = useState('')

    const fetchWinners = async () => {
        let query = supabase.from('winners').select('*, draws(draw_month), profiles(email, full_name)').order('created_at', { ascending: false })
        const { data } = await query
        setWinners((data as Winner[]) || [])
        setLoading(false)
    }

    useEffect(() => { fetchWinners() }, [])

    const updateStatus = async (id: string, verStatus: string, payStatus?: string) => {
        setProcessing(id)
        const update: Record<string, unknown> = {
            verification_status: verStatus,
            admin_notes: notes[id] || null,
            verified_at: new Date().toISOString(),
        }
        if (payStatus) update.payout_status = payStatus
        if (payStatus === 'paid') update.paid_at = new Date().toISOString()
        const { data: { user } } = await supabase.auth.getUser()
        update.verified_by = user!.id
        await supabase.from('winners').update(update).eq('id', id)
        setMessage(`Winner ${verStatus}!`)
        fetchWinners()
        setProcessing(null)
    }

    const filtered = winners.filter(w =>
        filter === 'all' ? true : filter === 'pending' ? ['pending', 'proof_required', 'under_review'].includes(w.verification_status) : w.verification_status === filter
    )

    return (
        <>
            <div className="page-header">
                <h1 className="page-title">🏆 Winners</h1>
                <p className="page-subtitle">Verify winner submissions and track payouts.</p>
            </div>

            {message && <div className="alert alert-success mb-4">{message}</div>}

            {/* Filter */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                {['all', 'pending', 'under_review', 'approved', 'rejected'].map(f => (
                    <button key={f} className={`badge ${filter === f ? 'badge-primary' : 'badge-muted'}`} style={{ cursor: 'pointer', padding: '0.4rem 1rem', fontSize: '0.8rem' }} onClick={() => setFilter(f)}>
                        {f.replace(/_/g, ' ')}
                    </button>
                ))}
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" /></div>
            ) : filtered.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏆</div>
                    <p style={{ color: 'var(--color-text-muted)' }}>No winners in this category.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {filtered.map(winner => (
                        <div key={winner.id} className="card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
                                <div>
                                    <div style={{ fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.25rem' }}>
                                        {winner.profiles?.email || 'Unknown'}
                                        {winner.profiles?.full_name && <span style={{ color: 'var(--color-text-muted)', fontWeight: 400, marginLeft: '0.5rem', fontSize: '0.875rem' }}>({winner.profiles.full_name})</span>}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-dim)' }}>
                                        Draw: {winner.draws?.draw_month} · {winner.match_type}-Number Match
                                        {winner.proof_submitted_at && ` · Proof submitted: ${new Date(winner.proof_submitted_at).toLocaleDateString('en-GB')}`}
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-gold-light)', marginBottom: '0.25rem' }}>
                                        £{(winner.prize_amount / 100).toFixed(2)}
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                        <span className={`badge ${BADGE_MAP[winner.verification_status] || 'badge-muted'}`} style={{ fontSize: '0.65rem' }}>
                                            {winner.verification_status.replace(/_/g, ' ')}
                                        </span>
                                        <span className={`badge ${winner.payout_status === 'paid' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.65rem' }}>
                                            {winner.payout_status}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Matched numbers */}
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                                {winner.matched_numbers.map(n => (
                                    <div key={n} className="draw-number matched" style={{ width: 40, height: 40, fontSize: '0.875rem' }}>{n}</div>
                                ))}
                            </div>

                            {/* Proof */}
                            {winner.proof_url && (
                                <a href={winner.proof_url} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm" style={{ display: 'inline-flex', marginBottom: '1rem' }}>
                                    📎 View Submitted Proof
                                </a>
                            )}

                            {/* Admin Actions */}
                            {(winner.verification_status === 'under_review' || winner.verification_status === 'pending') && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
                                    <div className="form-group">
                                        <label className="form-label">Admin Notes (optional)</label>
                                        <input className="form-input" placeholder="Reason for approval/rejection..." value={notes[winner.id] || ''} onChange={e => setNotes({ ...notes, [winner.id]: e.target.value })} />
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                        <button id={`approve-${winner.id}`} className="btn btn-accent btn-sm" onClick={() => updateStatus(winner.id, 'approved')} disabled={processing === winner.id}>
                                            {processing === winner.id ? <span className="spinner" /> : '✅ Approve'}
                                        </button>
                                        <button className="btn btn-outline btn-sm" style={{ color: 'var(--color-error)', borderColor: 'var(--color-error)' }} onClick={() => updateStatus(winner.id, 'rejected')} disabled={processing === winner.id}>
                                            ❌ Reject
                                        </button>
                                    </div>
                                </div>
                            )}

                            {winner.verification_status === 'approved' && winner.payout_status !== 'paid' && (
                                <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
                                    <button id={`mark-paid-${winner.id}`} className="btn btn-gold btn-sm" onClick={() => updateStatus(winner.id, 'approved', 'paid')} disabled={processing === winner.id}>
                                        {processing === winner.id ? <span className="spinner" /> : '💸 Mark as Paid'}
                                    </button>
                                </div>
                            )}

                            {winner.admin_notes && (
                                <div style={{ paddingTop: '0.75rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                                    📝 Note: {winner.admin_notes}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </>
    )
}
