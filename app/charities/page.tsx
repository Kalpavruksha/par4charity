'use client'

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { useState } from 'react'

const charities = [
    { id: 'golf-foundation', icon: '⛳', name: 'Golf Foundation', category: 'Youth & Sport', description: 'Introducing golf to young people across the UK, building confidence and life skills through sport.', raised: '£12,400', featured: true },
    { id: 'macmillan', icon: '💚', name: 'Macmillan Cancer Support', category: 'Health', description: 'Supporting people living with cancer through expert nurses, financial guidance, and emotional support.', raised: '£28,700', featured: true },
    { id: 'wwf', icon: '🌿', name: 'WWF', category: 'Environment', description: 'Working to conserve nature and reduce the most pressing threats to biodiversity on Earth.', raised: '£9,100', featured: false },
    { id: 'bhf', icon: '❤️', name: 'British Heart Foundation', category: 'Health', description: 'Funding vital research into heart and circulatory diseases that kill and disable millions.', raised: '£18,300', featured: false },
    { id: 'rnli', icon: '🌊', name: 'RNLI', category: 'Emergency Services', description: 'Saving lives at sea with lifeboat and lifeguard services around the UK and Ireland.', raised: '£7,600', featured: false },
    { id: 'alzheimers', icon: '🧠', name: "Alzheimer's Society", category: 'Health', description: 'Supporting people affected by dementia through care, research and brilliant staff.', raised: '£15,200', featured: true },
]

export default function CharitiesPage() {
    const [selectedCategory, setSelectedCategory] = useState('All')
    const [searchQuery, setSearchQuery] = useState('')

    const filteredCharities = charities.filter(c => {
        const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory
        const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.description.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesCategory && matchesSearch
    })

    return (
        <>
            <Navbar />
            <main style={{ paddingTop: '5rem' }}>
                {/* Header */}
                <section style={{
                    padding: '4rem 0',
                    background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0,212,170,0.12) 0%, transparent 60%), var(--color-bg)',
                    borderBottom: '1px solid var(--color-border)',
                    textAlign: 'center'
                }}>
                    <div className="container">
                        <div className="hero-eyebrow" style={{ display: 'inline-flex', margin: '0 auto 1.5rem' }}>
                            <span>🌱</span> Impact Directory
                        </div>
                        <h1 className="animate-fade-up">Choose Your <span className="text-gradient">Cause</span></h1>
                        <p className="animate-fade-up animate-delay-1" style={{ maxWidth: 560, margin: '1rem auto 0' }}>
                            Every subscription contributes to a charity you believe in. Browse our verified charity partners and select the cause closest to your heart.
                        </p>
                    </div>
                </section>

                {/* Filters */}
                <section style={{ padding: '2rem 0', borderBottom: '1px solid var(--color-border)' }}>
                    <div className="container" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {['All', 'Health', 'Youth & Sport', 'Environment', 'Emergency Services'].map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`badge ${selectedCategory === cat ? 'badge-primary' : 'badge-muted'}`}
                                    style={{ cursor: 'pointer', padding: '0.4rem 1rem', fontSize: '0.8rem' }}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                        <input
                            className="form-input"
                            placeholder="Search charities..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ maxWidth: 240, padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                        />
                    </div>
                </section>

                {/* Featured Spotlight */}
                <section className="section-sm">
                    <div className="container">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <span className="badge badge-gold">⭐ Featured</span>
                            <h2 style={{ fontSize: '1.4rem' }}>Spotlight Charities</h2>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                            {charities.filter(c => c.featured).map((charity) => (
                                <div key={charity.name} className="charity-card">
                                    <div className="charity-banner">{charity.icon}</div>
                                    <div className="charity-body">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                            <h3 className="charity-name" style={{ fontSize: '1.05rem' }}>{charity.name}</h3>
                                            <span className="badge badge-accent" style={{ fontSize: '0.65rem', flexShrink: 0 }}>{charity.category}</span>
                                        </div>
                                        <p className="charity-desc">{charity.description}</p>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div className="charity-raised">💚 {charity.raised} raised</div>
                                            <Link href="/subscribe" className="btn btn-accent btn-sm">Support</Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* All Charities */}
                <section className="section-sm" style={{ borderTop: '1px solid var(--color-border)' }}>
                    <div className="container">
                        <h2 style={{ fontSize: '1.4rem', marginBottom: '1.5rem' }}>Active Charities</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                            {filteredCharities.length === 0 ? (
                                <div style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                    No charities match your search criteria.
                                </div>
                            ) : (
                                filteredCharities.map((charity) => (
                                    <div key={charity.name} className="charity-card">
                                        <div className="charity-banner">{charity.icon}</div>
                                        <div className="charity-body">
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                                <h3 className="charity-name" style={{ fontSize: '1.05rem' }}>{charity.name}</h3>
                                                <span className="badge badge-muted" style={{ fontSize: '0.65rem', flexShrink: 0 }}>{charity.category}</span>
                                            </div>
                                            <p className="charity-desc">{charity.description}</p>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div className="charity-raised">💚 {charity.raised} raised</div>
                                                <Link href={`/charities/${charity.id}`} className="btn btn-outline btn-sm">Support</Link>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section style={{ padding: '4rem 0', textAlign: 'center', borderTop: '1px solid var(--color-border)' }}>
                    <div className="container-sm">
                        <h2 style={{ marginBottom: '1rem' }}>Ready to make an <span className="text-gradient">impact?</span></h2>
                        <p style={{ marginBottom: '2rem' }}>Subscribe today and choose a charity to receive your contribution every month.</p>
                        <Link href="/subscribe" className="btn btn-accent btn-lg">Start Supporting</Link>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    )
}
