'use client';

import { Shield } from 'lucide-react';

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative group">
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-accent/30 rounded-xl blur-lg group-hover:bg-accent/50 transition-all" />
        
        {/* Main Icon Box */}
        <div className="relative p-2.5 bg-gradient-to-br from-accent to-[#1e1b4b] rounded-xl border border-white/20 shadow-xl">
          <Shield className="w-5 h-5 text-amber-400" />
          
          {/* Car Silhouette Detail */}
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-md flex items-center justify-center shadow-lg border border-accent/20">
             <div className="w-2.5 h-1 bg-amber-500 rounded-full" />
          </div>
        </div>
      </div>
      
      <div className="flex flex-col -space-y-1">
        <span className="text-sm font-black tracking-tighter text-white uppercase italic">SVSU</span>
        <span className="text-[8px] font-bold text-neutral-500 uppercase tracking-[0.2em]">Security</span>
      </div>
    </div>
  );
}
