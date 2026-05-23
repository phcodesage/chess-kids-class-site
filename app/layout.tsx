import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { LenisProvider } from './lenis-provider';
import 'lenis/dist/lenis.css';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Chess Kids Class',
  description:
    'Join our chess program where kids learn to think critically and develop problem-solving skills, all while having fun and making friends!',
  icons: {
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <LenisProvider />
        {children}
      </body>
    </html>
  );
}
