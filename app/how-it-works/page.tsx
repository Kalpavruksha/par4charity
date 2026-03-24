import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'

export default function HowItWorksPage() {
    return (
        <>
            <Navbar />
            <main style={{ paddingTop: '5rem' }}>
                {/* Header */}
                <section style={{
                    padding: '4rem 0',
                    background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(108,99,255,0.12) 0%, transparent 60%), var(--color-bg)',
                    borderBottom: '1px solid var(--color-border)',
                    textAlign: 'center',
                }}>
                    <div className="container">
                        <div className="hero-eyebrow" style={{ display: 'inline-flex', margin: '0 auto 1.5rem' }}>
                            <span>📋</span> Platform Guide
                        </div>
                        <h1 className="animate-fade-up">How <span className="text-gradient">Par4Charity</span> Works</h1>
                        <p className="animate-fade-up animate-delay-1" style={{ maxWidth: 560, margin: '1rem auto 0' }}>
                            Everything you need to know about subscriptions, score entry, monthly draws, and how your charity gets funded.
                        </p>
                    </div>
                </section>

                {/* Steps Detail */}
                <section className="section">
                    <div className="container">
                        {[
                            {
                                num: '01',
                                icon: '🔑',
                                title: 'Create Your Account',
                                body: 'Sign up in minutes. Add your name, email, and golf handicap. Your profile is the home for everything — scores, draws, winnings, and your charity contributions.',
                            },
                            {
                                num: '02',
                                icon: '💳',
                                title: 'Choose a Subscription Plan',
                                body: 'Pick Monthly (£9.99/mo) or Yearly (£99.99/yr — save 17%). Payment is processed securely via Stripe. Your subscription is what enters you into every monthly draw automatically.',
                            },
                            {
                                num: '03',
                                icon: '🌱',
                                title: 'Select Your Charity',
                                body: 'Browse our verified charity partners and select the cause you want to support. At least 10% of every subscription payment goes directly to your chosen charity. You can increase your giving percentage at any time.',
                            },
                            {
                                num: '04',
                                icon: '⛳',
                                title: 'Enter Your Stableford Scores',
                                body: 'Log your last 5 golf scores in Stableford format (1–45 points). Your 5 most recent scores are kept automatically — when you add a 6th, your oldest score is replaced. Each score entry includes the date played.',
                            },
                            {
                                num: '05',
                                icon: '🎰',
                                title: 'Monthly Draw Day',
                                body: 'On the last day of each month, 5 winning numbers are drawn. We run either a pure random draw or an algorithmic draw weighted by popular scores. Every active subscriber\'s 5 scores are compared against the winning numbers.',
                            },
                            {
                                num: '06',
                                icon: '🏆',
                                title: 'Check Your Results',
                                body: 'Match 3 numbers and you win 25% of the prize pool (split if multiple winners). Match 4 and you win 35%. Match all 5 and you claim the 40% jackpot — which rolls over monthly until claimed!',
                            },
                            {
                                num: '07',
                                icon: '✅',
                                title: 'Winner Verification',
                                body: 'Winners must upload a screenshot of their scores from their golf platform as proof. Our admin team reviews and approves all winning claims within 48 hours. Once approved, prizes are paid out directly.',
                            },
                        ].map((step, i) => (
                            <div key={step.num} style={{
                                display: 'grid',
                                gridTemplateColumns: '80px 1fr',
                                gap: '2rem',
                                paddingBottom: '3rem',
                                marginBottom: '3rem',
                                borderBottom: i < 6 ? '1px solid var(--color-border)' : 'none',
                            }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{step.icon}</div>
                                    <div style={{ fontWeight: 900, fontSize: '1.25rem', background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{step.num}</div>
                                </div>
                                <div>
                                    <h3 style={{ color: 'var(--color-text)', marginBottom: '0.75rem' }}>{step.title}</h3>
                                    <p style={{ lineHeight: 1.8 }}>{step.body}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Draw Rules Summary */}
                <section className="section" style={{ background: 'var(--color-bg-2)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
                    <div className="container">
                        <div className="text-center mb-4">
                            <h2>Draw <span className="text-gradient">Rules Summary</span></h2>
                        </div>
                        <div className="grid-3" style={{ gap: '1rem' }}>
                            {[
                                { title: 'Score Range', body: 'All scores must be between 1 and 45 points in Stableford format.' },
                                { title: 'Rolling 5 Scores', body: 'Only your 5 most recent scores count. Adding a new score removes the oldest.' },
                                { title: 'Monthly Cadence', body: 'Draws happen once per month. All active subscribers with 5 scores entered are eligible.' },
                                { title: 'Jackpot Rollover', body: "If no player matches all 5 winning numbers, the 40% jackpot carries to next month." },
                                { title: 'Prize Split', body: 'Multiple winners in the same tier share the pool equally.' },
                                { title: 'Verification Required', body: 'All winners must upload proof of scores before prizes are paid.' },
                            ].map(rule => (
                                <div key={rule.title} className="card">
                                    <h4 style={{ color: 'var(--color-accent)', marginBottom: '0.5rem' }}>{rule.title}</h4>
                                    <p className="text-sm">{rule.body}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section style={{ padding: '4rem 0', textAlign: 'center' }}>
                    <div className="container-sm">
                        <h2 style={{ marginBottom: '1rem' }}>Ready to <span className="text-gradient">play?</span></h2>
                        <p style={{ marginBottom: '2rem' }}>Join now and your scores could be winning prizes by next month!</p>
                        <Link href="/auth/signup" className="btn btn-accent btn-lg">Join Par4Charity</Link>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    )
}
