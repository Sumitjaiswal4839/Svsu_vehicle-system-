'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Car, Lock, CheckCircle2, ArrowLeft, Loader2, KeyRound, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import MathCaptcha from '@/components/MathCaptcha';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<'verify' | 'success'>('verify');
  const [loading, setLoading] = useState(false);
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [showConfirm, setShowConfirm] = useState(false);
  const [studentName, setStudentName] = useState('');

  const [formData, setFormData] = useState({
    rollNo: '',
    vehicleNo: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }
    if (formData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/student/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rollNo: formData.rollNo,
          vehicleNo: formData.vehicleNo,
          newPassword: formData.newPassword,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setStudentName(data.name);
        setStep('success');
        toast.success('Password reset successfully!');
      } else {
        toast.error(data.error || 'Verification failed');
      }
    } catch (err) {
      toast.error('Connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center pt-28 pb-10 px-4 md:px-8 relative overflow-x-hidden overflow-y-auto">
      {/* Background glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-orange-600/10 rounded-full blur-[150px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-blue-600/8 rounded-full blur-[150px]" />

      <div className="z-10 w-full max-w-md">
        <Link href="/student-login" className="flex items-center gap-2 text-neutral-500 hover:text-neutral-300 mb-8 transition-colors group w-fit">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-semibold">Back to Login</span>
        </Link>

        {step === 'verify' ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card/80 border border-border p-6 md:p-8 rounded-[2rem] backdrop-blur-2xl shadow-2xl my-auto"
          >
            {/* Header */}
            <div className="flex flex-col items-center mb-10">
              <div className="p-4 bg-orange-500/20 rounded-2xl border border-orange-500/30 mb-6 shadow-[0_0_30px_rgba(249,115,22,0.15)]">
                <KeyRound className="w-10 h-10 text-orange-400" />
              </div>
              <h1 className="text-3xl font-black mb-2">Forgot Password?</h1>
              <p className="text-neutral-500 text-sm text-center leading-relaxed">
                Verify your identity using your<br />
                <span className="text-neutral-300 font-semibold">Roll Number</span> and <span className="text-neutral-300 font-semibold">Vehicle Number</span>.
              </p>
            </div>

            {/* Info badge */}
            <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl mb-8">
              <Shield className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-200/70 leading-relaxed">
                We use your <strong className="text-blue-300">vehicle number</strong> as a second verification step — only the real owner would know this.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Roll Number */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Roll Number</label>
                <div className="relative">
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <input
                    required
                    value={formData.rollNo}
                    onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                    placeholder="e.g. 23UGBCE09165"
                    className="w-full bg-background border border-border rounded-2xl pl-12 pr-4 py-3 md:py-4 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/40 transition-all"
                  />
                </div>
              </div>

              {/* Vehicle Number */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Vehicle Number</label>
                <div className="relative">
                  <Car className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <input
                    required
                    value={formData.vehicleNo}
                    onChange={(e) => setFormData({ ...formData, vehicleNo: e.target.value })}
                    placeholder="e.g. HR 30 T 9321"
                    className="w-full bg-background border border-border rounded-2xl pl-12 pr-4 py-3 md:py-4 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/40 transition-all uppercase font-mono font-bold tracking-wider"
                  />
                </div>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 py-2">
                <div className="h-px flex-1 bg-neutral-800" />
                <span className="text-[10px] text-neutral-600 font-bold uppercase tracking-widest">Set New Password</span>
                <div className="h-px flex-1 bg-neutral-800" />
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <input
                    required
                    type={showPassword ? 'text' : 'password'}
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    placeholder="Minimum 6 characters"
                    className="w-full bg-background border border-border rounded-2xl pl-12 pr-12 py-3 md:py-4 focus:outline-none focus:ring-2 focus:ring-orange-500/40 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-neutral-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <input
                    required
                    type={showConfirm ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Re-enter new password"
                    className={`w-full bg-background border rounded-2xl pl-12 pr-12 py-3 md:py-4 focus:outline-none focus:ring-2 transition-all ${
                      formData.confirmPassword && formData.newPassword !== formData.confirmPassword
                        ? 'border-red-500/50 focus:ring-red-500/30'
                        : formData.confirmPassword && formData.newPassword === formData.confirmPassword
                        ? 'border-green-500/50 focus:ring-green-500/30'
                        : 'border-border focus:ring-orange-500/40'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-neutral-300 transition-colors"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                  <p className="text-red-400 text-xs ml-1">Passwords do not match</p>
                )}
              </div>

              <MathCaptcha onVerify={setIsCaptchaVerified} />

              <button
                disabled={loading || !isCaptchaVerified}
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-400 text-white font-bold py-3 md:py-4 rounded-2xl shadow-xl shadow-orange-500/20 flex items-center justify-center gap-2 transition-all mt-6 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
              >
                {loading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Verifying...</>
                ) : (
                  <><KeyRound className="w-5 h-5" /> Reset Password</>
                )}
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md bg-card/80 border border-border p-6 md:p-8 rounded-[2rem] backdrop-blur-2xl shadow-2xl relative z-10 my-auto"
          >
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.15)]">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="text-3xl font-black mb-2">Password Reset!</h1>
            <p className="text-neutral-400 mb-8">
              {studentName && <><span className="font-bold text-white">{studentName}</span>, your </>}
              password has been updated successfully.
            </p>

            <button
              onClick={() => router.push('/student-login')}
              className="w-full bg-accent hover:opacity-90 text-white font-bold py-3 md:py-4 rounded-2xl shadow-xl shadow-accent/20 flex items-center justify-center gap-2 transition-all"
            >
              <Shield className="w-5 h-5" />
              Go to Login
            </button>
          </motion.div>
        )}
      </div>
    </main>
  );
}
