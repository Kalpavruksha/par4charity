import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function DrawRulesPage() {
    return (
        <>
            <Navbar />
            <main style={{ paddingTop: '6rem', minHeight: '80vh' }}>
                <div className="container" style={{ maxWidth: 800 }}>
                    <h1 style={{ marginBottom: '2rem' }}>Official Draw Rules</h1>
                    <div className="card">
                        <h3>1. Eligibility</h3>
                        <p style={{ marginBottom: '1.5rem', color: 'var(--color-text-muted)' }}>You must hold an active £9.99/mo or £99.99/yr subscription. You must have entered exactly 5 valid Stableford scores (between 1 and 45 points) before the final day of the month.</p>
                        <h3>2. The Monthly Draw</h3>
                        <p style={{ marginBottom: '1.5rem', color: 'var(--color-text-muted)' }}>On the last day of each month, the algorithmic simulator randomly generates 5 winning numbers (between 1 and 45). Your rolling 5 scores are evaluated against these numbers.</p>
                        <h3>3. Prize Distribution</h3>
                        <p style={{ color: 'var(--color-text-muted)' }}>Matches are evaluated strictly. 5 Matches win 40% of the active prize pool (Jackpot). 4 Matches split 35% of the prize pool. 3 Matches split 25% of the prize pool. Unclaimed Jackpots roll over into the subsequent month.</p>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    )
}
