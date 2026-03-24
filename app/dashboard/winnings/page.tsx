'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Winner {
    id: string
    draw_id: string
    match_type: 3 | 4 | 5
    matched_numbers: number[]
    prize_amount: number
    proof_url: string | null
    verification_status: string
    payout_status: string
    draws: { draw_month: string } | null
}

const TIER_LABELS: Record<number, string> = {
    5: '5-Number Match 🏆',
    4: '4-Number Match 🥈',
    3: '3-Number Match 🥉',
}

const BADGE_MAP: Record<string, string> = {
    pending: 'badge-warning',
    proof_required: 'badge-warning',
    under_review: 'badge-primary',
    approved: 'badge-success',
    rejected: 'badge-error',
}

export default function WinningsPage() {
    const supabase = createClient()
    const [winners, setWinners] = useState<Winner[]>([])
    const [loading, setLoading] = useState(true)
    const [uploadingId, setUploadingId] = useState<string | null>(null)
    const [uploadSuccess, setUploadSuccess] = useState('')

    useEffect(() => {
        const fetch = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return
            const { data } = await supabase
                .from('winners')
                .select('*, draws(draw_month)')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
            setWinners((data as Winner[]) || [])
            setLoading(false)
        }
        fetch()
    }, [])

    const handleProofUpload = async (e: React.ChangeEvent<HTMLInputElement>, winnerId: string) => {
        const file = e.target.files?.[0]
        if (!file) return
        setUploadingId(winnerId)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            const fileName = `proofs/${user!.id}/${winnerId}-${Date.now()}.${file.name.split('.').pop()}`
            const { error: storErr } = await supabase.storage.from('winner-proofs').upload(fileName, file)
            if (storErr) throw storErr
            const { data: urlData } = supabase.storage.from('winner-proofs').getPublicUrl(fileName)
            await supabase.from('winners').update({
                proof_url: urlData.publicUrl,
                proof_submitted_at: new Date().toISOString(),
                verification_status: 'under_review',
            }).eq('id', winnerId)
            setUploadSuccess('Proof uploaded successfully! Our team will review within 48 hours.')
            setWinners(prev => prev.map(w => w.id === winnerId ? { ...w, verification_status: 'under_review', proof_url: urlData.publicUrl } : w))
        } catch (err) {
            console.error(err)
        } finally {
            setUploadingId(null)
        }
    }

    const totalWon = winners.reduce((s, w) => s + w.prize_amount, 0)
    const totalPaid = winners.filter(w => w.payout_status === 'paid').reduce((s, w) => s + w.prize_amount, 0)
    const totalPending = winners.filter(w => w.payout_status !== 'paid').reduce((s, w) => s + w.prize_amount, 0)

    return (
        <>
            <div className="page-header">
                <h1 className="page-title">🏆 My Winnings</h1>
                <p className="page-subtitle">Overview of all your prize draw wins, verification status, and payout tracking.</p>
            </div>

            {uploadSuccess && <div className="alert alert-success mb-4">{uploadSuccess}</div>}

            {/* Stats */}
            <div className="grid-3 mb-4">
                <div className="stat-card">
                    <div className="stat-label">Total Won</div>
                    <div className="stat-value text-gold">£{(totalWon / 100).toFixed(2)}</div>
                    <div className="stat-sub">{winners.length} prize{winners.length !== 1 ? 's' : ''} total</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Paid Out</div>
                    <div className="stat-value" style={{ color: 'var(--color-success)' }}>£{(totalPaid / 100).toFixed(2)}</div>
                    <div className="stat-sub">Received in your account</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Pending</div>
                    <div className="stat-value" style={{ color: 'var(--color-warning)' }}>£{(totalPending / 100).toFixed(2)}</div>
                    <div className="stat-sub">Awaiting verification/payout</div>
                </div>
            </div>

            {/* Winners List */}
            <div className="card">
                <h3 style={{ fontSize: '1rem', color: 'var(--color-text)', marginBottom: '1.25rem' }}>Prize History</h3>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" /></div>
                ) : winners.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--color-text-muted)' }}>
                        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🎯</div>
                        <h3 style={{ color: 'var(--color-text)', marginBottom: '0.5rem' }}>No wins yet</h3>
                        <p>Keep entering your scores each month — the jackpot is waiting!</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {winners.map((w) => (
                            <div key={w.id} style={{
                                padding: '1.25rem', background: 'var(--color-bg)', border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius-lg)',
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
                                    <div>
                                        <div style={{ fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.25rem' }}>
                                            {TIER_LABELS[w.match_type]}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-dim)' }}>
                                            Draw: {w.draws?.draw_month || 'Unknown'}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-gold-light)' }}>
                                            £{(w.prize_amount / 100).toFixed(2)}
                                        </div>
                                        <span className={`badge ${BADGE_MAP[w.verification_status] || 'badge-muted'}`} style={{ fontSize: '0.65rem' }}>
                                            {w.verification_status.replace(/_/g, ' ')}
                                        </span>
                                    </div>
                                </div>

                                {/* Matched numbers */}
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                                    {w.matched_numbers.map(n => (
                                        <div key={n} className="draw-number matched" style={{ width: 40, height: 40, fontSize: '0.875rem' }}>{n}</div>
                                    ))}
                                </div>

                                {/* Proof upload */}
                                {(w.verification_status === 'pending' || w.verification_status === 'proof_required') && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--color-border)' }}>
                                        <span style={{ fontSize: '0.825rem', color: 'var(--color-warning)' }}>
                                            ⚠️ Upload proof of your scores (screenshot from golf platform)
                                        </span>
                                        <label className="btn btn-primary btn-sm" style={{ cursor: 'pointer' }}>
                                            {uploadingId === w.id ? <><span className="spinner" /> Uploading...</> : '📎 Upload Proof'}
                                            <input type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={e => handleProofUpload(e, w.id)} />
                                        </label>
                                    </div>
                                )}

                                {w.verification_status === 'approved' && w.payout_status === 'pending' && (
                                    <div style={{ fontSize: '0.825rem', color: 'var(--color-success)', paddingTop: '0.75rem', borderTop: '1px solid var(--color-border)' }}>
                                        ✅ Verified! Payout is being processed.
                                    </div>
                                )}
                                {w.payout_status === 'paid' && (
                                    <div style={{ fontSize: '0.825rem', color: 'var(--color-success)', paddingTop: '0.75rem', borderTop: '1px solid var(--color-border)' }}>
                                        💸 Prize paid! Check your account.
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    )
}
