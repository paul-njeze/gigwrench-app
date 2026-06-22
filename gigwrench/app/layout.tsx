import type { Metadata } from 'next'
import './globals.css'
import DispatchWidget from '@/components/DispatchWidget'

export const metadata: Metadata = {
  title: 'GigWrench: Run Your Trade Like a Pro',
  description: 'AI-powered business platform for solo Pros.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet"/>
      </head>
      <body className="bg-gw-bg text-gw-text antialiased">
        {children}
        <DispatchWidget/>
      </body>
    </html>
  )
}
