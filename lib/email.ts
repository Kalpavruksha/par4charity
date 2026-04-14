export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
    // If a Resend API key is detected, it will actually shoot the email.
    // Otherwise, this operates in 'dry-run' simulation mode which satisfies PRD requirements.
 
    console.log('\n=======================================')
    console.log('📧 [EMAIL DISPATCHER TRIGGERED]')
    console.log(`📡 To: ${to}`)
    console.log(`📝 Subject: ${subject}`)
    console.log('=======================================\n')

    if (process.env.RESEND_API_KEY) {
        try {
            const res = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    from: 'Par4Charity <noreply@par4charity.com>',
                    to,
                    subject,
                    html
                })
            })
            if (!res.ok) {
                console.error('❌ Resend API failed', await res.text())
            } else {
                console.log('✅ Email successfully dispatched via Resend')
            }
        } catch (err) {
            console.error('❌ Email push failed', err)
        }
    } else {
        console.log('⚠️ [RESEND_API_KEY] missing. Operating in Dry-Run Mode. No network request sent.\n')
    }
}
