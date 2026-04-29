'use client';

import Link from 'next/link';
import { Shield, Users, User, LayoutDashboard, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0c] text-neutral-100 flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden pt-24 md:pt-32">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse delay-700" />

      <div className="z-10 text-center max-w-5xl w-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900/50 border border-neutral-800 rounded-full mb-8 backdrop-blur-md"
        >
          <Shield className="w-4 h-4 text-accent" />
          <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Security Management System</span>
        </motion.div>
        
        <h1 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter mb-8 bg-gradient-to-r from-white via-neutral-200 to-neutral-500 bg-clip-text text-transparent leading-[0.9]">
          SVSU Vehicle <br className="hidden sm:block" /> Control Center
        </h1>
        
        <p className="text-neutral-400 text-base md:text-xl mb-12 leading-relaxed max-w-2xl mx-auto font-medium">
          Automated QR-based entry and exit management for campus vehicles and temporary visitors.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          <Link
            href="/profile"
            className="group flex flex-col items-start p-8 bg-neutral-950/50 border border-neutral-800 rounded-[2.5rem] hover:border-blue-500/40 hover:bg-blue-500/5 transition-all shadow-xl backdrop-blur-sm"
          >
            <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 text-blue-500 group-hover:scale-110 transition-transform">
              <User className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-black mb-2 text-left">Student Portal</h3>
            <p className="text-neutral-500 text-sm mb-6 leading-relaxed text-left">Register your vehicle and get your permanent QR Gate Pass.</p>
            <div className="mt-auto flex items-center gap-2 text-blue-500 text-sm font-black uppercase tracking-widest">
              My Profile <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          <Link
            href="/visitor-entry"
            className="group flex flex-col items-start p-8 bg-neutral-950/50 border border-neutral-800 rounded-[2.5rem] hover:border-purple-500/40 hover:bg-purple-500/5 transition-all shadow-xl backdrop-blur-sm"
          >
            <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 text-purple-500 group-hover:scale-110 transition-transform">
              <Users className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-black mb-2 text-left">Temporary Entry</h3>
            <p className="text-neutral-500 text-sm mb-6 leading-relaxed text-left">For guests, admission queries, and official campus visits.</p>
            <div className="mt-auto flex items-center gap-2 text-purple-500 text-sm font-black uppercase tracking-widest">
              Visitor Form <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          <Link
            href="/admin"
            className="group flex flex-col items-start p-8 bg-neutral-900/50 border border-neutral-800 rounded-[2.5rem] hover:border-accent/40 hover:bg-accent/5 transition-all shadow-xl backdrop-blur-sm sm:col-span-2 lg:col-span-1"
          >
            <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center mb-6 text-accent group-hover:scale-110 transition-transform">
              <LayoutDashboard className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-black mb-2 text-left">Security Hub</h3>
            <p className="text-neutral-500 text-sm mb-6 leading-relaxed text-left">Gate control and live monitoring for security personnel.</p>
            <div className="mt-auto flex items-center gap-2 text-accent text-sm font-black uppercase tracking-widest">
              Open Dashboard <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-20 text-neutral-600 text-[10px] font-bold uppercase tracking-[0.2em] z-10">
        &copy; 2026 SVSU Security &bull; Engineered for Safety
      </div>
    </main>
  );
}
