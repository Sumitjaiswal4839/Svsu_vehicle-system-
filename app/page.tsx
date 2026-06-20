'use client';

import dynamic from 'next/dynamic';

const LandingPage = dynamic(() => import('@/components/LandingPage'), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-background" />
});

export default function Home() {
  return <LandingPage />;
}
