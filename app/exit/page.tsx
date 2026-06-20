'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LogOut, 
  Car, 
  User, 
  CheckCircle2, 
  ArrowLeft, 
  Loader2,
  Scan,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

function ExitFormInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const profileId = searchParams.get('p');
  const vehicleNoParam = searchParams.get('v');

  const [loading, setLoading] = useState(!!profileId || !!vehicleNoParam);
  const [success, setSuccess] = useState(false);
  const [exitedData, setExitedData] = useState<any>(null);

  // Auto-Exit Logic
  useEffect(() => {
    if (profileId || vehicleNoParam) {
      const autoExit = async () => {
        try {
          const response = await fetch('/api/exit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              profileId: profileId || undefined,
              vehicleNo: vehicleNoParam || undefined 
            }),
          });
          const data = await response.json();
          if (response.ok) {
            setExitedData({ name: data.name, vehicleNo: data.vehicleNo });
            setSuccess(true);
            toast.success('Exit Processed Successfully!');
            setTimeout(() => router.push('/'), 4000);
          } else {
            toast.error(data.error || 'Exit failed');
            setLoading(false);
          }
        } catch (error) {
          toast.error('System connection error');
          setLoading(false);
        }
      };
      autoExit();
    }
  }, [profileId, vehicleNoParam, router]);

  if (success && exitedData) {
    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-md bg-card/80 border border-border p-10 rounded-[3rem] text-center backdrop-blur-2xl"
        >
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/30">
            <LogOut className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-3xl font-black mb-2">Exit Confirmed</h1>
          <p className="text-neutral-500 mb-8 font-medium">Safe travels from SVSU Campus</p>
          
          <div className="bg-foreground/[0.03] border border-border rounded-3xl p-6 mb-8 text-left">
             <p className="text-neutral-300 text-sm leading-relaxed">
              <span className="font-black text-white text-lg">{exitedData.name}</span> with vehicle <span className="font-black text-[color:var(--accent)] text-lg font-mono">{exitedData.vehicleNo}</span> has been logged out of the active system.
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 text-neutral-500 text-xs font-bold uppercase tracking-widest animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin" />
            Redirecting to home...
          </div>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-neutral-100 p-4 md:p-8 flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-600/10 rounded-full blur-[120px]" />
      
      <div className="z-10 w-full max-w-xl">
        <Link href="/" className="flex items-center gap-2 text-neutral-500 hover:text-red-500 mb-8 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-semibold">Back to Home</span>
        </Link>

        {loading ? (
          <div className="bg-card/80 border border-border p-12 rounded-[2.5rem] text-center flex flex-col items-center backdrop-blur-2xl">
            <Scan className="w-12 h-12 text-red-500 animate-pulse mb-6" />
            <h2 className="text-2xl font-black mb-2">Processing Exit QR</h2>
            <p className="text-neutral-500 text-sm">Validating active entry session...</p>
            <Loader2 className="w-6 h-6 animate-spin mt-8 text-neutral-700" />
          </div>
        ) : (
          <div className="bg-card/80 border border-border p-8 md:p-10 rounded-[2.5rem] backdrop-blur-2xl shadow-2xl">
             <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-red-500/20 rounded-2xl border border-red-500/30">
                <LogOut className="w-8 h-8 text-red-500" />
              </div>
              <div>
                <h2 className="text-2xl font-black">Gate Out</h2>
                <p className="text-neutral-500 text-xs uppercase tracking-widest font-bold">Automatic Exit Registration</p>
              </div>
            </div>

            <div className="text-center py-12 border-2 border-dashed border-border rounded-3xl">
               <Scan className="w-16 h-16 mx-auto text-neutral-800 mb-6" />
               <p className="text-neutral-100 text-lg font-bold mb-2">Scan Exit QR Code</p>
               <p className="text-neutral-500 text-sm px-10">
                 Please scan the QR code located at the EXIT gate to confirm your departure.
               </p>
               
               <div className="mt-8 flex flex-col items-center gap-4">
                 <Link href="/admin" className="px-8 py-4 bg-red-600 hover:bg-red-500 text-white font-black rounded-2xl transition-all shadow-lg shadow-red-600/20 flex items-center gap-2">
                    <Scan className="w-5 h-5" />
                    Open Scanner
                 </Link>
                 <button className="text-neutral-600 text-[10px] font-bold uppercase tracking-widest hover:text-neutral-400">
                   Report Exit Issue
                 </button>
               </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function ExitPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-red-500" />
      </div>
    }>
      <ExitFormInner />
    </Suspense>
  );
}
