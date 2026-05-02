'use client';

import Link from 'next/link';
import { Shield, Users, User, LayoutDashboard, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0c] text-neutral-100 flex flex-col items-center justify-center p-4 md:p-8 relative pt-28 pb-12">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#373380]/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-amber-500/10 rounded-full blur-[120px] animate-pulse delay-700" />

      <div className="z-10 text-center max-w-5xl w-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/[0.03] border border-white/10 rounded-full mb-8 backdrop-blur-xl shadow-lg"
        >
          <Shield className="w-4 h-4 text-amber-500" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-300">Security Management System</span>
        </motion.div>
        
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-b from-white to-[#c8a153] bg-clip-text text-transparent leading-tight drop-shadow-sm">
          SVSU Vehicle <br className="hidden sm:block" /> Control Center
        </h1>
        
        <p className="text-neutral-400 text-sm md:text-lg mb-12 leading-relaxed max-w-xl mx-auto font-normal">
          Automated QR-based entry and exit management for campus vehicles and temporary visitors.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          <Link
            href="/profile"
            className="group flex flex-col items-start p-6 md:p-8 bg-white/[0.02] border border-white/5 rounded-3xl hover:border-[#5e59b3]/40 hover:bg-[#5e59b3]/10 hover:shadow-[0_0_30px_rgba(94,89,179,0.15)] transition-all duration-300 backdrop-blur-xl"
          >
            <div className="w-12 h-12 bg-[#5e59b3]/20 rounded-2xl flex items-center justify-center mb-5 text-[#8682d6] group-hover:scale-110 transition-transform">
              <User className="w-6 h-6" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold mb-2 text-white">Student Portal</h3>
            <p className="text-neutral-400 text-sm mb-6 leading-relaxed">Register your vehicle and get your permanent QR Gate Pass.</p>
            <div className="mt-auto flex items-center gap-2 text-[#8682d6] text-xs font-bold uppercase tracking-widest group-hover:text-white transition-colors">
              My Profile <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          <Link
            href="/visitor-entry"
            className="group flex flex-col items-start p-6 md:p-8 bg-white/[0.02] border border-white/5 rounded-3xl hover:border-amber-500/40 hover:bg-amber-500/5 hover:shadow-[0_0_30px_rgba(245,158,11,0.1)] transition-all duration-300 backdrop-blur-xl"
          >
            <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-5 text-amber-500 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold mb-2 text-white">Temporary Entry</h3>
            <p className="text-neutral-400 text-sm mb-6 leading-relaxed">For guests, admission queries, and official campus visits.</p>
            <div className="mt-auto flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-widest group-hover:text-amber-300 transition-colors">
              Visitor Form <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          <Link
            href="/admin"
            className="group flex flex-col items-start p-6 md:p-8 bg-white/[0.02] border border-white/5 rounded-3xl hover:border-accent/40 hover:bg-accent/10 hover:shadow-[0_0_30px_rgba(94,89,179,0.15)] transition-all duration-300 backdrop-blur-xl sm:col-span-2 lg:col-span-1"
          >
            <div className="w-12 h-12 bg-accent/20 rounded-2xl flex items-center justify-center mb-5 text-accent group-hover:scale-110 transition-transform">
              <LayoutDashboard className="w-6 h-6" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold mb-2 text-white">Security Hub</h3>
            <p className="text-neutral-400 text-sm mb-6 leading-relaxed">Gate control and live monitoring for security personnel.</p>
            <div className="mt-auto flex items-center gap-2 text-accent text-xs font-bold uppercase tracking-widest group-hover:text-white transition-colors">
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
