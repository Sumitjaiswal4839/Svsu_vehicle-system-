'use client';

import dynamic from 'next/dynamic';

const LandingPage = dynamic(() => import('@/components/LandingPage'), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-[#0a0a0c]" />
});

export default function Home() {
  return <LandingPage />;
}
