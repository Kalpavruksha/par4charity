'use server'

import { sendEmail } from '@/lib/email'

export async function notifyWinner(userId: string, email: string, matchCount: number, amount: number) {
    if (!email) return
    const subject = '🏌️ You won the Par4Charity Monthly Draw!'
    const html = `
        <div style="font-family: sans-serif; text-align: center; color: #333;">
            <h1 style="color: #6C63FF; margin-bottom: 20px;">Congratulations! 🎉</h1>
            <p>You matched <strong>${matchCount} numbers</strong> in this month's official Par4Charity draw!</p>
            <p style="font-size: 24px; font-weight: bold; margin: 30px 0;">You have won £${amount.toFixed(2)}!</p>
            <p>To claim your winnings, please log into your dashboard and upload your official scorecard proof within 14 days.</p>
            <br/>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/winnings" style="background: #00D4AA; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Claim Winnings Now</a>
        </div>
    `
    await sendEmail({ to: email, subject, html })
}

export async function notifySupport(name: string, email: string, message: string) {
    const subject = `Support Ticket: ${name}`
    const html = `<p><strong>From:</strong> ${name} (${email})</p><p><strong>Message:</strong></p><p>${message}</p>`
    await sendEmail({ to: 'support@par4charity.com', subject, html })
}
