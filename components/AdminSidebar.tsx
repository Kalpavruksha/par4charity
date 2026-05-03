'use client'
     
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

const adminNavItems = [
    { href: '/admin', label: 'Overview', icon: '📊' },
    { href: '/admin/users', label: 'Users', icon: '👥' },
    { href: '/admin/draws', label: 'Draw Management', icon: '🎰' },
    { href: '/admin/charities', label: 'Charities', icon: '🌱' },
    { href: '/admin/winners', label: 'Winners', icon: '🏆' },
    { href: '/admin/subscriptions', label: 'Subscriptions', icon: '💳' },
    { href: '/admin/reports', label: 'Reports', icon: '📈' },
]

export default function AdminSidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()
    const [loggingOut, setLoggingOut] = useState(false)

    const handleLogout = async () => {
        setLoggingOut(true)
        await supabase.auth.signOut()
        router.push('/')
    }

    return (
        <aside className="sidebar">
            <Link href="/admin" className="sidebar-logo">
                Par4Charity <span style={{ fontSize: '0.65rem', color: 'var(--color-text-dim)', fontWeight: 600, display: 'block', marginTop: '-0.75rem' }}>Admin Panel</span>
            </Link>

            <nav className="sidebar-nav">
                <div className="sidebar-section-label">Administration</div>
                {adminNavItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`sidebar-item ${isActive ? 'active' : ''}`}
                        >
                            <span>{item.icon}</span>
                            {item.label}
                        </Link>
                    )
                })}

                <div className="sidebar-section-label" style={{ marginTop: '1rem' }}>Switch to</div>
                <Link href="/dashboard" className="sidebar-item">
                    <span>🏠</span> User Dashboard
                </Link>
            </nav>

            <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button
                    onClick={() => {
                        const currentTheme = document.documentElement.getAttribute('data-theme')
                        const newTheme = currentTheme === 'dark' ? 'light' : 'dark'
                        document.documentElement.setAttribute('data-theme', newTheme)
                        localStorage.setItem('theme', newTheme)
                    }}
                    className="sidebar-item"
                    style={{ width: '100%', textAlign: 'left' }}
                >
                    <span>🌓</span> Toggle Theme
                </button>
                <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="sidebar-item"
                    style={{ width: '100%', textAlign: 'left', opacity: loggingOut ? 0.5 : 1 }}
                >
                    <span>🚪</span> {loggingOut ? 'Logging out...' : 'Log Out'}
                </button>
            </div>
        </aside>
    )
}
