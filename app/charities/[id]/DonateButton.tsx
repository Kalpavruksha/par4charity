'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function DonateButton({ charityId, charityName }: { charityId: string; charityName: string }) {
    const supabase = createClient()
    const [loading, setLoading] = useState(false)

    const handleDonate = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/stripe/create-checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plan: 'onetime', charityId, charityName, amount: 50 }), // fixed £50 independent donation
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to create donation session')
            window.location.href = data.url
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return (
        <button className="btn btn-outline" onClick={handleDonate} disabled={loading}>
            {loading ? <><span className="spinner" /> Loading...</> : 'Donate £50 Independently'}
        </button>
    )
}
