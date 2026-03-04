import type { Metadata } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space',
})

export const metadata: Metadata = {
  title: 'QuizMind AI — AI Study Assistant',
  description: 'Upload your study material and generate smart questions with AI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body>
        {/* Background orbs for depth effect */}
        <div className="orb orb-purple" />
        <div className="orb orb-pink" />
        <div className="orb orb-blue" />

        {/* Navbar */}
        <Navbar />

        {/* Main content */}
        <main className="relative z-10 min-h-screen pt-20">
          {children}
        </main>
      </body>
    </html>
  )
}