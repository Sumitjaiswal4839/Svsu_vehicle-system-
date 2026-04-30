'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  RefreshCw, 
  ShieldCheck, 
  ShieldX,
  LogOut,
  Clock, 
  ArrowRight, 
  AlertTriangle, 
  Search,
  CheckCircle2,
  XCircle,
  Loader2,
  Download,
  Smartphone,
  Globe,
  Monitor,
  Power,
  FileText,
  UserPlus
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { convertToCSV, downloadCSV } from '@/lib/export';
import Logo from '@/components/Logo';

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'sessions'>('overview');
  const [guards, setGuards] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const init = async () => {
      await Promise.all([fetchGuards(), fetchStats()]);
      if (activeTab === 'students') await fetchManagementData('students');
      if (activeTab === 'sessions') await fetchManagementData('sessions');
      setLoading(false);
    };
    init();
  }, [activeTab]);

  const fetchManagementData = async (type: 'students' | 'sessions') => {
    try {
      const res = await fetch(`/api/admin/management?type=${type}`);
      if (res.ok) {
        const data = await res.json();
        if (type === 'students') setStudents(data);
        if (type === 'sessions') setSessions(data);
      }
    } catch (err) {
      toast.error(`Failed to load ${type}`);
    }
  };

  const terminateSession = async (sessionId: string) => {
    try {
      const res = await fetch('/api/admin/management', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });
      if (res.ok) {
        toast.success('Session terminated and guard forced to logout');
        fetchManagementData('sessions');
      }
    } catch (err) {
      toast.error('Failed to terminate session');
    }
  };

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
    <main className="min-h-screen bg-[#0a0a0c] text-neutral-100 p-4 md:p-8 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-accent/10 rounded-full blur-[150px] -z-10" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-600/5 rounded-full blur-[150px] -z-10" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12">
          <div className="flex items-center gap-6">
            <Logo className="scale-125 origin-left" />
            <div className="w-[1px] h-12 bg-white/10 hidden lg:block" />
            <div>
              <h1 className="text-3xl font-black tracking-tighter bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">
                Command Center
              </h1>
              <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-[0.2em] mt-1">Enterprise Security Management</p>
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
        </header>

        {/* Tab Navigation */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex bg-neutral-900/50 p-1 rounded-2xl border border-white/5">
            {[
              { id: 'overview', label: 'Overview', icon: ShieldCheck },
              { id: 'students', label: 'Students', icon: Users },
              { id: 'sessions', label: 'Sessions', icon: Globe }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  activeTab === tab.id 
                    ? 'bg-accent text-white shadow-lg shadow-accent/20' 
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-accent transition-colors" />
            <input 
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-accent/50 focus:ring-4 focus:ring-accent/5 transition-all"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
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
                </div>

                <div className="space-y-4">
                  {guards.map((guard) => (
                    <div key={guard.id} className="flex items-center justify-between p-5 bg-neutral-950/50 border border-neutral-800 rounded-3xl">
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
                    </div>
                  ))}
                </div>
              </div>

              {/* Insights */}
              <div className="space-y-8">
                <div className="bg-neutral-900/40 border border-neutral-800 rounded-[2.5rem] p-8 backdrop-blur-xl">
                   <h2 className="text-xl font-bold mb-6">Activity Breakdown</h2>
                   <div className="space-y-4">
                      {stats?.auditStats?.map((as: any) => (
                        <div key={as.action} className="flex items-center justify-between p-3 bg-neutral-950/50 border border-neutral-800 rounded-xl">
                           <span className="text-[10px] font-black uppercase text-neutral-500">{as.action}</span>
                           <span className="text-sm font-bold text-accent">{as._count._all}</span>
                        </div>
                      ))}
                   </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'students' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-neutral-900/40 border border-neutral-800 rounded-[2.5rem] p-8 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-bold">Registered Students</h2>
                <p className="text-xs text-neutral-500">Directory of all authorized campus vehicles</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent rounded-xl text-xs font-bold">
                <Users className="w-4 h-4" />
                {students.length} Total
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-neutral-800">
                    <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-neutral-500">Student Info</th>
                    <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-neutral-500">Course & Year</th>
                    <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-neutral-500">Vehicle No</th>
                    <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-neutral-500">Registration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/50">
                  {students.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.rollNo.includes(searchQuery)).map((s) => (
                    <tr key={s.id} className="group hover:bg-white/5 transition-colors">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-neutral-800 rounded-xl overflow-hidden border border-white/5">
                            <img src={s.profilePhoto || '/placeholder-user.png'} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="font-bold text-sm">{s.name}</p>
                            <p className="text-[10px] text-neutral-500 uppercase">{s.rollNo}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <p className="text-sm">{s.course}</p>
                        <p className="text-[10px] text-neutral-500 uppercase">{s.semester} Sem</p>
                      </td>
                      <td className="py-4 font-mono text-sm text-accent">{s.vehicleNo}</td>
                      <td className="py-4 text-xs text-neutral-500">
                        {new Date(s.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'sessions' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="bg-orange-500/10 border border-orange-500/20 p-6 rounded-[2rem] flex items-center gap-4">
              <AlertTriangle className="w-6 h-6 text-orange-500" />
              <div>
                <h3 className="font-bold text-orange-500">Active Security Sessions</h3>
                <p className="text-xs text-orange-200/60">Terminate sessions to force logout guards from their devices instantly.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sessions.map((session) => (
                <div key={session.id} className="bg-neutral-900/40 border border-neutral-800 rounded-[2.5rem] p-6 backdrop-blur-xl relative overflow-hidden group">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-accent/10 rounded-2xl">
                        {session.userAgent?.includes('Mobi') ? <Smartphone className="w-5 h-5 text-accent" /> : <Monitor className="w-5 h-5 text-accent" />}
                      </div>
                      <div>
                        <h3 className="font-bold">{session.user.username}</h3>
                        <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-widest">{session.user.role}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => terminateSession(session.id)}
                      className="p-3 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-500/10"
                      title="Force Logout"
                    >
                      <Power className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-xs text-neutral-400">
                      <Globe className="w-4 h-4" />
                      <span>IP: {session.ipAddress}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-neutral-400">
                      <Clock className="w-4 h-4" />
                      <span>Login: {new Date(session.createdAt).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Device Tag */}
                  <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                     <FileText className="w-16 h-16 rotate-12" />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
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
