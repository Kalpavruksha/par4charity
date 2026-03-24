'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Score {
    id: string
    score: number
    played_at: string
    course_name: string | null
    notes: string | null
}

export default function ScoresPage() {
    const supabase = createClient()
    const [scores, setScores] = useState<Score[]>([])
    const [form, setForm] = useState({ score: '', played_at: '', course_name: '', notes: '' })
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [editId, setEditId] = useState<string | null>(null)

    const fetchScores = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const { data } = await supabase
            .from('golf_scores')
            .select('*')
            .eq('user_id', user.id)
            .order('played_at', { ascending: false })
        setScores(data || [])
        setFetching(false)
    }

    useEffect(() => { fetchScores() }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(''); setSuccess('')
        const scoreVal = parseInt(form.score)
        if (isNaN(scoreVal) || scoreVal < 1 || scoreVal > 45) {
            setError('Score must be between 1 and 45 (Stableford format).')
            return
        }
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { setLoading(false); return }

        try {
            if (editId) {
                const { error: err } = await supabase.from('golf_scores').update({
                    score: scoreVal,
                    played_at: form.played_at,
                    course_name: form.course_name || null,
                    notes: form.notes || null,
                }).eq('id', editId).eq('user_id', user.id)
                if (err) throw err
                setSuccess('Score updated successfully!')
                setEditId(null)
            } else {
                const { error: err } = await supabase.from('golf_scores').insert({
                    user_id: user.id,
                    score: scoreVal,
                    played_at: form.played_at,
                    course_name: form.course_name || null,
                    notes: form.notes || null,
                })
                if (err) throw err
                setSuccess('Score added! Your 5-score history has been updated.')
            }
            setForm({ score: '', played_at: '', course_name: '', notes: '' })
            fetchScores()
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to save score.')
        } finally {
            setLoading(false)
        }
    }

    const handleEdit = (score: Score) => {
        setEditId(score.id)
        setForm({
            score: String(score.score),
            played_at: score.played_at,
            course_name: score.course_name || '',
            notes: score.notes || '',
        })
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this score?')) return
        const { data: { user } } = await supabase.auth.getUser()
        await supabase.from('golf_scores').delete().eq('id', id).eq('user_id', user!.id)
        fetchScores()
    }

    return (
        <>
            <div className="page-header">
                <h1 className="page-title">⛳ My Scores</h1>
                <p className="page-subtitle">Enter your last 5 Stableford golf scores (1–45 points). Your scores are used to enter monthly draws.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1.5rem', alignItems: 'start' }}>
                {/* Form */}
                <div className="card">
                    <h3 style={{ fontSize: '1rem', color: 'var(--color-text)', marginBottom: '1.25rem' }}>
                        {editId ? '✏️ Edit Score' : '➕ Add Score'}
                    </h3>
                    {error && <div className="alert alert-error mb-3">{error}</div>}
                    {success && <div className="alert alert-success mb-3">{success}</div>}
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div className="form-group">
                            <label className="form-label">Stableford Score <span style={{ color: 'var(--color-accent)' }}>*</span></label>
                            <input
                                id="score-input"
                                className="form-input"
                                type="number"
                                min={1} max={45}
                                placeholder="e.g. 36"
                                value={form.score}
                                onChange={e => setForm({ ...form, score: e.target.value })}
                                required
                            />
                            <div className="form-hint">Must be between 1 and 45 points</div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Date Played <span style={{ color: 'var(--color-accent)' }}>*</span></label>
                            <input
                                id="date-input"
                                className="form-input"
                                type="date"
                                max={new Date().toISOString().split('T')[0]}
                                value={form.played_at}
                                onChange={e => setForm({ ...form, played_at: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Course Name <span style={{ color: 'var(--color-text-dim)' }}>(optional)</span></label>
                            <input
                                id="course-input"
                                className="form-input"
                                type="text"
                                placeholder="e.g. St Andrews Links"
                                value={form.course_name}
                                onChange={e => setForm({ ...form, course_name: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Notes <span style={{ color: 'var(--color-text-dim)' }}>(optional)</span></label>
                            <textarea
                                className="form-input"
                                rows={2}
                                placeholder="Any notes about the round..."
                                value={form.notes}
                                onChange={e => setForm({ ...form, notes: e.target.value })}
                                style={{ resize: 'vertical' }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button id="score-submit" className="btn btn-primary w-full" type="submit" disabled={loading}>
                                {loading ? <><span className="spinner" /> Saving...</> : editId ? 'Update Score' : 'Add Score'}
                            </button>
                            {editId && (
                                <button type="button" className="btn btn-outline" onClick={() => { setEditId(null); setForm({ score: '', played_at: '', course_name: '', notes: '' }) }}>
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>

                    {/* Info box */}
                    <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(108,99,255,0.06)', border: '1px solid rgba(108,99,255,0.15)', borderRadius: 'var(--radius-md)' }}>
                        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                            <strong style={{ color: 'var(--color-primary-light)' }}>Rolling 5-score system:</strong> Only your 5 most recent scores are retained. When you add a 6th score, the oldest is automatically removed.
                        </p>
                    </div>
                </div>

                {/* Score History */}
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                        <h3 style={{ fontSize: '1rem', color: 'var(--color-text)' }}>📋 Score History</h3>
                        <span className="badge badge-muted">{scores.length}/5 scores</span>
                    </div>

                    {/* Score balls visual */}
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem', padding: '1rem', background: 'var(--color-bg)', borderRadius: 'var(--radius-md)', justifyContent: 'center' }}>
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className={`score-ball ${scores[i] ? (i === 0 ? 'score-ball-accent' : 'score-ball-primary') : 'score-ball-empty'}`}>
                                {scores[i]?.score || '?'}
                            </div>
                        ))}
                    </div>

                    {fetching ? (
                        <div style={{ textAlign: 'center', padding: '2rem' }}>
                            <div className="spinner" />
                        </div>
                    ) : scores.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--color-text-muted)' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                            <p>No scores entered yet. Add your first score above.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {scores.map((score, i) => (
                                <div key={score.id} style={{
                                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                                    padding: '0.875rem', background: 'var(--color-bg)', borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--color-border)',
                                }}>
                                    <div className={`score-ball ${i === 0 ? 'score-ball-accent' : 'score-ball-primary'}`} style={{ width: 40, height: 40 }}>
                                        {score.score}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 700, color: 'var(--color-text)', fontSize: '0.95rem' }}>
                                            {score.score} pts {i === 0 && <span className="badge badge-accent" style={{ fontSize: '0.6rem', marginLeft: '0.5rem' }}>Latest</span>}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)' }}>
                                            {new Date(score.played_at).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                                            {score.course_name && ` · ${score.course_name}`}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(score)} title="Edit">✏️</button>
                                        <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(score.id)} title="Delete" style={{ color: 'var(--color-error)' }}>🗑️</button>
                                    </div>
                                </div>
                            ))}
                            {scores.length < 5 && (
                                <div className="alert alert-warning" style={{ fontSize: '0.825rem' }}>
                                    ⚠️ You need {5 - scores.length} more score{5 - scores.length !== 1 ? 's' : ''} to be eligible for the next draw.
                                </div>
                            )}
                            {scores.length === 5 && (
                                <div className="alert alert-success" style={{ fontSize: '0.825rem' }}>
                                    ✅ All 5 scores entered. You are eligible for this month&apos;s draw!
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}
