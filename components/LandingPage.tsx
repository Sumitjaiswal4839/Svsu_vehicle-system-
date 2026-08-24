'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, Users, LayoutDashboard, ArrowRight, Sparkles, Lock, Smartphone, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from './ThemeProvider';
import FeedbackModal from './FeedbackModal';

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [userData, setUserData] = useState<{ name: string; role: string; building?: string } | null>(null);
  const [dayWish, setDayWish] = useState('');

  useEffect(() => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const now = new Date();
    setDayWish(`Good ${days[now.getDay()]}`);

    const checkAuth = async () => {
      try {
        const sRes = await fetch('/api/profile');
        if (sRes.ok) {
          const sData = await sRes.json();
          setUserData({ name: sData.name, role: 'student' });
          return;
        }
      } catch (e) { }

      try {
        const gRes = await fetch('/api/dashboard');
        if (gRes.ok) {
          const gData = await gRes.json();
          setUserData({
            name: gData.guardName || 'Officer',
            role: 'guard',
            building: gData.guardBuildingName || 'Global Command',
          });
          return;
        }
      } catch (e) { }
    };
    checkAuth();
  }, []);

  const cards = [
    {
      href: '/visitor-entry',
      icon: <Users className="w-6 h-6" />,
      title: 'Guest Access',
      desc: 'For guests, admission queries, and official campus visits.',
      cta: 'Visitor Form',
      gradient: 'from-sky-500/20 to-cyan-500/10',
      border: 'border-sky-500/30 hover:border-sky-400',
      iconBg: 'bg-sky-500/20 text-sky-400',
      ctaColor: 'text-sky-400',
      glow: 'hover:shadow-[0_20px_60px_rgba(14,165,233,0.25)]',
    },
    {
      href: '/admin',
      icon: <LayoutDashboard className="w-6 h-6" />,
      title: 'Security Hub',
      desc: 'Gate control and live monitoring for security personnel.',
      cta: 'Open Dashboard',
      gradient: 'from-violet-500/20 to-purple-500/10',
      border: 'border-violet-500/30 hover:border-violet-400',
      iconBg: 'bg-violet-500/20 text-violet-400',
      ctaColor: 'text-violet-400',
      glow: 'hover:shadow-[0_20px_60px_rgba(139,92,246,0.25)]',
      span: true,
    },
  ];

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 pt-28 pb-16 relative overflow-hidden transition-colors duration-500"
      style={{ background: 'var(--background)', color: 'var(--foreground)' }}
    >
      {/* Gradient mesh background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-20%] left-[-15%] w-[55%] h-[55%] rounded-full blur-[130px] opacity-60"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.35) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[130px] opacity-50"
          style={{ background: 'radial-gradient(circle, rgba(14,165,233,0.3) 0%, transparent 70%)' }} />
        <div className="absolute top-[40%] left-[40%] w-[30%] h-[30%] rounded-full blur-[100px] opacity-30"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 70%)' }} />
      </div>

      {/* Watermark */}
      <div className="watermark" />

      <div className="z-10 text-center max-w-5xl w-full">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full mb-8 backdrop-blur-xl border text-xs font-bold uppercase tracking-widest"
          style={{
            background: 'rgba(99,102,241,0.1)',
            borderColor: 'rgba(99,102,241,0.3)',
            color: 'rgba(165,180,252,1)',
          }}
        >
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          {dayWish} &bull; {userData?.building ? `Active at ${userData.building}` : userData ? userData.role : 'Campus Safety System'}
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight"
        >
          {userData ? (
            <>
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-sky-400 bg-clip-text text-transparent">
                Welcome, {userData.name.split(' ')[0]}
              </span>
              <br />
              <span className="text-2xl md:text-4xl font-medium opacity-60 italic">
                Stay safe, stay secure.
              </span>
            </>
          ) : (
            <>
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-sky-400 bg-clip-text text-transparent">
                SVSU Campus
              </span>
              <br />
              <span style={{ color: 'var(--foreground)', opacity: 0.85 }}>
                Control Center
              </span>
            </>
          )}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-sm md:text-lg mb-14 leading-relaxed max-w-xl mx-auto font-medium"
          style={{ color: 'var(--foreground)', opacity: 0.55 }}
        >
          {userData
            ? `Day by day, we are committed to your safety. Have a wonderful ${new Date().toLocaleDateString('en-US', { weekday: 'long' })}!`
            : 'Automated QR-Based Entry and Exit Management Systen for Students and Temporary Visitors.'}
        </motion.p>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full max-w-4xl mx-auto">
          {cards.map((card, i) => (
            <motion.div
              key={card.href}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 * (i + 1) }}
              className={card.span ? 'sm:col-span-2 lg:col-span-1' : ''}
            >
              <Link
                href={card.href}
                className={`group flex flex-col items-start p-7 md:p-8 rounded-[2rem] border backdrop-blur-xl transition-all duration-400 bg-gradient-to-br ${card.gradient} ${card.border} ${card.glow} h-full`}
                style={{ background: `linear-gradient(135deg, var(--card) 0%, var(--card) 100%)` }}
              >
                {/* Icon */}
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${card.iconBg} group-hover:scale-110 transition-transform duration-300`}>
                  {card.icon}
                </div>

                {/* Text */}
                <h3 className="text-xl md:text-2xl font-black mb-2" style={{ color: 'var(--foreground)' }}>
                  {card.title}
                </h3>
                <p className="text-sm mb-6 leading-relaxed text-left" style={{ color: 'var(--foreground)', opacity: 0.5 }}>
                  {card.desc}
                </p>

                {/* CTA */}
                <div className={`mt-auto flex items-center gap-2 text-xs font-black uppercase tracking-widest ${card.ctaColor} group-hover:translate-x-2 transition-transform duration-300`}>
                  {card.cta} <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            </motion.div>
          ))}

          {/* Custom Student App Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45 }}
            className="sm:col-span-2 lg:col-span-1"
          >
            <div
              className={`group flex flex-col items-start p-7 md:p-8 rounded-[2rem] border backdrop-blur-xl transition-all duration-400 bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border-emerald-500/30 hover:border-emerald-400 hover:shadow-[0_20px_60px_rgba(16,185,129,0.25)] h-full`}
              style={{ background: `linear-gradient(135deg, var(--card) 0%, var(--card) 100%)` }}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 bg-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform duration-300`}>
                <Smartphone className="w-6 h-6" />
              </div>

              <h3 className="text-xl md:text-2xl font-black mb-2" style={{ color: 'var(--foreground)' }}>
                Student App
              </h3>
              <p className="text-sm mb-6 leading-relaxed text-left" style={{ color: 'var(--foreground)', opacity: 0.5 }}>
                Download the official mobile app for QR entry, profile management, and more.
              </p>

              <div className="mt-auto flex flex-col gap-3 w-full">
                <a
                  href="/api/download?platform=ANDROID"
                  className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                >
                  <Download className="w-4 h-4" /> Android (APK)
                </a>
                <a
                  href="/api/download?platform=IOS"
                  className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                >
                  <Download className="w-4 h-4" /> iOS App
                </a>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-14 flex flex-wrap items-center justify-center gap-8"
        >
          {[
            { label: 'QR-Based Entry', icon: <Shield className="w-4 h-4" /> },
            { label: 'Real-time Monitoring', icon: <Sparkles className="w-4 h-4" /> },
            { label: 'Secure & Encrypted', icon: <Lock className="w-4 h-4" /> },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest"
              style={{ color: 'var(--foreground)', opacity: 0.4 }}>
              {item.icon}
              {item.label}
            </div>
          ))}
        </motion.div>
      </div>

      {/* Footer */}
      <div className="mt-16 text-[10px] font-black uppercase tracking-[0.3em] z-10 flex flex-col items-center gap-4">

        {/* Sub-footer Text */}
        <div className="flex flex-col items-center gap-3" style={{ color: 'var(--foreground)', opacity: 0.35 }}>
          <div className="flex items-center gap-5">
            <span>Safety</span>
            <span className="w-1 h-1 rounded-full bg-current opacity-40" />
            <span>Security</span>
            <span className="w-1 h-1 rounded-full bg-current opacity-40" />
            <span>Efficiency</span>
          </div>
          <p>&copy; 2026 SVSU Security &bull; Build for Safety</p>
        </div>

        {/* Action Links */}
        <div className="flex items-center justify-center space-x-4 text-xs md:text-sm font-extrabold" style={{ color: 'var(--foreground)' }}>
          <button
            onClick={() => setIsFeedbackOpen(true)}
            className="opacity-70 hover:opacity-100 hover:text-[color:var(--accent)] transition-all"
          >
            Feedback
          </button>
          <span className="opacity-30">•</span>
          <Link href="/terms" className="opacity-70 hover:opacity-100 hover:text-[color:var(--accent)] transition-all">
            Terms and Conditions
          </Link>
          <span className="opacity-30">•</span>
          <button
            onClick={() => alert('Welcome to the SVSU Gate Pass system. Download the app or use the dashboard to manage entries.')}
            className="opacity-70 hover:opacity-100 hover:text-[color:var(--accent)] transition-all"
          >
            How it works
          </button>
        </div>
      </div>

      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
    </main>
  );
}
