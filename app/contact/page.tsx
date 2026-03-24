'use client'

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useState } from 'react'
import { notifySupport } from '@/app/actions'

export default function ContactPage() {
    const [loading, setLoading] = useState(false)

    return (
        <>
            <Navbar />
            <main style={{ paddingTop: '6rem', minHeight: '80vh' }}>
                <div className="container" style={{ maxWidth: 600 }}>
                    <h1 style={{ marginBottom: '1rem', textAlign: 'center' }}>Contact Us</h1>
                    <p style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--color-text-muted)' }}>Need support with your account, subscription, or winner verification? We're here to help.</p>

                    <div className="card" style={{ padding: '2.5rem' }}>
                        <form className="auth-form" onSubmit={async (e) => {
                            e.preventDefault();
                            setLoading(true);
                            const formData = new FormData(e.currentTarget);
                            const name = formData.get('name') as string;
                            const email = formData.get('email') as string;
                            const message = formData.get('message') as string;
                            if (name && email && message) {
                                await notifySupport(name, email, message);
                                alert('Message sent successfully! Our support team will respond within 24 hours.');
                            }
                            setLoading(false);
                            (e.target as HTMLFormElement).reset();
                        }}>
                            <div className="form-group">
                                <label className="form-label">Name</label>
                                <input className="form-input" name="name" type="text" placeholder="Your Name" required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email Address</label>
                                <input className="form-input" name="email" type="email" placeholder="you@example.com" required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Message</label>
                                <textarea className="form-input" name="message" rows={5} placeholder="How can we help you?" required style={{ resize: 'vertical' }} />
                            </div>
                            <button className="btn btn-accent w-full" type="submit" disabled={loading}>
                                {loading ? 'Sending...' : 'Send Message'}
                            </button>
                        </form>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    )
}
