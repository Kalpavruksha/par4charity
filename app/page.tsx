import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        {/* ====== HERO ====== */}
        <section className="hero">
          <div className="hero-bg" />
          <div className="hero-grid" />
          <div className="container hero-content">
            <div className="hero-eyebrow animate-fade-up">
              <span>🌱</span> Golf with Purpose
            </div>
            <h1 className="hero-title animate-fade-up animate-delay-1 display-font">
              Play Golf.<br />
              <span className="text-gradient">Win Prizes.</span><br />
              Change Lives.
            </h1>
            <p className="hero-subtitle animate-fade-up animate-delay-2">
              Add your Stableford scores each month. Enter monthly prize draws. Support a charity you love — all in one beautiful platform.
            </p>
            <div className="hero-actions animate-fade-up animate-delay-3">
              <Link href="/auth/signup" className="btn btn-accent btn-lg animate-pulse-glow">
                Start for Free
              </Link>
              <Link href="/how-it-works" className="btn btn-outline btn-lg">
                How It Works
              </Link>
            </div>

            {/* Stats */}
            <div className="hero-stats animate-fade-up animate-delay-4">
              <div className="hero-stat">
                <div className="hero-stat-value text-gradient">£48,000+</div>
                <div className="hero-stat-label">Prize Pool This Month</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-value text-gradient">£12,300+</div>
                <div className="hero-stat-label">Donated to Charity</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-value text-gradient">4,200+</div>
                <div className="hero-stat-label">Active Subscribers</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-value text-gradient">6</div>
                <div className="hero-stat-label">Charity Partners</div>
              </div>
            </div>
          </div>
        </section>

        {/* ====== HOW IT WORKS ====== */}
        <section className="section" style={{ borderTop: '1px solid var(--color-border)' }}>
          <div className="container">
            <div className="text-center mb-4">
              <div className="hero-eyebrow" style={{ display: 'inline-flex', marginBottom: '1rem' }}>How It Works</div>
              <h2>Simple as <span className="text-gradient">1, 2, 3</span></h2>
              <p style={{ maxWidth: 500, margin: '1rem auto 0' }}>
                No complexity, no hidden rules. Just your golf scores, a monthly draw, and a cause you care about.
              </p>
            </div>
            <div className="steps mt-4">
              <div className="step animate-fade-up">
                <div className="step-number">01</div>
                <h3>Subscribe</h3>
                <p>Choose a monthly or yearly plan. Pick a charity to receive your contribution. You're in — and every renewal supports your cause automatically.</p>
              </div>
              <div className="step animate-fade-up animate-delay-1">
                <div className="step-number">02</div>
                <h3>Enter Your Scores</h3>
                <p>Register your last 5 Stableford golf scores (1–45). Your rolling 5-score history is your draw ticket. No separate entry needed.</p>
              </div>
              <div className="step animate-fade-up animate-delay-2">
                <div className="step-number">03</div>
                <h3>Win Monthly</h3>
                <p>Each month, 5 winning numbers are drawn. Match 3, 4, or all 5 of your scores to win your share of the prize pool — jackpots roll over!</p>
              </div>
            </div>
          </div>
        </section>

        {/* ====== PRIZE BREAKDOWN ====== */}
        <section className="section" style={{ background: 'var(--color-bg-2)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
          <div className="container">
            <div className="text-center mb-4">
              <div className="hero-eyebrow" style={{ display: 'inline-flex', marginBottom: '1rem' }}>💰 Prize Structure</div>
              <h2>How the <span className="text-gradient">Prize Pool</span> Works</h2>
              <p style={{ maxWidth: 560, margin: '1rem auto 0' }}>A share of every subscription funds the monthly prize pool. The more subscribers, the bigger the prizes.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', maxWidth: 800, margin: '0 auto' }}>
              <div className="card text-center" style={{ borderColor: 'rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.05)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🏆</div>
                <div className="stat-label">5-Number Match</div>
                <div className="stat-value text-gold">40%</div>
                <p className="text-sm mt-1">of prize pool · <strong style={{ color: 'var(--color-gold-light)' }}>Jackpot rolls over!</strong></p>
              </div>
              <div className="card text-center" style={{ borderColor: 'rgba(108,99,255,0.3)', background: 'rgba(108,99,255,0.05)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🥈</div>
                <div className="stat-label">4-Number Match</div>
                <div className="stat-value text-gradient">35%</div>
                <p className="text-sm mt-1">of prize pool · Split among winners</p>
              </div>
              <div className="card text-center" style={{ borderColor: 'rgba(0,212,170,0.3)', background: 'rgba(0,212,170,0.05)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🥉</div>
                <div className="stat-label">3-Number Match</div>
                <div className="stat-value" style={{ color: 'var(--color-accent)' }}>25%</div>
                <p className="text-sm mt-1">of prize pool · Split among winners</p>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '2.5rem', padding: '1.5rem', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 'var(--radius-lg)', maxWidth: 600, margin: '2.5rem auto 0' }}>
              <p style={{ color: 'var(--color-gold-light)', fontWeight: 600 }}>
                🔁 Jackpot Rollover: If no player matches all 5 numbers, the 40% jackpot carries forward to next month — growing until someone wins!
              </p>
            </div>
          </div>
        </section>

        {/* ====== CHARITY IMPACT ====== */}
        <section className="section">
          <div className="container">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
              <div>
                <div className="hero-eyebrow" style={{ display: 'inline-flex', marginBottom: '1rem' }}>🌱 Charity Impact</div>
                <h2 style={{ marginBottom: '1.25rem' }}>Golf that <span className="text-gradient">gives back</span></h2>
                <p style={{ marginBottom: '1.5rem', lineHeight: 1.8 }}>
                  At least 10% of every subscription goes directly to your chosen charity. You can choose to give more — up to 100% — if you want to maximise your impact.
                </p>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                  {[
                    'You pick the charity at signup',
                    'Minimum 10% of your subscription fee',
                    'Increase your giving % any time',
                    'Independent donations also accepted',
                    'Full contribution transparency',
                  ].map((point) => (
                    <li key={point} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.925rem', color: 'var(--color-text-muted)' }}>
                      <span style={{ color: 'var(--color-accent)', fontSize: '1rem' }}>✓</span> {point}
                    </li>
                  ))}
                </ul>
                <Link href="/charities" className="btn btn-accent">Browse Charities →</Link>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {[
                  { icon: '⛳', name: 'Golf Foundation', raised: '£12,400', color: '#6c63ff' },
                  { icon: '💚', name: 'Macmillan Cancer', raised: '£28,700', color: '#00d4aa' },
                  { icon: '🧠', name: "Alzheimer's Society", raised: '£15,200', color: '#f59e0b' },
                  { icon: '🌿', name: 'WWF', raised: '£9,100', color: '#22c55e' },
                ].map((c) => (
                  <div key={c.name} className="card" style={{ borderColor: `${c.color}25` }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{c.icon}</div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text)', marginBottom: '0.25rem' }}>{c.name}</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: c.color }}>{c.raised}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)' }}>raised via Par4Charity</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ====== SUBSCRIPTION PLANS ====== */}
        <section className="section" style={{ background: 'var(--color-bg-2)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
          <div className="container">
            <div className="text-center mb-4">
              <div className="hero-eyebrow" style={{ display: 'inline-flex', marginBottom: '1rem' }}>💳 Simple Pricing</div>
              <h2>One Platform. <span className="text-gradient">Two Plans.</span></h2>
              <p style={{ maxWidth: 480, margin: '1rem auto 0' }}>Both plans give you full access to all draws, score tracking, and charity contributions.</p>
            </div>
            <div className="plan-cards" style={{ maxWidth: 700, margin: '0 auto' }}>
              <div className="plan-card">
                <div className="plan-name">Monthly</div>
                <div className="plan-price">£9.99<span>/mo</span></div>
                <div className="plan-features">
                  {['Monthly prize draw entry', 'Score tracking dashboard', 'Choose your charity', 'Min. 10% charity contribution', 'Cancel any time'].map(f => (
                    <div key={f} className="plan-feature">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                      {f}
                    </div>
                  ))}
                </div>
                <Link href="/auth/signup?plan=monthly" className="btn btn-outline w-full mt-3" style={{ marginTop: '1.5rem' }}>Get Started</Link>
              </div>
              <div className="plan-card featured" style={{ position: 'relative' }}>
                <div className="plan-badge">Best Value</div>
                <div className="plan-name">Yearly</div>
                <div className="plan-price">£99.99<span>/yr</span></div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-accent)', marginTop: '-0.25rem', marginBottom: '0.5rem', fontWeight: 600 }}>Save £19.89 vs monthly</div>
                <div className="plan-features">
                  {['12 monthly prize draw entries', 'Score tracking dashboard', 'Choose your charity', 'Min. 10% charity contribution', 'Priority winner verification', 'Yearly contribution statement'].map(f => (
                    <div key={f} className="plan-feature">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                      {f}
                    </div>
                  ))}
                </div>
                <Link href="/auth/signup?plan=yearly" className="btn btn-accent w-full" style={{ marginTop: '1.5rem' }}>Get Started</Link>
              </div>
            </div>
          </div>
        </section>

        {/* ====== CTA ====== */}
        <section className="section" style={{ textAlign: 'center', overflow: 'hidden', position: 'relative' }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse 80% 80% at 50% 50%, rgba(108,99,255,0.12) 0%, transparent 70%)',
            zIndex: 0
          }} />
          <div className="container" style={{ position: 'relative', zIndex: 1 }}>
            <div className="hero-eyebrow" style={{ display: 'inline-flex', marginBottom: '1.5rem' }}>
              <span>🚀</span> Ready to Start?
            </div>
            <h2 className="display-font" style={{ marginBottom: '1.25rem', fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}>
              Your golf score is<br /><span className="text-gradient">worth something.</span>
            </h2>
            <p style={{ maxWidth: 520, margin: '0 auto 2.5rem', fontSize: '1.1rem' }}>
              Join thousands of golfers already playing with purpose. Subscribe, score, and support your cause today.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/auth/signup" className="btn btn-accent btn-lg animate-pulse-glow">
                Join Par4Charity Free
              </Link>
              <Link href="/charities" className="btn btn-outline btn-lg">View Charities</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
