import Link from 'next/link';
import { Shield, Car, Users, User, LayoutDashboard, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0c] text-neutral-100 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse delay-700" />

      <div className="z-10 text-center max-w-3xl">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900/50 border border-neutral-800 rounded-full mb-8 backdrop-blur-md">
          <Shield className="w-4 h-4 text-accent" />
          <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">Security Management System</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8 bg-gradient-to-r from-white via-neutral-200 to-neutral-500 bg-clip-text text-transparent leading-[1.1]">
          SVSU Vehicle <br /> Control Center
        </h1>
        
        <p className="text-neutral-400 text-lg md:text-xl mb-12 leading-relaxed max-w-xl mx-auto">
          Automated QR-based entry and exit management for campus vehicles and temporary visitors.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Link
            href="/profile"
            className="group flex flex-col items-start p-8 bg-neutral-950 border border-neutral-800 rounded-[2.5rem] hover:border-blue-500/40 hover:bg-blue-500/5 transition-all shadow-xl"
          >
            <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 text-blue-500 group-hover:scale-110 transition-transform">
              <User className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-black mb-2">Student Portal</h3>
            <p className="text-neutral-500 text-sm mb-6 leading-relaxed">Register your vehicle and get your permanent QR Gate Pass.</p>
            <div className="mt-auto flex items-center gap-2 text-blue-500 text-sm font-black uppercase tracking-widest">
              My Profile <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          <Link
            href="/visitor-entry"
            className="group flex flex-col items-start p-8 bg-neutral-950 border border-neutral-800 rounded-[2.5rem] hover:border-purple-500/40 hover:bg-purple-500/5 transition-all shadow-xl"
          >
            <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 text-purple-500 group-hover:scale-110 transition-transform">
              <Users className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-black mb-2">Temporary Entry</h3>
            <p className="text-neutral-500 text-sm mb-6 leading-relaxed">For guests, admission queries, and official campus visits.</p>
            <div className="mt-auto flex items-center gap-2 text-purple-500 text-sm font-black uppercase tracking-widest">
              Visitor Form <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          <Link
            href="/admin"
            className="group flex flex-col items-start p-8 bg-neutral-900/50 border border-neutral-800 rounded-[2.5rem] hover:border-accent/40 hover:bg-accent/5 transition-all shadow-xl"
          >
            <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center mb-6 text-accent group-hover:scale-110 transition-transform">
              <LayoutDashboard className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-black mb-2">Security Hub</h3>
            <p className="text-neutral-500 text-sm mb-6 leading-relaxed">Gate control and live monitoring for security personnel.</p>
            <div className="mt-auto flex items-center gap-2 text-accent text-sm font-black uppercase tracking-widest">
              Open Dashboard <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        </div>

      </div>

      {/* Footer */}
      <div className="mt-20 text-neutral-600 text-[10px] font-bold uppercase tracking-[0.2em]">
        &copy; 2026 SVSU Security &bull; Engineered for Safety
      </div>
    </main>
  );
}

