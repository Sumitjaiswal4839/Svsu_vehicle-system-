'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  ShieldCheck, 
  ShieldX, 
  Home, 
  LogOut, 
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  Loader2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const router = useRouter();
  const [guards, setGuards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchGuards();
  }, []);

  const fetchGuards = async () => {
    try {
      const res = await fetch('/api/admin/guards');
      if (res.ok) {
        const data = await res.json();
        setGuards(data);
      } else {
        router.push('/login');
      }
    } catch (err) {
      toast.error('Failed to fetch guards');
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthorization = async (guardId: string, currentStatus: boolean) => {
    setUpdating(guardId);
    try {
      const res = await fetch('/api/admin/guards', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guardId, isAuthorized: !currentStatus })
      });

      if (res.ok) {
        setGuards(prev => prev.map(g => g.id === guardId ? { ...g, isAuthorized: !currentStatus } : g));
        toast.success(`Guard ${!currentStatus ? 'Authorized' : 'Deauthorized'}`);
      } else {
        toast.error('Failed to update status');
      }
    } catch (err) {
      toast.error('Connection error');
    } finally {
      setUpdating(null);
    }
  };

  const handleLogout = () => {
    document.cookie = "admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-accent animate-spin mb-4" />
        <p className="text-neutral-500 font-bold uppercase tracking-widest text-xs">Accessing Admin Core...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0c] text-neutral-100 p-4 md:p-8">
      {/* Sidebar-like Navigation in Corners */}
      <div className="fixed top-8 left-8 flex items-center gap-4 z-50">
        <button 
          onClick={() => router.push('/')}
          className="p-3 bg-neutral-900 border border-neutral-800 rounded-2xl hover:bg-neutral-800 transition-all group"
        >
          <Home className="w-5 h-5 text-neutral-400 group-hover:text-white" />
        </button>
        <div className="h-6 w-[1px] bg-neutral-800" />
        <div className="flex flex-col">
          <h1 className="text-lg font-black tracking-tighter">SVSU ADMIN</h1>
          <p className="text-[10px] text-accent font-bold uppercase tracking-widest">Command Center</p>
        </div>
      </div>

      <div className="fixed top-8 right-8 z-50">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-red-600/10 border border-red-600/20 text-red-500 rounded-xl hover:bg-red-600/20 transition-all font-bold text-xs uppercase"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>

      <div className="max-w-4xl mx-auto pt-24">
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-[2.5rem] p-8 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-accent/20 rounded-2xl">
                <Users className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Guard Management</h2>
                <p className="text-xs text-neutral-500">Approve or revoke security personnel access</p>
              </div>
            </div>
            <button 
              onClick={fetchGuards}
              className="p-2 text-neutral-500 hover:text-white transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            {guards.length === 0 ? (
              <div className="py-20 text-center border-2 border-dashed border-neutral-800 rounded-[2rem]">
                <Search className="w-12 h-12 text-neutral-800 mx-auto mb-4" />
                <p className="text-neutral-600 font-bold uppercase tracking-widest text-xs">No Guards Found</p>
              </div>
            ) : (
              guards.map((guard) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={guard.id}
                  className="flex items-center justify-between p-6 bg-neutral-950 border border-neutral-800 rounded-3xl hover:border-neutral-700 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${guard.isAuthorized ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                      {guard.isAuthorized ? <ShieldCheck className="w-6 h-6 text-green-500" /> : <ShieldX className="w-6 h-6 text-red-500" />}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{guard.username}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-neutral-600 uppercase">Status:</span>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${guard.isAuthorized ? 'text-green-500' : 'text-red-500'}`}>
                          {guard.isAuthorized ? 'Authorized' : 'Pending Approval'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    disabled={updating === guard.id}
                    onClick={() => toggleAuthorization(guard.id, guard.isAuthorized)}
                    className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                      guard.isAuthorized 
                        ? 'bg-neutral-900 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white' 
                        : 'bg-accent text-white shadow-lg shadow-accent/20 hover:opacity-90'
                    } disabled:opacity-50`}
                  >
                    {updating === guard.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      guard.isAuthorized ? 'Revoke Access' : 'Authorize Guard'
                    )}
                  </button>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-8 flex items-center justify-center gap-8">
           <div className="flex items-center gap-2">
             <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
             <span className="text-[10px] text-neutral-600 font-bold uppercase tracking-widest">Secure Admin Session</span>
           </div>
           <div className="text-[10px] text-neutral-800 font-bold uppercase tracking-widest">
             SVSU VSS • v2.1.0
           </div>
        </div>
      </div>
    </main>
  );
}
