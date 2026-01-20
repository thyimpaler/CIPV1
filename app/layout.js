import './globals.css'

export const metadata = {
  title: 'CryptoIntel Pro - Private Market Intelligence Dashboard',
  description: 'High-performance crypto intelligence dashboard for tracking ATH performers with probability scoring and real-time market data.',
  keywords: 'crypto, trading, dashboard, binance, market intelligence, ATH',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
