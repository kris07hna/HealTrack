import type { AppProps } from 'next/app';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import '@/styles/globals.css';
import { AuthProvider } from '@/lib/auth';
import { NotificationProvider } from '@/lib/notifications';

export default function App({ Component, pageProps }: AppProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <>
      <Head>
        <title>HealTrack - Health & Symptom Tracker</title>
        <meta name="description" content="Track your health symptoms and monitor your wellness journey" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0ea5e9" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </Head>
      <AuthProvider>
        <NotificationProvider>
          <div className="min-h-screen bg-gray-50">
            <Component {...pageProps} />
          </div>
        </NotificationProvider>
      </AuthProvider>
    </>
  );
}
