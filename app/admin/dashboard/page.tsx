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
  Loader2,
  Download
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { convertToCSV, downloadCSV } from '@/lib/export';

export default function AdminDashboard() {
  const router = useRouter();
  const [guards, setGuards] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    Promise.all([fetchGuards(), fetchStats()]).finally(() => setLoading(false));
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) setStats(await res.json());
    } catch (err) {}
  };

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
    }
  };

  const handleExportLogs = async () => {
    setExporting(true);
    try {
      const res = await fetch('/api/admin/audit-logs');
      if (res.ok) {
        const data = await res.json();
        const csv = convertToCSV(data);
        downloadCSV(csv, `svsu_audit_log_${new Date().toISOString().split('T')[0]}.csv`);
        toast.success('Audit log downloaded');
      } else {
        toast.error('Export failed');
      }
    } catch (err) {
      toast.error('Export error');
    } finally {
      setExporting(false);
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
        fetchStats(); // Refresh stats for pending count
      } else {
        toast.error('Failed to update status');
      }
    } catch (err) {
      toast.error('Connection error');
    } finally {
      setUpdating(null);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
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
      {/* Navigation */}
      <div className="max-w-6xl mx-auto flex items-center justify-between mb-12">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/')}
            className="p-3 bg-neutral-900 border border-neutral-800 rounded-2xl hover:bg-neutral-800 transition-all group"
          >
            <Home className="w-5 h-5 text-neutral-400 group-hover:text-white" />
          </button>
          <div className="h-6 w-[1px] bg-neutral-800" />
          <div>
            <h1 className="text-xl font-black tracking-tighter">ADMIN COMMAND</h1>
            <p className="text-[10px] text-accent font-bold uppercase tracking-widest">SVSU Campus Security</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportLogs}
            disabled={exporting}
            aria-label="Download Security Audit Logs"
            className="flex items-center gap-2 px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl hover:bg-neutral-800 transition-all text-[10px] font-black uppercase tracking-widest"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Export Logs
          </button>
          <button 
            onClick={handleLogout}
            aria-label="Logout from Admin Panel"
            className="flex items-center gap-2 px-4 py-2 bg-red-600/10 border border-red-600/20 text-red-500 rounded-xl hover:bg-red-600/20 transition-all font-bold text-[10px] uppercase tracking-widest"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <AdminStatCard label="Today's Entries" value={stats?.totalEntries || 0} icon={<RefreshCw className="w-5 h-5" />} />
          <AdminStatCard label="Active Vehicles" value={stats?.activeVehicles || 0} icon={<Users className="w-5 h-5" />} />
          <AdminStatCard label="Total Students" value={stats?.totalStudents || 0} icon={<Users className="w-5 h-5" />} />
          <AdminStatCard 
            label="Pending Guards" 
            value={stats?.pendingGuards || 0} 
            icon={<ShieldCheck className="w-5 h-5" />} 
            alert={stats?.pendingGuards > 0}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Guard List */}
          <div className="lg:col-span-2 bg-neutral-900/40 border border-neutral-800 rounded-[2.5rem] p-8 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-bold">Security Personnel</h2>
                <p className="text-xs text-neutral-500">Authorize or manage guard access levels</p>
              </div>
              <button onClick={fetchGuards} className="p-2 text-neutral-500 hover:text-white transition-colors">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {guards.map((guard) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={guard.id}
                  className="flex items-center justify-between p-5 bg-neutral-950/50 border border-neutral-800 rounded-3xl"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${guard.isAuthorized ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                      {guard.isAuthorized ? <ShieldCheck className="w-5 h-5" /> : <ShieldX className="w-5 h-5" />}
                    </div>
                    <div>
                      <h3 className="font-bold">{guard.username}</h3>
                      <p className={`text-[10px] font-black uppercase tracking-widest ${guard.isAuthorized ? 'text-green-500' : 'text-orange-500'}`}>
                        {guard.isAuthorized ? 'Active Guard' : 'Approval Pending'}
                      </p>
                    </div>
                  </div>

                  <button
                    disabled={updating === guard.id}
                    onClick={() => toggleAuthorization(guard.id, guard.isAuthorized)}
                    className={`px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                      guard.isAuthorized 
                        ? 'bg-neutral-900 text-red-500 border border-red-500/10 hover:bg-red-500 hover:text-white' 
                        : 'bg-accent text-white shadow-lg shadow-accent/20'
                    }`}
                  >
                    {updating === guard.id ? <Loader2 className="w-4 h-4 animate-spin" /> : guard.isAuthorized ? 'Revoke' : 'Authorize'}
                  </button>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Quick Insights & Role Stats */}
          <div className="space-y-8">
            <div className="bg-neutral-900/40 border border-neutral-800 rounded-[2.5rem] p-8 backdrop-blur-xl">
               <h2 className="text-xl font-bold mb-6">Action Distribution</h2>
               <div className="space-y-4">
                  {stats?.auditStats?.map((as: any) => (
                    <div key={as.action} className="flex items-center justify-between p-3 bg-neutral-950/50 border border-neutral-800 rounded-xl">
                       <span className="text-[10px] font-black uppercase text-neutral-500">{as.action}</span>
                       <span className="text-sm font-bold text-accent">{as._count._all}</span>
                    </div>
                  ))}
               </div>
            </div>

            <div className="bg-neutral-900/40 border border-neutral-800 rounded-[2.5rem] p-8 backdrop-blur-xl">
               <h2 className="text-xl font-bold mb-6">Recent Guard Activity</h2>
               <div className="space-y-3">
                  {stats?.topGuards?.map((tg: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 text-[10px] text-neutral-400">
                       <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                       <span className="font-bold text-neutral-200">{tg.user.username}</span>
                       <span>authorized an entry</span>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function AdminStatCard({ label, value, icon, alert }: any) {
  return (
    <div className={`bg-neutral-900/40 border ${alert ? 'border-orange-500/30 shadow-[0_0_20px_rgba(249,115,22,0.1)]' : 'border-neutral-800'} rounded-[2rem] p-6 backdrop-blur-xl`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${alert ? 'bg-orange-500/10 text-orange-500' : 'bg-accent/10 text-accent'}`}>
        {icon}
      </div>
      <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest mb-1">{label}</p>
      <p className="text-3xl font-black">{value}</p>
    </div>
  );
}
