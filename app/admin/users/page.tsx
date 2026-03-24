'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface User {
    id: string
    email: string
    full_name: string | null
    is_admin: boolean
    created_at: string
    subscription?: { plan: string; status: string } | null
}

export default function AdminUsersPage() {
    const supabase = createClient()
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [editUser, setEditUser] = useState<User | null>(null)
    const [scores, setScores] = useState<{ id: string; score: number; played_at: string }[]>([])
    const [editScore, setEditScore] = useState<{ id: string; score: number; played_at: string } | null>(null)
    const [message, setMessage] = useState('')

    const fetchUsers = async () => {
        const { data: profiles } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
        const { data: subs } = await supabase.from('subscriptions').select('user_id, plan, status').eq('status', 'active')
        const subMap: Record<string, { plan: string; status: string }> = {}
        subs?.forEach(s => { subMap[s.user_id] = { plan: s.plan, status: s.status } })
        setUsers((profiles || []).map(p => ({ ...p, subscription: subMap[p.id] || null })))
        setLoading(false)
    }

    useEffect(() => { fetchUsers() }, [])

    const openUserModal = async (user: User) => {
        setEditUser(user)
        const { data } = await supabase.from('golf_scores').select('*').eq('user_id', user.id).order('played_at', { ascending: false })
        setScores(data || [])
    }

    const updateScore = async () => {
        if (!editScore) return
        await supabase.from('golf_scores').update({ score: editScore.score, played_at: editScore.played_at }).eq('id', editScore.id)
        setEditScore(null)
        const { data } = await supabase.from('golf_scores').select('*').eq('user_id', editUser!.id).order('played_at', { ascending: false })
        setScores(data || [])
    }

    const deleteScore = async (id: string) => {
        if (!confirm('Delete this score?')) return
        await supabase.from('golf_scores').delete().eq('id', id)
        setScores(prev => prev.filter(s => s.id !== id))
    }

    const toggleAdmin = async (userId: string, current: boolean) => {
        await supabase.from('profiles').update({ is_admin: !current }).eq('id', userId)
        await fetchUsers()
        setMessage(`Admin status updated.`)
    }

    const filtered = users.filter(u =>
        u.email?.toLowerCase().includes(search.toLowerCase()) ||
        u.full_name?.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 className="page-title">👥 Users</h1>
                    <p className="page-subtitle">Manage all registered users, view profiles, scores, and subscriptions.</p>
                </div>
                <input className="form-input" placeholder="🔍 Search users..." style={{ maxWidth: 280, fontSize: '0.875rem' }} value={search} onChange={e => setSearch(e.target.value)} />
            </div>

            {message && <div className="alert alert-success mb-4">{message}</div>}

            <div className="card">
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" /></div>
                ) : (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Email</th>
                                    <th>Name</th>
                                    <th>Subscription</th>
                                    <th>Role</th>
                                    <th>Joined</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(user => (
                                    <tr key={user.id}>
                                        <td><strong>{user.email}</strong></td>
                                        <td>{user.full_name || '—'}</td>
                                        <td>
                                            {user.subscription
                                                ? <span className="badge badge-success" style={{ textTransform: 'capitalize' }}>{user.subscription.plan}</span>
                                                : <span className="badge badge-muted">None</span>}
                                        </td>
                                        <td>
                                            {user.is_admin
                                                ? <span className="badge badge-gold">Admin</span>
                                                : <span className="badge badge-muted">User</span>}
                                        </td>
                                        <td>{new Date(user.created_at).toLocaleDateString('en-GB')}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button className="btn btn-primary btn-sm" onClick={() => openUserModal(user)}>View</button>
                                                <button className="btn btn-ghost btn-sm" onClick={() => toggleAdmin(user.id, user.is_admin)} style={{ color: user.is_admin ? 'var(--color-error)' : 'var(--color-accent)' }}>
                                                    {user.is_admin ? 'Remove Admin' : 'Make Admin'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* User Detail Modal */}
            {editUser && (
                <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setEditUser(null) }}>
                    <div className="modal" style={{ maxWidth: 600 }}>
                        <div className="modal-header">
                            <h3 className="modal-title">👤 {editUser.email}</h3>
                            <button className="btn btn-ghost btn-sm" onClick={() => setEditUser(null)}>✕</button>
                        </div>

                        <div className="card mb-3" style={{ background: 'var(--color-bg)' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.875rem' }}>
                                <div><span style={{ color: 'var(--color-text-dim)' }}>Name:</span> <strong>{editUser.full_name || '—'}</strong></div>
                                <div><span style={{ color: 'var(--color-text-dim)' }}>Role:</span> <strong>{editUser.is_admin ? 'Admin' : 'User'}</strong></div>
                                <div><span style={{ color: 'var(--color-text-dim)' }}>Plan:</span> <strong>{editUser.subscription?.plan || 'No subscription'}</strong></div>
                                <div><span style={{ color: 'var(--color-text-dim)' }}>Joined:</span> <strong>{new Date(editUser.created_at).toLocaleDateString('en-GB')}</strong></div>
                            </div>
                        </div>

                        <h4 style={{ fontSize: '0.9rem', color: 'var(--color-text)', marginBottom: '0.75rem' }}>⛳ Golf Scores ({scores.length}/5)</h4>
                        {scores.length === 0 ? (
                            <p className="text-sm" style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '1rem' }}>No scores entered.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                                {scores.map(score => (
                                    <div key={score.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem', background: 'var(--color-bg-3)', borderRadius: 'var(--radius-sm)' }}>
                                        {editScore?.id === score.id ? (
                                            <>
                                                <input type="number" min={1} max={45} className="form-input" style={{ width: 70, padding: '0.375rem 0.5rem' }} value={editScore.score} onChange={e => setEditScore({ ...editScore, score: parseInt(e.target.value) })} />
                                                <input type="date" className="form-input" style={{ flex: 1, padding: '0.375rem 0.5rem' }} value={editScore.played_at} onChange={e => setEditScore({ ...editScore, played_at: e.target.value })} />
                                                <button className="btn btn-accent btn-sm" onClick={updateScore}>Save</button>
                                                <button className="btn btn-ghost btn-sm" onClick={() => setEditScore(null)}>✕</button>
                                            </>
                                        ) : (
                                            <>
                                                <div className="score-ball score-ball-primary" style={{ width: 36, height: 36, fontSize: '0.8rem' }}>{score.score}</div>
                                                <span style={{ flex: 1, fontSize: '0.85rem' }}>{new Date(score.played_at).toLocaleDateString('en-GB')}</span>
                                                <button className="btn btn-ghost btn-sm" onClick={() => setEditScore(score)}>✏️</button>
                                                <button className="btn btn-ghost btn-sm" onClick={() => deleteScore(score.id)} style={{ color: 'var(--color-error)' }}>🗑️</button>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                        <button className="btn btn-outline w-full" onClick={() => setEditUser(null)}>Close</button>
                    </div>
                </div>
            )}
        </>
    )
}
