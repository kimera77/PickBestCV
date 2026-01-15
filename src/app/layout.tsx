import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/lib/auth/auth-provider';
import { ReactQueryProvider } from '@/lib/react-query/provider';

const inter = Inter({ subsets: ['latin'], variable: '--font-body' });

export const metadata: Metadata = {
  title: 'PickbestCV',
  description: 'Análisis de CV con IA para una contratación inteligente',
  icons: {
    icon: [
      { url: '/icon_pickbestcv.png' },
      { url: '/icon_pickbestcv.png', sizes: '16x16', type: 'image/png' },
      { url: '/icon_pickbestcv.png', sizes: '32x32', type: 'image/png' },
    ],
    shortcut: '/icon_pickbestcv.png',
    apple: '/icon_pickbestcv.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap" rel="stylesheet" />
      </head>
      <body className={`${inter.variable} font-body antialiased`}>
        <ReactQueryProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ReactQueryProvider>
        <Toaster />
      </body>
    </html>
  );
}
