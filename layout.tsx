import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Space_Grotesk } from 'next/font/google'
import { ContentHydrator } from '@/components/content-hydrator'
import { PhoneFrame } from '@/components/na/phone-frame'
import { APP_NAME } from '@/lib/mock-data'
import './globals.css'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

export const metadata: Metadata = {
  title: `${APP_NAME} - 60-second lessons for UEH students`,
  description:
    'A short-video learning feed with quizzes and flashcards for UEH university students.',
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#FFCC1A',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.variable} font-sans antialiased`}>
        <ContentHydrator />
        <PhoneFrame>{children}</PhoneFrame>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
