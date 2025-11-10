import type { Metadata } from 'next'
import '@/styles/globals.css'
import Header from '@/components/Header'

export const metadata: Metadata = {
  title: 'Premier League Match Predictor',
  description: 'Predict Premier League match outcomes using machine learning',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
  <div className="min-h-screen bg-gradient-to-br from-sky-500 via-indigo-600 to-purple-800">
          <Header />
          <main>
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
