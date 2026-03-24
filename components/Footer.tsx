import Link from 'next/link'

export default function Footer() {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-grid">
                    <div className="footer-brand">
                        <div className="nav-logo">Par4Charity</div>
                        <p>
                            Where every golf score becomes a chance to win — and every subscription supports a cause you believe in.
                        </p>
                    </div>

                    <div className="footer-col">
                        <h4>Platform</h4>
                        <ul className="footer-links">
                            <li><Link href="/how-it-works" className="footer-link">How It Works</Link></li>
                            <li><Link href="/draws" className="footer-link">Monthly Draws</Link></li>
                            <li><Link href="/subscribe" className="footer-link">Subscription Plans</Link></li>
                            <li><Link href="/charities" className="footer-link">Charity Directory</Link></li>
                        </ul>
                    </div>

                    <div className="footer-col">
                        <h4>Account</h4>
                        <ul className="footer-links">
                            <li><Link href="/auth/signup" className="footer-link">Sign Up</Link></li>
                            <li><Link href="/auth/login" className="footer-link">Log In</Link></li>
                            <li><Link href="/dashboard" className="footer-link">My Dashboard</Link></li>
                            <li><Link href="/dashboard/scores" className="footer-link">My Scores</Link></li>
                        </ul>
                    </div>

                    <div className="footer-col">
                        <h4>Legal</h4>
                        <ul className="footer-links">
                            <li><Link href="/terms" className="footer-link">Terms of Service</Link></li>
                            <li><Link href="/privacy" className="footer-link">Privacy Policy</Link></li>
                            <li><Link href="/draw-rules" className="footer-link">Draw Rules</Link></li>
                            <li><Link href="/contact" className="footer-link">Contact</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <span>© 2026 Par4Charity. All rights reserved.</span>
                    <span>Proudly supporting charities across the UK 🌱</span>
                </div>
            </div>
        </footer>
    )
}
