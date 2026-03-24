import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import DonateButton from './DonateButton'

const charities = [
    { id: 'golf-foundation', icon: '⛳', name: 'Golf Foundation', category: 'Youth & Sport', description: 'Introducing golf to young people across the UK, building confidence and life skills through sport.', full_desc: 'The Golf Foundation is a registered charity that gives children and young people the opportunity to experience golf and the benefits it has to offer. They run initiatives in schools and local communities to make the sport accessible to everyone regardless of background.', raised: '£12,400', featured: true, events: [{ name: 'Annual Schools Championship', date: 'April 2026' }, { name: 'Summer Junior Clinics', date: 'August 2026' }] },
    { id: 'macmillan', icon: '💚', name: 'Macmillan Cancer Support', category: 'Health', description: 'Supporting people living with cancer through expert nurses, financial guidance, and emotional support.', full_desc: 'Macmillan provides physical, financial and emotional support to help you live life as fully as you can. Par4Charity golfers have raised immense funds to sponsor new Macmillan nurses across the UK.', raised: '£28,700', featured: true, events: [{ name: 'Macmillan Longest Day Golf Challenge', date: 'June 2026' }] },
    { id: 'wwf', icon: '🌿', name: 'WWF', category: 'Environment', description: 'Working to conserve nature and reduce the most pressing threats to biodiversity on Earth.', full_desc: 'WWF is the world’s leading independent conservation organisation. Our mission is to create a world where people and wildlife can thrive together. Golf courses play a huge part in local biospheres, and donations help improve course ecology.', raised: '£9,100', featured: false, events: [{ name: 'Earth Hour Golf Night', date: 'March 2026' }] },
    { id: 'bhf', icon: '❤️', name: 'British Heart Foundation', category: 'Health', description: 'Funding vital research into heart and circulatory diseases that kill and disable millions.', full_desc: 'The BHF funds around £100 million of research each year into all heart and circulatory diseases. Golf is an excellent cardiovascular activity, and supporting BHF helps keep hearts beating across the nation.', raised: '£18,300', featured: false, events: [{ name: 'Heart of Gold Tournament', date: 'May 2026' }] },
    { id: 'rnli', icon: '🌊', name: 'RNLI', category: 'Emergency Services', description: 'Saving lives at sea with lifeboat and lifeguard services around the UK and Ireland.', full_desc: 'The Royal National Lifeboat Institution is the charity that saves lives at sea. Powered primarily by kind donations, RNLI search and rescue teams cover the 19,000-mile coastline of the UK and Ireland.', raised: '£7,600', featured: false, events: [{ name: 'Coastal Golf Classic', date: 'July 2026' }] },
    { id: 'alzheimers', icon: '🧠', name: "Alzheimer's Society", category: 'Health', description: 'Supporting people affected by dementia through care, research and brilliant staff.', full_desc: 'Alzheimer’s Society is the UK’s leading dementia charity. They campaign for change, fund research to find a cure and support people living with dementia today. Golf memories last a lifetime; let’s protect them.', raised: '£15,200', featured: true, events: [{ name: 'Memory Walk & Golf Day', date: 'September 2026' }] },
]

export default function CharityProfile({ params }: { params: { id: string } }) {
    const charity = charities.find(c => c.id === params.id)
    if (!charity) notFound()

    return (
        <>
            <Navbar />
            <main style={{ paddingTop: '5rem' }}>
                <section style={{ padding: '4rem 0', borderBottom: '1px solid var(--color-border)' }}>
                    <div className="container" style={{ maxWidth: 800 }}>
                        <Link href="/charities" style={{ color: 'var(--color-primary-light)', fontSize: '0.875rem', marginBottom: '2rem', display: 'inline-block' }}>
                            ← Back to Directory
                        </Link>

                        <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
                            <div style={{ fontSize: '4rem', background: 'var(--color-surface)', padding: '2rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)' }}>
                                {charity.icon}
                            </div>
                            <div>
                                <div className="badge badge-accent mb-2">{charity.category}</div>
                                <h1 style={{ marginBottom: '0.5rem' }}>{charity.name}</h1>
                                <p style={{ fontSize: '1.25rem', color: 'var(--color-text-muted)' }}>{charity.description}</p>

                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                                    <Link href={`/subscribe?charity=${charity.id}`} className="btn btn-primary">
                                        Support via Subscription
                                    </Link>
                                    <DonateButton charityId={charity.id} charityName={charity.name} />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section style={{ padding: '4rem 0', background: 'var(--color-bg-2)' }}>
                    <div className="container" style={{ maxWidth: 800 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '4rem' }}>
                            <div>
                                <h2 style={{ marginBottom: '1rem' }}>About the Cause</h2>
                                <p style={{ lineHeight: 1.8, color: 'var(--color-text-muted)', marginBottom: '2rem' }}>{charity.full_desc}</p>

                                <h2 style={{ marginBottom: '1rem' }}>Upcoming Events</h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {charity.events.map((event, i) => (
                                        <div key={i} className="card" style={{ padding: '1.5rem' }}>
                                            <h4 style={{ marginBottom: '0.25rem' }}>{event.name}</h4>
                                            <div style={{ fontSize: '0.875rem', color: 'var(--color-primary-light)', fontWeight: 600 }}>📅 {event.date}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <div className="card text-center" style={{ borderColor: 'rgba(0,212,170,0.3)', background: 'rgba(0,212,170,0.05)' }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💚</div>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Total Raised by Par4Charity</div>
                                    <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-accent)' }}>{charity.raised}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    )
}
