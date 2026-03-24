'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Draw {
    id: string
    draw_month: string
    status: string
    winning_numbers: number[]
    prize_pool_total: number
    jackpot_amount: number
    published_at: string | null
}

interface DrawEntry {
    draw_id: string
    scores_snapshot: number[]
}

export default function DrawsPage() {
    const supabase = createClient()
    const [draws, setDraws] = useState<Draw[]>([])
    const [userEntries, setUserEntries] = useState<Record<string, DrawEntry>>({})
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetch = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            const [{ data: drawData }, { data: entryData }] = await Promise.all([
                supabase.from('draws').select('*').in('status', ['published', 'completed']).order('draw_month', { ascending: false }).limit(12),
                user ? supabase.from('draw_entries').select('*').eq('user_id', user.id) : Promise.resolve({ data: [] }),
            ])
            setDraws(drawData || [])
            const entryMap: Record<string, DrawEntry> = {}
            entryData?.forEach((e: DrawEntry) => { entryMap[e.draw_id] = e })
            setUserEntries(entryMap)
            setLoading(false)
        }
        fetch()
    }, [])

    const checkMatches = (userScores: number[], winNums: number[]) =>
        userScores.filter(s => winNums.includes(s))

    // Upcoming draw
    const now = new Date()
    const nextDrawDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    const daysLeft = Math.ceil((nextDrawDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    return (
        <>
            <div className="page-header">
                <h1 className="page-title">🎰 Draws</h1>
                <p className="page-subtitle">View draw results and see how your scores matched up each month.</p>
            </div>

            {/* Next Draw Countdown */}
            <div className="card mb-4" style={{ background: 'linear-gradient(135deg, rgba(108,99,255,0.1), rgba(0,212,170,0.06))', borderColor: 'rgba(108,99,255,0.2)', textAlign: 'center', padding: '2rem' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>Next Draw</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '0.25rem' }}>
                    {nextDrawDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--color-primary-light)' }}>{daysLeft} days away</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
                    Make sure you have 5 scores entered to be eligible!
                </div>
            </div>

            {/* Past Draws */}
            <div className="card">
                <h3 style={{ fontSize: '1rem', color: 'var(--color-text)', marginBottom: '1.25rem' }}>📋 Past Draw Results</h3>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" /></div>
                ) : draws.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎰</div>
                        <p>No draws published yet. Check back after the first monthly draw!</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {draws.map((draw) => {
                            const entry = userEntries[draw.id]
                            const matches = entry ? checkMatches(entry.scores_snapshot, draw.winning_numbers) : []
                            return (
                                <div key={draw.id} style={{ padding: '1.25rem', background: 'var(--color-bg)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        <div>
                                            <div style={{ fontWeight: 700, color: 'var(--color-text)', fontSize: '1.05rem' }}>
                                                Draw: {draw.draw_month}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)' }}>
                                                {draw.published_at ? `Published ${new Date(draw.published_at).toLocaleDateString('en-GB')}` : ''}
                                                {' · '}Pool: £{(draw.prize_pool_total / 100).toFixed(0)}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                            {entry ? (
                                                matches.length >= 3
                                                    ? <span className="badge badge-gold">🏆 {matches.length} matched!</span>
                                                    : matches.length > 0
                                                        ? <span className="badge badge-primary">{matches.length} matched</span>
                                                        : <span className="badge badge-muted">No match</span>
                                            ) : <span className="badge badge-muted">Not entered</span>}
                                        </div>
                                    </div>

                                    {/* Winning Numbers */}
                                    <div style={{ marginBottom: '0.75rem' }}>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)', marginBottom: '0.5rem' }}>Winning Numbers:</div>
                                        <div className="draw-numbers">
                                            {draw.winning_numbers.map(n => (
                                                <div key={n} className={`draw-number ${entry?.scores_snapshot.includes(n) ? 'matched' : ''}`}>{n}</div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* User Scores Snapshot */}
                                    {entry && (
                                        <div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)', marginBottom: '0.5rem' }}>Your Scores:</div>
                                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                {entry.scores_snapshot.map((s, i) => (
                                                    <div key={i} className={`score-ball ${matches.includes(s) ? 'score-ball-gold' : 'score-ball-primary'}`} style={{ width: 40, height: 40, fontSize: '0.875rem' }}>
                                                        {s}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </>
    )
}
