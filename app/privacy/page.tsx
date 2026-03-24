import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function PrivacyPage() {
    return (
        <>
            <Navbar />
            <main style={{ paddingTop: '6rem', minHeight: '80vh' }}>
                <div className="container" style={{ maxWidth: 800 }}>
                    <h1 style={{ marginBottom: '2rem' }}>Privacy Policy</h1>
                    <div className="card">
                        <p style={{ marginBottom: '1rem' }}>Last updated: March 2026</p>
                        <h3>1. Data Collection</h3>
                        <p style={{ marginBottom: '1.5rem', color: 'var(--color-text-muted)' }}>We only collect essential information needed to process your subscriptions and verify your golf scores. We do not sell your data to third-party marketers.</p>
                        <h3>2. Payment Security</h3>
                        <p style={{ marginBottom: '1.5rem', color: 'var(--color-text-muted)' }}>All payment information is processed securely through Stripe. Par4Charity does not store or process your raw credit card numbers.</p>
                        <h3>3. Account Deletion</h3>
                        <p style={{ color: 'var(--color-text-muted)' }}>You may request account deletion at any time via your user dashboard, which will permanently anonymize your golf history and halt future subscriptions.</p>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    )
}
