'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'

const userNavItems = [
    { href: '/dashboard', label: 'Overview', icon: '🏠' },
    { href: '/dashboard/scores', label: 'My Scores', icon: '⛳' },
    { href: '/dashboard/charity', label: 'My Charity', icon: '🌱' },
    { href: '/dashboard/draws', label: 'Draws', icon: '🎰' },
    { href: '/dashboard/winnings', label: 'Winnings', icon: '🏆' },
    { href: '/dashboard/subscription', label: 'Subscription', icon: '💳' },
    { href: '/dashboard/profile', label: 'Profile', icon: '👤' },
]

export default function DashboardSidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()
    const [loggingOut, setLoggingOut] = useState(false)
    const [isAdmin, setIsAdmin] = useState(false)

    useEffect(() => {
        const checkAdmin = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data } = await supabase.from('profiles').select('is_admin').eq('id', user.id).maybeSingle()
                setIsAdmin(data?.is_admin || false)
            }
        }
        checkAdmin()
    }, [supabase])

    const handleLogout = async () => {
        setLoggingOut(true)
        await supabase.auth.signOut()
        router.push('/')
    }

    return (
        <aside className="sidebar">
            <Link href="/" className="sidebar-logo">Par4Charity</Link>

            <nav className="sidebar-nav">
                <div className="sidebar-section-label">My Account</div>
                {userNavItems.map((item) => {
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
            </nav>

            <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {isAdmin && (
                    <Link href="/admin/reports" className="btn btn-gold btn-sm w-full" style={{ justifyContent: 'center' }}>
                        ⚡ Admin Panel
                    </Link>
                )}
                <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="sidebar-item w-full"
                    style={{ width: '100%', textAlign: 'left', opacity: loggingOut ? 0.5 : 1 }}
                >
                    <span>🚪</span> {loggingOut ? 'Logging out...' : 'Log Out'}
                </button>
            </div>
        </aside >
    )
}
