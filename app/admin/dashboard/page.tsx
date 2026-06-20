'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [buildings, setBuildings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [updating, setUpdating] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [isAddGuardOpen, setIsAddGuardOpen] = useState(false);
  const [newGuard, setNewGuard] = useState({ username: '', password: '', buildingId: '' });
  const [creating, setCreating] = useState(false);

  const handleAddGuard = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch('/api/admin/guards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGuard)
      });

      if (res.ok) {
        toast.success('Guard created successfully');
        setIsAddGuardOpen(false);
        setNewGuard({ username: '', password: '', buildingId: '' });
        fetchGuards();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to create guard');
      }
    } catch (err) {
      toast.error('Connection error');
    } finally {
      setCreating(false);
    }
  };

  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const init = async () => {
      await Promise.all([fetchGuards(), fetchStats(), fetchBuildings()]);
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

  const fetchBuildings = async () => {
    try {
      const res = await fetch('/api/buildings');
      if (res.ok) setBuildings(await res.json());
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

  const toggleAuthorization = async (guardId: string, currentStatus: boolean, buildingId?: string) => {
    setUpdating(guardId);
    try {
      const res = await fetch('/api/admin/guards', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          guardId, 
          isAuthorized: buildingId ? currentStatus : !currentStatus,
          buildingId: buildingId || undefined
        })
      });

      if (res.ok) {
        setGuards(prev => prev.map(g => g.id === guardId ? { 
          ...g, 
          isAuthorized: buildingId ? currentStatus : !currentStatus,
          buildingId: buildingId || g.buildingId
        } : g));
        if (!buildingId) toast.success(`Guard ${!currentStatus ? 'Authorized' : 'Deauthorized'}`);
        else toast.success('Building Assigned');
        fetchStats(); 
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
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-[color:var(--accent)] animate-spin mb-4" />
        <p className="text-neutral-500 font-bold uppercase tracking-widest text-xs">Accessing Admin Core...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground p-4 md:p-8 pt-32 md:pt-40 relative overflow-hidden transition-colors duration-500">
      {/* Background Glow */}
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-accent/20 rounded-full blur-[150px] -z-10" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-600/5 rounded-full blur-[150px] -z-10" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12">
          <div className="flex items-center gap-6">
            <div>
              <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-foreground to-foreground/40 bg-clip-text text-transparent">
                Command Center
              </h1>
              <p className="text-[10px] text-foreground/50 font-bold uppercase tracking-[0.2em] mt-1">Enterprise Security Management</p>
            </div>
          </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportLogs}
            disabled={exporting}
            aria-label="Download Security Audit Logs"
            className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-xl hover:bg-neutral-800 transition-all text-[10px] font-black uppercase tracking-widest"
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
          <div className="flex bg-card/60 p-1 rounded-2xl border border-white/5">
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
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-[color:var(--accent)] transition-colors" />
            <input 
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-card border border-border rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-accent/50 focus:ring-4 focus:ring-accent/5 transition-all"
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
              <div className="lg:col-span-2 bg-card/80 border border-border rounded-[2.5rem] p-8 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-xl font-bold">Security Personnel</h2>
                    <p className="text-xs text-neutral-500">Authorize or manage guard access levels</p>
                  </div>
                  <button 
                    onClick={() => setIsAddGuardOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-xl hover:bg-accent/80 transition-all text-[10px] font-black uppercase tracking-widest shadow-lg shadow-accent/20"
                  >
                    <UserPlus className="w-4 h-4" />
                    Register Guard
                  </button>
                </div>

                {/* Add Guard Modal */}
                <AnimatePresence>
                  {isAddGuardOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                      <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        onClick={() => setIsAddGuardOpen(false)}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
                      />
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-md bg-card border border-border rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
                      >
                         <div className="absolute top-0 right-0 p-8 opacity-5">
                            <UserPlus className="w-24 h-24" />
                         </div>
                         <h2 className="text-2xl font-black mb-2">Register Guard</h2>
                         <p className="text-xs text-neutral-500 mb-8 uppercase tracking-widest font-bold">New Security Personnel Credentials</p>

                         <form onSubmit={handleAddGuard} className="space-y-4">
                            <div className="space-y-2">
                               <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-4">Username</label>
                               <input 
                                 required
                                 type="text" 
                                 value={newGuard.username}
                                 onChange={(e) => setNewGuard({...newGuard, username: e.target.value})}
                                 placeholder="e.g. guard_officer_01"
                                 className="w-full bg-black border border-border rounded-2xl py-4 px-6 text-sm focus:border-accent outline-none transition-all"
                               />
                            </div>
                            <div className="space-y-2">
                               <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-4">Password</label>
                               <input 
                                 required
                                 type="password" 
                                 value={newGuard.password}
                                 onChange={(e) => setNewGuard({...newGuard, password: e.target.value})}
                                 placeholder="••••••••"
                                 className="w-full bg-black border border-border rounded-2xl py-4 px-6 text-sm focus:border-accent outline-none transition-all"
                               />
                            </div>
                            <div className="space-y-2">
                               <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-4">Assign Building</label>
                               <select 
                                 value={newGuard.buildingId}
                                 onChange={(e) => setNewGuard({...newGuard, buildingId: e.target.value})}
                                 className="w-full bg-black border border-border rounded-2xl py-4 px-6 text-sm focus:border-accent outline-none transition-all appearance-none"
                               >
                                  <option value="">No Initial Assignment</option>
                                  {buildings.map(b => (
                                    <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                                  ))}
                               </select>
                            </div>

                            <div className="pt-4 flex gap-3">
                               <button 
                                 type="button"
                                 onClick={() => setIsAddGuardOpen(false)}
                                 className="flex-1 py-4 bg-neutral-800 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-neutral-700 transition-all"
                               >
                                  Cancel
                               </button>
                               <button 
                                 type="submit"
                                 disabled={creating}
                                 className="flex-[2] py-4 bg-accent text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-accent/80 transition-all shadow-lg shadow-accent/20 flex items-center justify-center gap-2"
                               >
                                  {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                                  Register Personnel
                               </button>
                            </div>
                         </form>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>

                <div className="space-y-4">
                  {guards.map((guard) => (
                    <div key={guard.id} className="flex items-center justify-between p-5 bg-foreground/[0.03] border border-border rounded-3xl">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${guard.isAuthorized ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                          {guard.isAuthorized ? <ShieldCheck className="w-5 h-5" /> : <ShieldX className="w-5 h-5" />}
                        </div>
                        <div>
                          <h3 className="font-bold">{guard.username}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <p className={`text-[10px] font-black uppercase tracking-widest ${guard.isAuthorized ? 'text-green-500' : 'text-orange-500'}`}>
                              {guard.isAuthorized ? 'Active Guard' : 'Approval Pending'}
                            </p>
                            <span className="text-[10px] text-neutral-600">•</span>
                            <select 
                              value={guard.buildingId || ''}
                              onChange={(e) => toggleAuthorization(guard.id, guard.isAuthorized, e.target.value)}
                              className="bg-transparent text-[10px] font-bold text-[color:var(--accent)] outline-none border-b border-accent/20 hover:border-accent transition-colors"
                            >
                              <option value="">No Building Assigned</option>
                              {buildings.map(b => (
                                <option key={b.id} value={b.id} className="bg-neutral-900">{b.name} ({b.code})</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>


                      <button
                        disabled={updating === guard.id}
                        onClick={() => toggleAuthorization(guard.id, guard.isAuthorized)}
                        className={`px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                          guard.isAuthorized 
                            ? 'bg-card text-red-500 border border-red-500/10 hover:bg-red-500 hover:text-white' 
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
                <div className="bg-card/80 border border-border rounded-[2.5rem] p-8 backdrop-blur-xl">
                   <h2 className="text-xl font-bold mb-6">Activity Breakdown</h2>
                   <div className="space-y-4">
                      {stats?.auditStats?.map((as: any) => (
                        <div key={as.action} className="flex items-center justify-between p-3 bg-foreground/[0.03] border border-border rounded-xl">
                           <span className="text-[10px] font-black uppercase text-neutral-500">{as.action}</span>
                           <span className="text-sm font-bold text-[color:var(--accent)]">{as._count._all}</span>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="bg-card/80 border border-border rounded-[2.5rem] p-8 backdrop-blur-xl">
                   <h2 className="text-xl font-bold mb-6">Building Occupancy</h2>
                   <div className="space-y-4">
                      {stats?.buildingStats?.map((bs: any) => (
                        <div key={bs.buildingId} className="space-y-2">
                           <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-neutral-300">{bs.buildingId || 'Unassigned'}</span>
                              <span className="text-xs font-black text-[color:var(--accent)]">{bs._count._all}</span>
                           </div>
                           <div className="h-1.5 bg-background rounded-full overflow-hidden border border-white/5">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(100, (bs._count._all / (stats.totalEntries || 1)) * 100)}%` }}
                                className="h-full bg-accent"
                              />
                           </div>
                        </div>
                      ))}
                   </div>
                </div>

              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'students' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card/80 border border-border rounded-[2.5rem] p-8 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-bold">Registered Students</h2>
                <p className="text-xs text-neutral-500">Directory of all authorized campus vehicles</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-accent/10 text-[color:var(--accent)] rounded-xl text-xs font-bold">
                <Users className="w-4 h-4" />
                {students.length} Total
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border">
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
                          <div className="w-10 h-10 bg-neutral-800 rounded-xl overflow-hidden border border-white/5 relative">
                            <Image src={s.profilePhoto || '/placeholder-user.png'} alt={s.name} fill className="object-cover" />
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
                      <td className="py-4 font-mono text-sm text-[color:var(--accent)]">{s.vehicleNo}</td>
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
                <div key={session.id} className="bg-card/80 border border-border rounded-[2.5rem] p-6 backdrop-blur-xl relative overflow-hidden group">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-accent/10 rounded-2xl">
                        {session.userAgent?.includes('Mobi') ? <Smartphone className="w-5 h-5 text-[color:var(--accent)]" /> : <Monitor className="w-5 h-5 text-[color:var(--accent)]" />}
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
    <div className={`bg-card/80 border ${alert ? 'border-orange-500/30 shadow-[0_0_20px_rgba(249,115,22,0.1)]' : 'border-border'} rounded-[2rem] p-6 backdrop-blur-xl`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${alert ? 'bg-orange-500/10 text-orange-500' : 'bg-accent/10 text-[color:var(--accent)]'}`}>
        {icon}
      </div>
      <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest mb-1">{label}</p>
      <p className="text-3xl font-black">{value}</p>
    </div>
  );
}
