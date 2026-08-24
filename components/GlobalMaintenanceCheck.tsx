'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Wrench } from 'lucide-react';
import { motion } from 'framer-motion';

export default function GlobalMaintenanceCheck({ children }: { children: React.ReactNode }) {
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    // Admins and API routes bypass the client-side maintenance block
    if (pathname.startsWith('/admin') || pathname.startsWith('/api')) {
      setLoading(false);
      return;
    }

    const checkMaintenance = async () => {
      try {
        const res = await fetch('/api/maintenance');
        if (res.ok) {
          const data = await res.json();
          setIsMaintenance(data.maintenanceMode);
        }
      } catch (err) {
        console.error('Failed to check maintenance status', err);
      } finally {
        setLoading(false);
      }
    };

    checkMaintenance();
    // Poll every 30 seconds
    const interval = setInterval(checkMaintenance, 30000);
    return () => clearInterval(interval);
  }, [pathname]);

  if (loading) {
    return <div className="min-h-screen bg-background" />; // blank white/dark while checking
  }

  if (isMaintenance) {
    return (
      <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-8 relative overflow-hidden">
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(239,68,68,0.15),transparent_50%)] pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="z-10 flex flex-col items-center text-center max-w-lg"
        >
          <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mb-8 border border-red-500/30 shadow-[0_0_40px_rgba(239,68,68,0.3)]">
            <Wrench className="w-12 h-12 text-red-500" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black mb-4">System Under Maintenance</h1>
          <p className="text-lg text-neutral-400 mb-8 leading-relaxed">
            The SVSU Control Center is currently undergoing scheduled maintenance to improve reliability and security. 
            We'll be back online shortly.
          </p>
          
          <div className="inline-block px-6 py-3 bg-card border border-border rounded-xl text-sm font-bold shadow-lg">
            Thank you for your patience!
          </div>
        </motion.div>
      </main>
    );
  }

  return <>{children}</>;
}
