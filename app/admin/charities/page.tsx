'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Charity {
    id: string
    name: string
    slug: string
    short_description: string | null
    category: string | null
    is_featured: boolean
    is_active: boolean
    total_raised: number
    created_at: string
}

const CHARITY_ICONS: Record<string, string> = {
    'golf-foundation': '⛳', 'macmillan-cancer-support': '💚', 'wwf': '🌿',
    'british-heart-foundation': '❤️', 'rnli': '🌊', 'alzheimers-society': '🧠',
}

const emptyForm = { name: '', slug: '', short_description: '', description: '', category: '', website_url: '', is_featured: false, is_active: true }

export default function AdminCharitiesPage() {
    const supabase = createClient()
    const [charities, setCharities] = useState<Charity[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState(emptyForm)
    const [editId, setEditId] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState('')

    const fetchCharities = async () => {
        const { data } = await supabase.from('charities').select('*').order('created_at', { ascending: false })
        setCharities(data || [])
        setLoading(false)
    }

    useEffect(() => { fetchCharities() }, [])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        const payload = { ...form, slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-') }
        if (editId) {
            await supabase.from('charities').update(payload).eq('id', editId)
            setMessage('Charity updated!')
        } else {
            await supabase.from('charities').insert(payload)
            setMessage('Charity added!')
        }
        setSaving(false)
        setShowForm(false)
        setEditId(null)
        setForm(emptyForm)
        fetchCharities()
    }

    const handleEdit = (c: Charity) => {
        setEditId(c.id)
        setForm({ name: c.name, slug: c.slug, short_description: c.short_description || '', description: '', category: c.category || '', website_url: '', is_featured: c.is_featured, is_active: c.is_active })
        setShowForm(true)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const toggleActive = async (id: string, current: boolean) => {
        await supabase.from('charities').update({ is_active: !current }).eq('id', id)
        fetchCharities()
    }

    const toggleFeatured = async (id: string, current: boolean) => {
        await supabase.from('charities').update({ is_featured: !current }).eq('id', id)
        fetchCharities()
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this charity? This cannot be undone.')) return
        const { error } = await supabase.from('charities').delete().eq('id', id)
        if (error) {
            setMessage('⚠️ Error: Cannot delete this charity! It is currently linked to active user subscriptions. Deactivate it instead.')
        } else {
            setMessage('Charity deleted successfully.')
            fetchCharities()
        }
    }

    return (
        <>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 className="page-title">🌱 Charities</h1>
                    <p className="page-subtitle">Manage charity partners — add, edit, feature, and deactivate.</p>
                </div>
                <button id="add-charity" className="btn btn-accent" onClick={() => { setShowForm(!showForm); setEditId(null); setForm(emptyForm) }}>
                    {showForm ? '✕ Cancel' : '➕ Add Charity'}
                </button>
            </div>

            {message && <div className="alert alert-success mb-4">{message}</div>}

            {/* Form */}
            {showForm && (
                <div className="card mb-4 animate-fade-up">
                    <h3 style={{ fontSize: '1rem', color: 'var(--color-text)', marginBottom: '1.25rem' }}>{editId ? '✏️ Edit Charity' : '➕ New Charity'}</h3>
                    <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label className="form-label">Name *</label>
                            <input id="charity-name" className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Slug</label>
                            <input className="form-input" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated from name" />
                        </div>
                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                            <label className="form-label">Short Description</label>
                            <input className="form-input" value={form.short_description} onChange={e => setForm({ ...form, short_description: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Category</label>
                            <input className="form-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="Health, Sport, Environment..." />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Website URL</label>
                            <input className="form-input" type="url" value={form.website_url} onChange={e => setForm({ ...form, website_url: e.target.value })} placeholder="https://..." />
                        </div>
                        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', gridColumn: '1 / -1' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                                <input type="checkbox" checked={form.is_featured} onChange={e => setForm({ ...form, is_featured: e.target.checked })} />
                                Featured on homepage
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                                <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} />
                                Active (visible to users)
                            </label>
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <button id="charity-save" className="btn btn-primary" type="submit" disabled={saving}>
                                {saving ? <><span className="spinner" /> Saving...</> : editId ? 'Update Charity' : 'Add Charity'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Charities Table */}
            <div className="card">
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" /></div>
                ) : (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Charity</th>
                                    <th>Category</th>
                                    <th>Featured</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {charities.map(c => (
                                    <tr key={c.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <span style={{ fontSize: '1.5rem' }}>{CHARITY_ICONS[c.slug] || '💛'}</span>
                                                <div>
                                                    <strong>{c.name}</strong>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)' }}>{c.short_description}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td><span className="badge badge-muted">{c.category || '—'}</span></td>
                                        <td>
                                            <button className={`badge ${c.is_featured ? 'badge-gold' : 'badge-muted'}`} style={{ cursor: 'pointer' }} onClick={() => toggleFeatured(c.id, c.is_featured)}>
                                                {c.is_featured ? '⭐ Featured' : 'Not Featured'}
                                            </button>
                                        </td>
                                        <td>
                                            <button className={`badge ${c.is_active ? 'badge-success' : 'badge-error'}`} style={{ cursor: 'pointer' }} onClick={() => toggleActive(c.id, c.is_active)}>
                                                {c.is_active ? 'Active' : 'Inactive'}
                                            </button>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button className="btn btn-outline btn-sm" onClick={() => handleEdit(c)}>✏️ Edit</button>
                                                <button className="btn btn-ghost btn-sm" style={{ color: 'var(--color-error)' }} onClick={() => handleDelete(c.id)}>🗑️</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    )
}
