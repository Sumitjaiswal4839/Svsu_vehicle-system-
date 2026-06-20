'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, User, Shield, LogOut, LayoutDashboard, Sun, Moon } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import Logo from './Logo';
import { useTheme } from './ThemeProvider';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [userRole, setUserRole] = useState<'student' | 'guard' | 'admin' | null>(null);
  const [buildingName, setBuildingName] = useState<string | null>(null);
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);

  useEffect(() => {
    checkAuth();

    const handleAdminUnlock = () => setIsAdminUnlocked(true);
    const handleAdminLock = () => setIsAdminUnlocked(false);
    window.addEventListener('admin-unlocked', handleAdminUnlock);
    window.addEventListener('admin-locked', handleAdminLock);
    
    if (sessionStorage.getItem('admin_unlocked') === 'true') {
      setIsAdminUnlocked(true);
    }

    return () => {
      window.removeEventListener('admin-unlocked', handleAdminUnlock);
      window.removeEventListener('admin-locked', handleAdminLock);
    };
  }, [pathname]);

  const checkAuth = async () => {
    const cookies = document.cookie;
    if (cookies.includes('admin_token')) {
      setUserRole('admin');
      setIsAdminUnlocked(true);
    } else if (cookies.includes('auth_token')) {
      setUserRole('guard');
      try {
        const res = await fetch('/api/dashboard');
        const data = await res.json();
        if (res.ok) setBuildingName(data.guardBuildingName || 'Global Command');
      } catch (e) {}
    } else if (cookies.includes('student_token')) {
      setUserRole('student');
    } else {
      setUserRole(null);
      setBuildingName(null);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      sessionStorage.removeItem('admin_unlocked');
      setUserRole(null);
      setIsAdminUnlocked(false);
      setBuildingName(null);
      router.push('/');
      router.refresh();
      toast.success('Logged out successfully');
    } catch (err) {
      toast.error('Logout failed');
    }
  };

  return (
    <div className="fixed top-4 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-8 pointer-events-none">
      <div className="flex items-center gap-4 pointer-events-auto">
        <Logo className="bg-background/40 p-2 rounded-2xl backdrop-blur-md border border-foreground/5" />
        
        {/* Building Indicator (Guard Only) */}
        <AnimatePresence>
          {userRole === 'guard' && buildingName && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="hidden lg:flex items-center gap-3 px-4 py-2 bg-accent/10 border border-accent/20 rounded-2xl backdrop-blur-md shadow-lg shadow-accent/5"
            >
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-[8px] text-foreground/50 font-black uppercase tracking-[0.2em] leading-none mb-1">Security Control</p>
                <p className="text-[10px] font-black text-foreground uppercase tracking-tight truncate max-w-[120px]">
                  {buildingName}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <nav className="pointer-events-auto flex items-center gap-2 p-1.5 bg-background/60 backdrop-blur-3xl border border-foreground/5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all">
        <Link 
          href="/" 
          className={`p-2.5 rounded-xl transition-all ${pathname === '/' ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-foreground/40 hover:text-foreground hover:bg-foreground/5'}`}
        >
          <Home className="w-5 h-5" />
        </Link>

        <div className="w-[1px] h-4 bg-foreground/10 mx-1" />

        {/* Student Profile (Hidden for Guards) */}
        {userRole === 'student' && (
          <Link 
            href="/student/dashboard" 
            className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${pathname === '/student/dashboard' ? 'bg-accent text-white' : 'text-foreground/40 hover:text-foreground hover:bg-foreground/5'}`}
          >
            <User className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">Pass Portal</span>
          </Link>
        )}

        {/* Guard Console (Hidden for Students) */}
        {userRole === 'guard' && (
          <Link 
            href="/admin" 
            className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${pathname === '/admin' ? 'bg-accent text-white' : 'text-foreground/40 hover:text-foreground hover:bg-foreground/5'}`}
          >
            <Shield className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">Security Console</span>
          </Link>
        )}

        {/* Admin Core (Hidden for Students) */}
        <AnimatePresence>
          {isAdminUnlocked && userRole !== 'student' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <Link 
                href="/admin/dashboard" 
                className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all border border-accent/30 ${pathname === '/admin/dashboard' ? 'bg-accent text-white' : 'bg-accent/10 text-[color:var(--accent)] hover:bg-accent/20'}`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">Admin Core</span>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="w-[1px] h-4 bg-foreground/10 mx-1" />

        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className="p-2.5 text-foreground/40 hover:text-[color:var(--accent)] hover:bg-foreground/5 rounded-xl transition-all"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {userRole && (
          <div className="flex items-center gap-1">
            <div className="w-[1px] h-4 bg-foreground/10 mx-1" />
            <button 
              onClick={handleLogout}
              className="p-2.5 text-foreground/40 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </nav>
    </div>
  );
}
