'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, Users, User, LayoutDashboard, ArrowRight, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from './ThemeProvider';

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();
  const [userData, setUserData] = useState<{ name: string; role: string; building?: string } | null>(null);
  const [dayWish, setDayWish] = useState('');

  useEffect(() => {
    // Determine dynamic day wish
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const now = new Date();
    const dayName = days[now.getDay()];
    setDayWish(`Good ${dayName}`);

    // Check Auth and User Info
    const checkAuth = async () => {
      // First try student profile
      try {
        const sRes = await fetch('/api/profile');
        if (sRes.ok) {
          const sData = await sRes.json();
          setUserData({ name: sData.name, role: 'student' });
          return;
        }
      } catch (e) {}

      // Then try guard dashboard
      try {
        const gRes = await fetch('/api/dashboard');
        if (gRes.ok) {
          const gData = await gRes.json();
          setUserData({ 
            name: gData.guardName || 'Officer', 
            role: 'guard',
            building: gData.guardBuildingName || 'Global Command'
          });
          return;
        }
      } catch (e) {}

      // Try admin verify
      try {
        const aRes = await fetch('/api/admin/verify');
        if (aRes.ok) {
          setUserData({ name: 'Site Admin', role: 'admin' });
        }
      } catch (e) {}
    };
    checkAuth();

  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 md:p-8 relative pt-28 pb-12 transition-colors duration-500">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-accent/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-accent-blue/10 rounded-full blur-[120px] animate-pulse delay-700" />

      <div className="z-10 text-center max-w-5xl w-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-foreground/5 border border-foreground/10 rounded-full mb-8 backdrop-blur-xl shadow-lg"
        >
          <Shield className="w-4 h-4 text-accent" />
          <span className="text-[10px] font-black uppercase tracking-widest text-foreground/70">
            {dayWish} • {userData?.building ? `Active at ${userData.building}` : (userData ? userData.role : 'Campus Safety')}
          </span>
        </motion.div>

        
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-b from-foreground to-foreground/50 bg-clip-text text-transparent leading-tight drop-shadow-sm">
          {userData ? (
            <>Welcome, <span className="text-accent">{userData.name.split(' ')[0]}</span> <br /> <span className="text-3xl md:text-5xl opacity-80 italic font-medium">I hope you're doing good!</span></>
          ) : (
            <>SVSU Vehicle <br className="hidden sm:block" /> Control Center</>
          )}
        </h1>
        
        <p className="text-foreground/60 text-sm md:text-lg mb-12 leading-relaxed max-w-xl mx-auto font-medium">
          {userData 
            ? `Day by day, we are committed to your safety. Have a wonderful ${new Date().toLocaleDateString('en-US', { weekday: 'long' })}!`
            : 'Automated QR-based entry and exit management for campus vehicles and temporary visitors.'}
        </p>


        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl mx-auto">
          {/* Student Portal Card (Hidden for Guards) */}
          {(!userData || userData.role === 'student') && (
            <Link
              href="/profile"
              className="group flex flex-col items-start p-6 md:p-8 bg-card border border-foreground/10 rounded-[2.5rem] hover:border-accent hover:shadow-[0_20px_50px_rgba(148,137,194,0.3)] transition-all duration-500 backdrop-blur-xl"
            >
              <div className="w-12 h-12 bg-accent/20 rounded-2xl flex items-center justify-center mb-5 text-accent group-hover:scale-110 transition-transform shadow-inner">
                <User className="w-6 h-6" />
              </div>
              <h3 className="text-xl md:text-2xl font-black mb-2 text-foreground">Student Portal</h3>
              <p className="text-foreground/50 text-sm mb-6 leading-relaxed text-left">Register your vehicle and get your permanent QR Gate Pass.</p>
              <div className="mt-auto flex items-center gap-2 text-accent text-xs font-black uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                My Profile <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          )}

          {/* Visitor Card (Hidden for Students) */}
          {(!userData || userData.role !== 'student') && (
            <Link
              href="/visitor-entry"
              className="group flex flex-col items-start p-6 md:p-8 bg-accent-blue/10 border border-accent-blue/20 rounded-[2.5rem] hover:border-accent-blue hover:shadow-[0_20px_50px_rgba(119,181,214,0.3)] transition-all duration-500 backdrop-blur-xl"
            >
              <div className="w-12 h-12 bg-accent-blue/20 rounded-2xl flex items-center justify-center mb-5 text-accent-blue group-hover:scale-110 transition-transform shadow-inner">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl md:text-2xl font-black mb-2 text-foreground">Guest Access</h3>
              <p className="text-foreground/50 text-sm mb-6 leading-relaxed text-left">For guests, admission queries, and official campus visits.</p>
              <div className="mt-auto flex items-center gap-2 text-accent-blue text-xs font-black uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                Visitor Form <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          )}


          {/* Security Hub Card (Hidden for Students) */}
          {(!userData || userData.role !== 'student') && (
            <Link
              href="/admin"
              className="group flex flex-col items-start p-6 md:p-8 bg-accent/10 border border-accent/20 rounded-[2.5rem] hover:border-accent hover:shadow-[0_20px_50px_rgba(148,137,194,0.3)] transition-all duration-500 backdrop-blur-xl sm:col-span-2 lg:col-span-1"
            >
              <div className="w-12 h-12 bg-accent/20 rounded-2xl flex items-center justify-center mb-5 text-accent group-hover:scale-110 transition-transform shadow-inner">
                <LayoutDashboard className="w-6 h-6" />
              </div>
              <h3 className="text-xl md:text-2xl font-black mb-2 text-foreground">Security Hub</h3>
              <p className="text-foreground/50 text-sm mb-6 leading-relaxed text-left">Gate control and live monitoring for security personnel.</p>
              <div className="mt-auto flex items-center gap-2 text-accent text-xs font-black uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                Open Dashboard <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-20 text-foreground/40 text-[10px] font-black uppercase tracking-[0.3em] z-10 flex flex-col items-center gap-4">
        <div className="flex items-center gap-6 opacity-60">
           <span className="hover:text-accent cursor-pointer transition-colors">Safety</span>
           <span className="w-1 h-1 bg-foreground/20 rounded-full" />
           <span className="hover:text-accent cursor-pointer transition-colors">Security</span>
           <span className="w-1 h-1 bg-foreground/20 rounded-full" />
           <span className="hover:text-accent cursor-pointer transition-colors">Efficiency</span>
        </div>
        &copy; 2026 SVSU Security &bull; Engineered for Safety
      </div>
    </main>
  );
}

