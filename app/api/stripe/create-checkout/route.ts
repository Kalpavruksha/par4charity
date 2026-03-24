import { NextRequest, NextResponse } from 'next/server'
import { stripe, PLANS } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { plan, charityId, charityPercent, amount, charityName } = await req.json()

        // Get or create Stripe customer
        const { data: profile } = await supabase.from('profiles').select('email').eq('id', user.id).single()

        let customerId: string
        const { data: existingSub } = await supabase.from('subscriptions').select('stripe_customer_id').eq('user_id', user.id).maybeSingle()

        if (existingSub?.stripe_customer_id) {
            customerId = existingSub.stripe_customer_id
        } else {
            const customer = await stripe.customers.create({
                email: profile?.email || user.email!,
                metadata: { supabase_user_id: user.id },
            })
            customerId = customer.id
        }

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

        if (plan === 'onetime') {
            const session = await stripe.checkout.sessions.create({
                customer: customerId,
                payment_method_types: ['card'],
                line_items: [{
                    price_data: {
                        currency: 'gbp',
                        product_data: { name: `Donation to ${charityName}` },
                        unit_amount: (amount || 50) * 100, // £50
                    },
                    quantity: 1,
                }],
                mode: 'payment',
                success_url: `${appUrl}/charities/${charityId}?donated=1`,
                cancel_url: `${appUrl}/charities/${charityId}?cancelled=1`,
                metadata: {
                    user_id: user.id,
                    type: 'donation',
                    charity_id: charityId || '',
                    donation_amount: String(amount || 50)
                }
            })
            return NextResponse.json({ url: session.url })
        }

        const planConfig = PLANS[plan as keyof typeof PLANS]
        if (!planConfig) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })

        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            payment_method_types: ['card'],
            line_items: [{ price: planConfig.priceId, quantity: 1 }],
            mode: 'subscription',
            success_url: `${appUrl}/dashboard?subscribed=1`,
            cancel_url: `${appUrl}/subscribe?cancelled=1`,
            metadata: {
                user_id: user.id,
                plan,
                charity_id: charityId || '',
                charity_percent: String(charityPercent || 10),
            },
        })

        return NextResponse.json({ url: session.url })
    } catch (err) {
        console.error('Checkout error:', err)
        return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
    }
}
