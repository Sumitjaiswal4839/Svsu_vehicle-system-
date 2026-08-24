'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Car, 
  User, 
  CheckCircle2, 
  ArrowLeft, 
  Loader2,
  AlertCircle,
  Scan
} from 'lucide-react';
import { toast } from 'sonner';

function EntryFormInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const profileId = searchParams.get('p');
  const vehicleNoParam = searchParams.get('v');

  const [loading, setLoading] = useState(!!profileId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);

  // Auto-Entry Logic for Students with QR
  useEffect(() => {
    if (profileId) {
      const autoRegister = async () => {
        try {
          const idempotencyKey = crypto.randomUUID();
          const response = await fetch('/api/entry', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Idempotency-Key': idempotencyKey 
            },
            body: JSON.stringify({ profileId }),
          });
          const data = await response.json();
          if (response.ok) {
            window.history.replaceState(null, '', '/');
            setProfileData(data.entry.profile);
            setSuccess(true);
            toast.success('Automatic Entry Registered!');
            // Redirect to home after 3 seconds
            setTimeout(() => router.push('/'), 3000);
          } else {
            if (response.status === 401) {
              toast.error('Please open this scan from inside the SVSU Security app while logged in — not your phone\'s camera app.');
            } else {
              toast.error(data.error || 'Auto-entry failed');
            }
            setLoading(false);
          }
        } catch (error) {
          toast.error('System connection error');
          setLoading(false);
        }
      };
      autoRegister();
    }
  }, [profileId, router]);

  if (success && profileData) {
    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-md bg-card/80 border border-border p-10 rounded-[3rem] text-center backdrop-blur-2xl"
        >
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/30">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-3xl font-black mb-2">Entry Verified</h1>
          <p className="text-neutral-500 mb-8 font-medium">Welcome back to SVSU Campus</p>
          
          <div className="bg-foreground/[0.03] border border-border rounded-3xl p-6 mb-8 text-left">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center text-[color:var(--accent)]">
                <User className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-widest">Student</p>
                <p className="font-bold text-lg">{profileData.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-500">
                <Car className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-widest">Vehicle</p>
                <p className="font-bold text-lg font-mono">{profileData.vehicleNo}</p>
              </div>
            </div>
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
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
      
      <div className="z-10 w-full max-w-xl">
        <Link href="/" className="flex items-center gap-2 text-neutral-500 hover:text-[color:var(--accent)] mb-8 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-semibold">Back to Home</span>
        </Link>

        {loading ? (
          <div className="bg-card/80 border border-border p-12 rounded-[2.5rem] text-center flex flex-col items-center backdrop-blur-2xl">
            <Scan className="w-12 h-12 text-[color:var(--accent)] animate-pulse mb-6" />
            <h2 className="text-2xl font-black mb-2">Verifying QR Pass</h2>
            <p className="text-neutral-500 text-sm">Please wait while we sync with SVSU security...</p>
            <Loader2 className="w-6 h-6 animate-spin mt-8 text-neutral-700" />
          </div>
        ) : (
          <div className="bg-card/80 border border-border p-8 md:p-10 rounded-[2.5rem] backdrop-blur-2xl shadow-2xl">
             <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-accent/20 rounded-2xl border border-accent/30 shadow-[0_0_20px_rgba(37,99,235,0.2)]">
                <Shield className="w-8 h-8 text-[color:var(--accent)]" />
              </div>
              <div>
                <h2 className="text-2xl font-black">Manual Entry</h2>
                <p className="text-neutral-500 text-xs uppercase tracking-widest font-bold">For Unregistered Vehicles</p>
              </div>
            </div>



            <div className="text-center py-10 border-2 border-dashed border-border rounded-3xl">
               <p className="text-neutral-600 text-sm font-bold uppercase tracking-widest mb-2">QR Scan Required</p>
               <p className="text-neutral-500 text-xs px-10">Manual entry is disabled. Please scan the gate QR code or show your Student Pass to the guard.</p>
               <Link href="/admin" className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-neutral-800 hover:bg-neutral-700 rounded-xl text-sm font-bold transition-all">
                  <Scan className="w-4 h-4" />
                  Open Scanner
               </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function EntryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[color:var(--accent)]" />
      </div>
    }>
      <EntryFormInner />
    </Suspense>
  );
}
