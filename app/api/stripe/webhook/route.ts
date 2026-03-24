import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

// Use service role to bypass RLS for webhook processing
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
    const body = await req.text()
    const sig = req.headers.get('stripe-signature')!

    let event: Stripe.Event
    try {
        event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
    } catch (err) {
        console.error('Webhook sig failed:', err)
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session
                const meta = session.metadata || {}
                const userId = meta.user_id
                const plan = meta.plan
                const charityId = meta.charity_id || null
                const charityPercent = parseInt(meta.charity_percent || '10')

                // Get charity UUID from slug
                let charityUUID: string | null = null
                if (charityId) {
                    const { data: charity, error: charErr } = await supabaseAdmin.from('charities')
                        .select('id')
                        .eq('slug', charityId)
                        .maybeSingle()
                    if (charErr) console.error('Charity lookup error:', charErr)
                    charityUUID = charity?.id || null
                }

                if (meta.type === 'donation' && charityUUID && meta.donation_amount) {
                    const amt = parseInt(meta.donation_amount)
                    console.log(`Processing £${amt} independent donation to ${charityId}`)
                    await supabaseAdmin.rpc('increment_charity_raised', {
                        cid: charityUUID, amount: amt
                    })
                    break // Stop processing, this is not a subscription
                }

                if (!userId || !plan || !session.subscription) break

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const stripe_sub = await stripe.subscriptions.retrieve(session.subscription as string) as any

                // Upsert subscription
                await supabaseAdmin.from('subscriptions').upsert({
                    user_id: userId,
                    stripe_customer_id: session.customer as string,
                    stripe_subscription_id: session.subscription as string,
                    plan,
                    status: 'active',
                    current_period_start: stripe_sub.current_period_start ? new Date(stripe_sub.current_period_start * 1000).toISOString() : null,
                    current_period_end: stripe_sub.current_period_end ? new Date(stripe_sub.current_period_end * 1000).toISOString() : null,
                    cancel_at_period_end: stripe_sub.cancel_at_period_end ?? false,
                    charity_id: charityUUID,
                    charity_percentage: charityPercent,
                }, { onConflict: 'user_id' })

                // Record charity contribution
                if (charityUUID) {
                    const amount = plan === 'monthly' ? 999 : 9999
                    const charityAmount = Math.floor(amount * charityPercent / 100)
                    const month = new Date().toISOString().slice(0, 7)
                    await supabaseAdmin.from('charity_contributions').insert({
                        user_id: userId,
                        charity_id: charityUUID,
                        amount: charityAmount,
                        contribution_month: month,
                    })
                    // Update charity total_raised
                    await supabaseAdmin.rpc('increment_charity_raised', { charity_id: charityUUID, amount: charityAmount }).maybeSingle()
                }
                break
            }

            case 'customer.subscription.updated': {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const sub = event.data.object as any
                await supabaseAdmin.from('subscriptions').update({
                    status: sub.status,
                    current_period_start: sub.current_period_start ? new Date(sub.current_period_start * 1000).toISOString() : null,
                    current_period_end: sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null,
                    cancel_at_period_end: sub.cancel_at_period_end ?? false,
                }).eq('stripe_subscription_id', sub.id)
                break
            }

            case 'customer.subscription.deleted': {
                const sub = event.data.object as Stripe.Subscription
                await supabaseAdmin.from('subscriptions').update({ status: 'cancelled' }).eq('stripe_subscription_id', sub.id)
                break
            }

            case 'invoice.payment_failed': {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const invoice = event.data.object as any
                if (invoice.subscription) {
                    await supabaseAdmin.from('subscriptions').update({ status: 'past_due' }).eq('stripe_subscription_id', invoice.subscription as string)
                }
                break
            }
        }

        return NextResponse.json({ received: true })
    } catch (err) {
        console.error('Webhook processing error:', err)
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
    }
}
