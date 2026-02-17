import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Reach Admin',
  description: 'Admin panel for Reach platform management',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
