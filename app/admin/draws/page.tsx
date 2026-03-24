'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { generateDrawNumbers, calculatePrizePool, processDraw, type DrawMode } from '@/lib/draw-engine'
import { notifyWinner } from '@/app/actions'

interface Draw {
    id: string
    draw_month: string
    status: string
    draw_mode: string
    winning_numbers: number[]
    prize_pool_total: number
    jackpot_amount: number
    four_match_amount: number
    three_match_amount: number
    rollover_amount: number
    notes: string | null
    published_at: string | null
}

export default function AdminDrawsPage() {
    const supabase = createClient()
    const [draws, setDraws] = useState<Draw[]>([])
    const [loading, setLoading] = useState(true)
    const [simulating, setSimulating] = useState(false)
    const [publishing, setPublishing] = useState<string | null>(null)
    const [mode, setMode] = useState<DrawMode>('random')
    const [simulationResult, setSimulationResult] = useState<{ numbers: number[], pool: ReturnType<typeof calculatePrizePool>, matchCount: { 5: number, 4: number, 3: number } } | null>(null)
    const [message, setMessage] = useState('')

    const thisMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`

    const fetchDraws = async () => {
        const { data } = await supabase.from('draws').select('*').order('draw_month', { ascending: false }).limit(12)
        setDraws(data || [])
        setLoading(false)
    }

    useEffect(() => { fetchDraws() }, [])

    const runSimulation = async () => {
        setSimulating(true)
        setMessage('')
        try {
            const { data: { user } } = await supabase.auth.getUser()
            // Get all user scores
            const { data: scores } = await supabase.from('golf_scores').select('user_id, score')
            const { data: subs } = await supabase.from('subscriptions').select('user_id, plan').eq('status', 'active')

            const allScores = scores?.map(s => s.score) || []
            const drawResult = generateDrawNumbers(mode, allScores)

            // Build user score map
            const userScoreMap: Record<string, number[]> = {}
            for (const sub of subs || []) {
                const userScores = scores?.filter(s => s.user_id === sub.user_id).map(s => s.score) || []
                if (userScores.length >= 3) userScoreMap[sub.user_id] = userScores
            }

            // Calculate pool (£9.99 * active subs)
            const activeCount = subs?.length || 0
            const monthlyRevenue = activeCount * 999
            const rolloverRes = await supabase.from('prize_pool_rollover').select('amount').single()
            const rollover = rolloverRes.data?.amount || 0
            const pool = calculatePrizePool(activeCount, monthlyRevenue, rollover)
            const winners = processDraw(drawResult.numbers, userScoreMap, pool)

            const matchCount = { 5: winners.filter(w => w.matchCount === 5).length, 4: winners.filter(w => w.matchCount === 4).length, 3: winners.filter(w => w.matchCount === 3).length }

            setSimulationResult({ numbers: drawResult.numbers, pool, matchCount })

            // Save as simulated draw
            const { data: existingDraw } = await supabase.from('draws').select('id').eq('draw_month', thisMonth).maybeSingle()
            if (existingDraw) {
                await supabase.from('draws').update({
                    status: 'simulated', draw_mode: mode,
                    winning_numbers: drawResult.numbers,
                    prize_pool_total: pool.total, jackpot_amount: pool.jackpot,
                    four_match_amount: pool.fourMatch, three_match_amount: pool.threeMatch,
                    rollover_amount: pool.rolloverAmount, simulated_at: new Date().toISOString(),
                }).eq('id', existingDraw.id)
            } else {
                await supabase.from('draws').insert({
                    draw_month: thisMonth, status: 'simulated', draw_mode: mode,
                    winning_numbers: drawResult.numbers, created_by: user!.id,
                    prize_pool_total: pool.total, jackpot_amount: pool.jackpot,
                    four_match_amount: pool.fourMatch, three_match_amount: pool.threeMatch,
                    rollover_amount: pool.rolloverAmount,
                })
            }
            await fetchDraws()
            setMessage('Simulation complete! Review results before publishing.')
        } catch (err) {
            console.error(err)
            setMessage('Simulation failed. Check console.')
        } finally {
            setSimulating(false)
        }
    }

    const publishDraw = async (drawId: string) => {
        if (!confirm('Publish this draw? Winners will be notified. This cannot be undone.')) return
        setPublishing(drawId)
        try {
            const draw = draws.find(d => d.id === drawId)
            if (!draw) return
            // Get entries for this draw month
            const { data: subs } = await supabase.from('subscriptions').select('user_id').eq('status', 'active')
            const { data: scores } = await supabase.from('golf_scores').select('user_id, score')
            const { data: { user } } = await supabase.auth.getUser()

            // Build user score map
            const userScoreMap: Record<string, number[]> = {}
            for (const sub of subs || []) {
                const userScores = scores?.filter(s => s.user_id === sub.user_id).map(s => s.score) || []
                if (userScores.length >= 5) userScoreMap[sub.user_id] = userScores
            }

            // Create draw entries
            for (const [userId, userScores] of Object.entries(userScoreMap)) {
                await supabase.from('draw_entries').upsert({
                    draw_id: drawId, user_id: userId, scores_snapshot: userScores
                }, { onConflict: 'draw_id,user_id' })
            }

            // Process winners
            const pool = {
                total: draw.prize_pool_total,
                jackpot: draw.jackpot_amount,
                fourMatch: draw.four_match_amount,
                threeMatch: draw.three_match_amount,
                rolloverAmount: draw.rollover_amount,
            }
            const results = processDraw(draw.winning_numbers, userScoreMap, pool)

            // Insert winners
            for (const result of results) {
                if (result.matchCount >= 3) {
                    await supabase.from('winners').insert({
                        draw_id: drawId, user_id: result.userId,
                        match_type: result.matchCount,
                        matched_numbers: result.matchedNumbers,
                        prize_amount: result.prizeAmount,
                        verification_status: 'pending',
                        payout_status: 'pending',
                    })

                    // Extract email and send notification
                    const { data: prof } = await supabase.from('profiles').select('email').eq('id', result.userId).single()
                    if (prof?.email) {
                        try {
                            await notifyWinner(result.userId, prof.email, result.matchCount, result.prizeAmount)
                        } catch (emailErr) {
                            console.error('Failed to dispatch winner email:', emailErr)
                        }
                    }
                }
            }

            // Update jackpot rollover
            const hasJackpot = results.some(r => r.matchCount === 5)
            if (!hasJackpot) {
                const { data: rollover } = await supabase.from('prize_pool_rollover').select('*').single()
                await supabase.from('prize_pool_rollover').update({ amount: (rollover?.amount || 0) + draw.jackpot_amount, last_updated: new Date().toISOString() }).eq('id', rollover!.id)
            } else {
                const { data: rollover } = await supabase.from('prize_pool_rollover').select('*').single()
                await supabase.from('prize_pool_rollover').update({ amount: 0, last_updated: new Date().toISOString() }).eq('id', rollover!.id)
            }

            // Mark draw as published
            await supabase.from('draws').update({ status: 'published', published_at: new Date().toISOString() }).eq('id', drawId)

            setMessage(`Draw published! ${results.filter(r => r.matchCount >= 3).length} winner(s) created.`)
            fetchDraws()
        } catch (err) {
            console.error(err)
            setMessage('Publish failed. Check console.')
        } finally {
            setPublishing(null)
        }
    }

    return (
        <>
            <div className="page-header">
                <h1 className="page-title">🎰 Draw Management</h1>
                <p className="page-subtitle">Run simulations, configure draw mode, and publish monthly draw results.</p>
            </div>

            {message && <div className={`alert ${message.includes('failed') ? 'alert-error' : 'alert-success'} mb-4`}>{message}</div>}

            {/* Simulate */}
            <div className="card mb-4">
                <h3 style={{ fontSize: '1rem', color: 'var(--color-text)', marginBottom: '1.25rem' }}>⚡ Run This Month's Draw — {thisMonth}</h3>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                    <div className="form-group" style={{ flex: 1, minWidth: 200 }}>
                        <label className="form-label">Draw Mode</label>
                        <select className="form-input" value={mode} onChange={e => setMode(e.target.value as DrawMode)}>
                            <option value="random">Random — Pure lottery style</option>
                            <option value="algorithmic">Algorithmic — Weighted by popular scores</option>
                        </select>
                    </div>
                    <div style={{ paddingTop: '1.25rem' }}>
                        <button id="run-simulation" className="btn btn-primary" onClick={runSimulation} disabled={simulating}>
                            {simulating ? <><span className="spinner" /> Simulating...</> : '🔄 Run Simulation'}
                        </button>
                    </div>
                </div>

                {simulationResult && (
                    <div style={{ padding: '1.25rem', background: 'var(--color-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                        <div style={{ marginBottom: '1rem' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)', marginBottom: '0.5rem' }}>Simulated Winning Numbers:</div>
                            <div className="draw-numbers">
                                {simulationResult.numbers.map(n => <div key={n} className="draw-number">{n}</div>)}
                            </div>
                        </div>
                        <div className="grid-3" style={{ gap: '0.75rem' }}>
                            <div className="prize-tier">
                                <div className="prize-tier-label">Jackpot (5-Match)</div>
                                <div className="prize-tier-amount text-gold">£{(simulationResult.pool.jackpot / 100).toFixed(2)}</div>
                                <div className="prize-tier-match">{simulationResult.matchCount[5]} winner{simulationResult.matchCount[5] !== 1 ? 's' : ''}</div>
                            </div>
                            <div className="prize-tier">
                                <div className="prize-tier-label">4-Match</div>
                                <div className="prize-tier-amount text-gradient">£{(simulationResult.pool.fourMatch / 100).toFixed(2)}</div>
                                <div className="prize-tier-match">{simulationResult.matchCount[4]} winner{simulationResult.matchCount[4] !== 1 ? 's' : ''}</div>
                            </div>
                            <div className="prize-tier">
                                <div className="prize-tier-label">3-Match</div>
                                <div className="prize-tier-amount" style={{ color: 'var(--color-accent)' }}>£{(simulationResult.pool.threeMatch / 100).toFixed(2)}</div>
                                <div className="prize-tier-match">{simulationResult.matchCount[3]} winner{simulationResult.matchCount[3] !== 1 ? 's' : ''}</div>
                            </div>
                        </div>
                        <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--color-text-dim)' }}>
                            {simulationResult.matchCount[5] === 0 ? '⚠️ No jackpot winner — pool will roll over to next month.' : '🏆 Jackpot won! Rollover resets.'}
                        </div>
                    </div>
                )}
            </div>

            {/* Past Draws */}
            <div className="card">
                <h3 style={{ fontSize: '1rem', color: 'var(--color-text)', marginBottom: '1.25rem' }}>📋 All Draws</h3>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" /></div>
                ) : draws.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>No draws yet. Run a simulation to get started.</div>
                ) : (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Month</th>
                                    <th>Status</th>
                                    <th>Mode</th>
                                    <th>Winning Numbers</th>
                                    <th>Prize Pool</th>
                                    <th>Jackpot</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {draws.map(draw => (
                                    <tr key={draw.id}>
                                        <td><strong>{draw.draw_month}</strong></td>
                                        <td>
                                            <span className={`badge ${draw.status === 'published' || draw.status === 'completed' ? 'badge-success' : draw.status === 'simulated' ? 'badge-primary' : 'badge-muted'}`}>
                                                {draw.status}
                                            </span>
                                        </td>
                                        <td><span className="badge badge-muted" style={{ textTransform: 'capitalize' }}>{draw.draw_mode}</span></td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                                                {draw.winning_numbers?.map(n => (
                                                    <span key={n} style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(108,99,255,0.2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, border: '1px solid rgba(108,99,255,0.3)' }}>{n}</span>
                                                ))}
                                            </div>
                                        </td>
                                        <td>£{((draw.prize_pool_total || 0) / 100).toFixed(2)}</td>
                                        <td className="text-gold">£{((draw.jackpot_amount || 0) / 100).toFixed(2)}</td>
                                        <td>
                                            {draw.status === 'simulated' && (
                                                <button
                                                    id={`publish-${draw.id}`}
                                                    className="btn btn-accent btn-sm"
                                                    onClick={() => publishDraw(draw.id)}
                                                    disabled={publishing === draw.id}
                                                >
                                                    {publishing === draw.id ? 'Publishing...' : '🚀 Publish'}
                                                </button>
                                            )}
                                            {(draw.status === 'published' || draw.status === 'completed') && (
                                                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-dim)' }}>
                                                    {draw.published_at ? new Date(draw.published_at).toLocaleDateString('en-GB') : 'Published'}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    )
}
