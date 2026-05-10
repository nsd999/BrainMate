import './globals.css';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import { Analytics } from '@vercel/analytics/next';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata = {
  title: 'BrainMate — Understand anything. Take action.',
  description:
    'An AI-powered clarity and learning assistant. Explain any topic simply and get a step-by-step action plan.',
  verification: {
    google: 'Q_c5lgpKooBnciSI9o-QxNADGa1sVXHAg6aiwJiX_fo',
  },
};

// Inline theme bootstrap to prevent flash of incorrect theme on load.
const themeBootstrap = `
(function(){
  try {
    var t = localStorage.getItem('brainmate.theme');
    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    var dark = t ? t === 'dark' : prefersDark;
    if (dark) document.documentElement.classList.add('dark');
  } catch(e){}
})();
`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body className="min-h-screen ...">
        {children}
        <Toaster position="top-center" />
        <Analytics />
      </body>
    </html>
  );
}
