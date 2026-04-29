'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, User, Shield, LogOut, ChevronRight, LayoutDashboard } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<'student' | 'guard' | 'admin' | null>(null);
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);

  useEffect(() => {
    // Initial check
    checkAuth();

    // Listen for terminal unlock
    const handleAdminUnlock = () => setIsAdminUnlocked(true);
    window.addEventListener('admin-unlocked', handleAdminUnlock);
    
    // Check if already unlocked in this session
    if (sessionStorage.getItem('admin_unlocked') === 'true') {
      setIsAdminUnlocked(true);
    }

    return () => window.removeEventListener('admin-unlocked', handleAdminUnlock);
  }, [pathname]);

  const checkAuth = () => {
    const cookies = document.cookie;
    if (cookies.includes('admin_token')) {
      setUserRole('admin');
      setIsAdminUnlocked(true);
    } else if (cookies.includes('auth_token')) {
      setUserRole('guard');
    } else if (cookies.includes('student_token')) {
      setUserRole('student');
    } else {
      setUserRole(null);
    }
  };

  const handleLogout = () => {
    document.cookie = "student_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    sessionStorage.removeItem('admin_unlocked');
    setUserRole(null);
    setIsAdminUnlocked(false);
    router.push('/');
  };

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 p-1.5 bg-neutral-900/40 backdrop-blur-2xl border border-neutral-800 rounded-2xl shadow-2xl">
      <Link 
        href="/" 
        className={`p-2.5 rounded-xl transition-all ${pathname === '/' ? 'bg-accent text-white' : 'text-neutral-500 hover:text-white hover:bg-neutral-800'}`}
      >
        <Home className="w-5 h-5" />
      </Link>

      <div className="w-[1px] h-4 bg-neutral-800 mx-1" />

      {/* Profile/Dashboard based on role */}
      {userRole === 'student' && (
        <Link 
          href="/profile" 
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${pathname === '/profile' ? 'bg-accent text-white' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'}`}
        >
          <User className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-widest">Profile</span>
        </Link>
      )}

      {userRole === 'guard' && (
        <Link 
          href="/admin" 
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${pathname === '/admin' ? 'bg-accent text-white' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'}`}
        >
          <Shield className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-widest">Dashboard</span>
        </Link>
      )}

      {/* Admin Panel (Visible only if siteadmin unlocked) */}
      <AnimatePresence>
        {isAdminUnlocked && (
          <motion.div
            initial={{ opacity: 0, w: 0 }}
            animate={{ opacity: 1, w: 'auto' }}
            exit={{ opacity: 0, w: 0 }}
          >
            <Link 
              href="/admin/dashboard" 
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all border border-green-500/30 ${pathname === '/admin/dashboard' ? 'bg-green-600 text-white' : 'bg-green-500/10 text-green-500 hover:bg-green-500/20'}`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">Admin Core</span>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {userRole && (
        <div className="flex items-center gap-1 ml-2">
          <div className="w-[1px] h-4 bg-neutral-800 mr-2" />
          <button 
            onClick={handleLogout}
            className="p-2.5 text-neutral-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      )}
    </nav>
  );
}
