import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    // @ts-expect-error - ignore strict stripe api version matching
    apiVersion: '2024-06-20',
    typescript: true,
})

export const PLANS = {
    monthly: {
        name: 'Monthly',
        priceId: process.env.STRIPE_MONTHLY_PRICE_ID!,
        amount: 999, // £9.99 in pence
        interval: 'month' as const,
        charityMin: 100, // £1.00 minimum charity contribution
    },
    yearly: {
        name: 'Yearly',
        priceId: process.env.STRIPE_YEARLY_PRICE_ID!,
        amount: 9999, // £99.99 in pence
        interval: 'year' as const,
        charityMin: 1000, // £10.00 minimum charity contribution
    },
}
