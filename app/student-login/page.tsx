'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, User, Lock, Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import MathCaptcha from '@/components/MathCaptcha';

export default function StudentLoginPage() {
  const [formData, setFormData] = useState({ rollNo: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/student/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Access Granted');
        router.push('/student/dashboard');
      } else {
        toast.error(data.error || 'Login failed');
      }
    } catch (err) {
      toast.error('System error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0c] text-neutral-100 flex flex-col items-center pt-28 pb-10 px-4 md:px-8 relative">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-neutral-900/40 border border-neutral-800 p-6 md:p-8 rounded-[2rem] backdrop-blur-2xl shadow-2xl my-auto"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="p-4 bg-accent/20 rounded-2xl border border-accent/30 mb-4">
            <Shield className="w-10 h-10 text-accent" />
          </div>
          <h1 className="text-3xl font-black mb-2">Student Login</h1>
          <p className="text-neutral-500 text-sm font-medium">Verify your identity to access Gate Pass</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Roll Number</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                required
                value={formData.rollNo}
                onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                placeholder="2100..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl pl-12 pr-4 py-3 md:py-4 focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between ml-1">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Secure Password</label>
              <Link href="/forgot-password" className="text-[10px] font-bold text-accent hover:text-accent/80 uppercase tracking-widest transition-colors">
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                required
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl pl-12 pr-12 py-3 md:py-4 focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-neutral-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <MathCaptcha onVerify={setIsCaptchaVerified} />

          <button
            disabled={loading || !isCaptchaVerified}
            type="submit"
            className="w-full bg-accent hover:opacity-90 text-white font-bold py-3 md:py-4 rounded-2xl shadow-xl shadow-accent/20 flex items-center justify-center gap-2 transition-all mt-4 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
            {loading ? 'Verifying...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-neutral-500 text-xs">
            Don't have a profile yet?{' '}
            <button onClick={() => router.push('/profile?new=true')} className="text-accent font-bold hover:underline">Register Now</button>
          </p>
        </div>
      </motion.div>
    </main>
  );
}
