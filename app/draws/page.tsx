import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'

export default function DrawsPublicPage() {
    const now = new Date()
    const nextDraw = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    const daysLeft = Math.ceil((nextDraw.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    // Simulated past draws for public display
    const pastDraws = [
        { month: '2026-02', numbers: [8, 17, 24, 33, 41], pool: 42000, jackpot: 16800, matchCounts: { 5: 0, 4: 2, 3: 5 }, rolled: true },
        { month: '2026-01', numbers: [3, 14, 22, 30, 38], pool: 39600, jackpot: 15840, matchCounts: { 5: 1, 4: 0, 3: 8 }, rolled: false },
        { month: '2025-12', numbers: [11, 19, 28, 36, 43], pool: 36000, jackpot: 14400, matchCounts: { 5: 0, 4: 3, 3: 12 }, rolled: true },
    ]

    return (
        <>
            <Navbar />
            <main style={{ paddingTop: '5rem' }}>
                {/* Header */}
                <section style={{
                    padding: '4rem 0',
                    background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(245,158,11,0.1) 0%, transparent 60%), var(--color-bg)',
                    borderBottom: '1px solid var(--color-border)',
                    textAlign: 'center',
                }}>
                    <div className="container">
                        <div className="hero-eyebrow" style={{ display: 'inline-flex', margin: '0 auto 1.5rem' }}>
                            <span>🎰</span> Monthly Draws
                        </div>
                        <h1 className="animate-fade-up">The <span className="text-gold">Prize Draw</span> System</h1>
                        <p className="animate-fade-up animate-delay-1" style={{ maxWidth: 560, margin: '1rem auto 0' }}>
                            Every active subscriber&apos;s 5 Stableford scores are entered for the monthly prize draw. Match the winning numbers and win your share!
                        </p>
                    </div>
                </section>

                {/* Next Draw Countdown */}
                <section style={{ padding: '3rem 0', borderBottom: '1px solid var(--color-border)' }}>
                    <div className="container">
                        <div style={{ background: 'linear-gradient(135deg, rgba(108,99,255,0.08), rgba(0,212,170,0.05))', border: '1px solid rgba(108,99,255,0.2)', borderRadius: 'var(--radius-xl)', padding: '3rem', textAlign: 'center', maxWidth: 720, margin: '0 auto' }}>
                            <div className="hero-eyebrow" style={{ display: 'inline-flex', marginBottom: '1rem' }}>Next Draw</div>
                            <h2 style={{ marginBottom: '0.5rem', fontSize: '2rem' }}>{nextDraw.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</h2>
                            <div style={{ fontSize: '5rem', fontWeight: 900, background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1.1 }}>{daysLeft}</div>
                            <div style={{ color: 'var(--color-text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>days remaining</div>
                            <Link href="/auth/signup" className="btn btn-accent btn-lg">Join to Enter This Draw</Link>
                        </div>
                    </div>
                </section>

                {/* Prize Pool Breakdown */}
                <section className="section">
                    <div className="container">
                        <div className="text-center mb-4">
                            <h2>This Month&apos;s <span className="text-gradient">Prize Pool</span></h2>
                            <p style={{ maxWidth: 500, margin: '1rem auto 0' }}>Estimated based on current active subscribers. The jackpot includes the rollover from last month.</p>
                        </div>
                        <div className="prize-pool-grid" style={{ maxWidth: 780, margin: '0 auto' }}>
                            <div className="prize-tier" style={{ borderColor: 'rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.05)' }}>
                                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏆</div>
                                <div className="prize-tier-label">5-Number Match</div>
                                <div className="prize-tier-amount text-gold">~£48,000</div>
                                <div className="prize-tier-match">40% + Jackpot Rollover</div>
                                <div className="badge badge-gold" style={{ marginTop: '0.5rem', fontSize: '0.6rem' }}>JACKPOT ROLLS OVER</div>
                            </div>
                            <div className="prize-tier" style={{ borderColor: 'rgba(108,99,255,0.3)', background: 'rgba(108,99,255,0.04)' }}>
                                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🥈</div>
                                <div className="prize-tier-label">4-Number Match</div>
                                <div className="prize-tier-amount text-gradient">~£14,700</div>
                                <div className="prize-tier-match">35% of pool · Split among winners</div>
                            </div>
                            <div className="prize-tier" style={{ borderColor: 'rgba(0,212,170,0.3)', background: 'rgba(0,212,170,0.03)' }}>
                                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🥉</div>
                                <div className="prize-tier-label">3-Number Match</div>
                                <div className="prize-tier-amount" style={{ color: 'var(--color-accent)' }}>~£10,500</div>
                                <div className="prize-tier-match">25% of pool · Split among winners</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Past Draws */}
                <section className="section" style={{ background: 'var(--color-bg-2)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
                    <div className="container">
                        <div className="text-center mb-4">
                            <h2>Previous <span className="text-gradient">Draw Results</span></h2>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {pastDraws.map((draw) => (
                                <div key={draw.month} className="card">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                                        <div>
                                            <h3 style={{ fontSize: '1.1rem', color: 'var(--color-text)', marginBottom: '0.25rem' }}>{draw.month} Draw</h3>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-dim)' }}>
                                                Prize Pool: £{(draw.pool / 100).toFixed(0)} · Jackpot: £{(draw.jackpot / 100).toFixed(0)}
                                            </div>
                                        </div>
                                        {draw.rolled && <span className="badge badge-gold">🔁 Jackpot Rolled Over</span>}
                                    </div>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)', marginBottom: '0.5rem' }}>Winning Numbers:</div>
                                        <div className="draw-numbers">
                                            {draw.numbers.map(n => <div key={n} className="draw-number">{n}</div>)}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                                        <span>🏆 5-match: <strong style={{ color: draw.matchCounts[5] > 0 ? 'var(--color-gold-light)' : 'var(--color-text)' }}>{draw.matchCounts[5]} winners</strong></span>
                                        <span>🥈 4-match: <strong style={{ color: 'var(--color-text)' }}>{draw.matchCounts[4]} winners</strong></span>
                                        <span>🥉 3-match: <strong style={{ color: 'var(--color-text)' }}>{draw.matchCounts[3]} winners</strong></span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section style={{ padding: '4rem 0', textAlign: 'center' }}>
                    <div className="container-sm">
                        <h2 style={{ marginBottom: '1rem' }}>Could <span className="text-gradient">you</span> be next?</h2>
                        <p style={{ marginBottom: '2rem' }}>Subscribe and enter your scores before next month&apos;s draw closes!</p>
                        <Link href="/auth/signup" className="btn btn-accent btn-lg">Join & Enter Now</Link>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    )
}
