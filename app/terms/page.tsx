import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function TermsPage() {
    return (
        <>
            <Navbar />
            <main style={{ paddingTop: '6rem', minHeight: '80vh' }}>
                <div className="container" style={{ maxWidth: 800 }}>
                    <h1 style={{ marginBottom: '2rem' }}>Terms of Service</h1>
                    <div className="card">
                        <p style={{ marginBottom: '1rem' }}>Last updated: March 2026</p>
                        <h3>1. Acceptance of Terms</h3>
                        <p style={{ marginBottom: '1.5rem', color: 'var(--color-text-muted)' }}>By accessing Par4Charity, you agree to these Terms of Service. You must be 18+ to subscribe and participate in the monthly draws in accordance with UK gambling and lottery regulations.</p>
                        <h3>2. Subscription and Payouts</h3>
                        <p style={{ marginBottom: '1.5rem', color: 'var(--color-text-muted)' }}>We guarantee a minimum of 10% of subscription revenue will be distributed to your selected charity. Prize pools are algorithmically funded by 60% of total revenue. Payouts require verification of official golf club scorecards.</p>
                        <h3>3. Golf Score Verification</h3>
                        <p style={{ color: 'var(--color-text-muted)' }}>Winners must produce a valid scorecard from an officially recognized 18-hole golf course. Falsifying scores will result in an immediate permanent ban and forfeiture of all subscriptions and prize entitlements.</p>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    )
}
