'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)
    const [theme, setTheme] = useState('light')

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20)
        window.addEventListener('scroll', onScroll)

        const savedTheme = localStorage.getItem('theme') || 'light'
        setTheme(savedTheme)
        document.documentElement.setAttribute('data-theme', savedTheme)

        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light'
        setTheme(newTheme)
        localStorage.setItem('theme', newTheme)
        document.documentElement.setAttribute('data-theme', newTheme)
    }

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="nav-inner">
                <Link href="/" className="nav-logo">Par4Charity</Link>

                <ul className="nav-links">
                    <li><Link href="/how-it-works" className="nav-link">How It Works</Link></li>
                    <li><Link href="/charities" className="nav-link">Charities</Link></li>
                    <li><Link href="/draws" className="nav-link">Draws</Link></li>
                    <li><Link href="/subscribe" className="nav-link">Pricing</Link></li>
                </ul>

                <div className="nav-actions">
                    <Link href="/auth/login" className="btn btn-ghost btn-sm">Log In</Link>
                    <Link href="/auth/signup" className="btn btn-primary btn-sm">Join Now</Link>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: 'auto' }}>
                    <button
                        onClick={toggleTheme}
                        style={{ background: 'transparent', border: 'none', color: 'var(--color-text)', fontSize: '1.25rem', cursor: 'pointer', padding: '0 0.5rem' }}
                        title="Toggle Dark Mode"
                    >
                        {theme === 'light' ? '🌙' : '☀️'}
                    </button>
                    <button
                        className="hamburger"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        aria-label="Toggle menu"
                    >
                        <span></span><span></span><span></span>
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div style={{
                    background: 'var(--color-bg-2)',
                    borderTop: '1px solid var(--color-border)',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                }}>
                    <Link href="/how-it-works" className="nav-link" onClick={() => setMobileOpen(false)}>How It Works</Link>
                    <Link href="/charities" className="nav-link" onClick={() => setMobileOpen(false)}>Charities</Link>
                    <Link href="/draws" className="nav-link" onClick={() => setMobileOpen(false)}>Draws</Link>
                    <Link href="/subscribe" className="nav-link" onClick={() => setMobileOpen(false)}>Pricing</Link>
                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                        <Link href="/auth/login" className="btn btn-outline btn-sm w-full" onClick={() => setMobileOpen(false)}>Log In</Link>
                        <Link href="/auth/signup" className="btn btn-primary btn-sm w-full" onClick={() => setMobileOpen(false)}>Join Now</Link>
                    </div>
                </div>
            )}
        </nav>
    )
}
