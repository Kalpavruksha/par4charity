import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Par4Charity — Golf. Win. Give.',
  description: 'Subscribe to play monthly prize draws with your golf Stableford scores. Every subscription supports a charity of your choice.',
  keywords: 'golf charity, golf subscription, stableford scores, prize draw, charity golf',
  openGraph: {
    title: 'Par4Charity — Golf. Win. Give.',
    description: 'Play monthly prize draws with your golf scores and support charity.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  )
}
