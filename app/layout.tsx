import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Gaze Protocol — Your attention is already valuable.',
  description:
    'Gaze is an attention rewards protocol on Solana. Watch creators, earn rewards, stake tokens. Your attention is already valuable — now you get to keep it.',
  keywords: [
    'Gaze Protocol',
    'attention rewards',
    'Solana',
    'creator tokens',
    'bonding curve',
    'watch to earn',
    'DeFi',
  ],
  openGraph: {
    title: 'Gaze Protocol — Your attention is already valuable.',
    description:
      'Watch creators, earn rewards, stake tokens. An attention rewards protocol on Solana.',
    url: 'https://gazeprotocol.com',
    siteName: 'Gaze Protocol',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gaze Protocol',
    description: 'Your attention is already valuable. Now you get to keep it.',
    site: '@gazeprotocol',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#131313',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
