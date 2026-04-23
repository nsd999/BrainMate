import './globals.css';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
});

export const metadata = {
  title: 'BrainMate — Understand anything. Take action.',
  description:
    'An AI-powered clarity and learning assistant. Explain any topic simply and get a step-by-step action plan.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-[#F8F9FB] text-[#0B0B0F] antialiased font-sans">
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
