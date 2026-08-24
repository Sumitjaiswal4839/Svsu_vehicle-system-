'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Car, 
  Clock, 
  Users, 
  Search, 
  Download, 
  ArrowLeft,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  LogOut,
  MapPin,
  Calendar,
  QrCode,
  Printer,
  CheckCircle,
  X,
  User,
  ShieldCheck,
  Smartphone
} from 'lucide-react';


import QRGenerator from '@/components/QRGenerator';
import QRScanner from '@/components/QRScanner';
import VisitorForm from '@/components/VisitorForm';
import Logo from '@/components/Logo';
import { toast } from 'sonner';



interface DashboardData {
  activeVehicles: any[];
  exitedVehicles: any[];
  temporaryVisitors: any[];
  guardBuildingId: string | null;
  guardBuildingName: string | null;
  guardName: string | null;
  is_admin: boolean;
  pagination?: {
    page: number;
    limit: number;
    totalPages: number;
    totalExited: number;
  };
  stats: {
    totalToday: number;
    insideCount: number;
    overstayedCount: number;
  };
}

const EMPTY_DASHBOARD: DashboardData = {
  activeVehicles: [],
  exitedVehicles: [],
  temporaryVisitors: [],
  guardBuildingId: null,
  guardBuildingName: null,
  guardName: null,
  is_admin: false,
  stats: {
    totalToday: 0,
    insideCount: 0,
    overstayedCount: 0,
  },
};

type TabType = 'active' | 'exited' | 'temporary';

import { convertToCSV, downloadCSV } from '@/lib/export';

export default function GuardDashboard() {
  const [data, setData] = useState<DashboardData>(EMPTY_DASHBOARD);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isVisitorOpen, setIsVisitorOpen] = useState(false);
  const [isQROpen, setIsQROpen] = useState(false);

  const [verifyingProfile, setVerifyingProfile] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [lastActivityCount, setLastActivityCount] = useState(0);
  const [historyPage, setHistoryPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchData = async (currentSearch: string, date: string, page = 1, append = false) => {
    try {
      const res = await fetch(`/api/dashboard?search=${encodeURIComponent(currentSearch)}&date=${date}&page=${page}&limit=20`);
      const json = await res.json();

      if (!res.ok) {
        if (res.status === 401) window.location.href = '/login';
        throw new Error(json?.error || 'Failed to load dashboard data');
      }
      if (append) {
        setData(prev => ({
          ...json,
          exitedVehicles: [...prev.exitedVehicles, ...json.exitedVehicles],
        }));
      } else {
        setData(json);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = async () => {
    const nextPage = historyPage + 1;
    setHistoryPage(nextPage);
    setLoadingMore(true);
    await fetchData(search, selectedDate, nextPage, true);
  };

  const handleExportData = () => {
    const items = activeTab === 'active' ? data.activeVehicles : activeTab === 'temporary' ? data.temporaryVisitors : data.exitedVehicles;
    if (items.length === 0) return toast.error('No data to export');
    
    const formatted = items.map(item => ({
      Vehicle: item.vehicleNo || item.profile?.vehicleNo,
      Name: item.profile?.name || item.visitorName || 'N/A',
      Roll_No: item.profile?.rollNo || 'N/A',
      Entry: new Date(item.entryTime).toLocaleString(),
      Type: item.isTemporary ? 'Visitor' : 'Student'
    }));

    const csv = convertToCSV(formatted);
    downloadCSV(csv, `svsu_${activeTab}_records_${new Date().toISOString().split('T')[0]}.csv`);
    toast.success('Report downloaded');
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  const handleScanSuccess = async (decodedText: string) => {
    setIsScannerOpen(false);
    setIsVerifying(true);
    toast.info('Verifying Student Identity...');

    try {
      // Extract ID from URL if it's a URL
      let url = `/api/admin/verify?id=${decodedText}`;
      if (decodedText.includes('?p=')) {
        url = `/api/admin/verify?id=${decodedText.split('?p=')[1]}`;
      } else if (decodedText.startsWith('{') && decodedText.includes('signature')) {
        url = `/api/admin/verify?qr=${encodeURIComponent(decodedText)}`;
      }

      const res = await fetch(url);
      const profile = await res.json();

      if (res.ok) {
        setVerifyingProfile(profile);
      } else {
        toast.error(profile.error || 'Student not found');
      }
    } catch (err) {
      toast.error('Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleAuthorizeEntry = async () => {
    if (!verifyingProfile) return;
    
    try {
      const res = await fetch('/api/entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          profileId: verifyingProfile.id,
          vehicleNo: verifyingProfile.vehicleNo 
        })
      });
      
      if (res.ok) {
        toast.success(`Entry Authorized for ${verifyingProfile.name}`);
        setVerifyingProfile(null);
        fetchData(search, selectedDate);
      } else {

        const err = await res.json();
        toast.error(err.error || 'Entry failed');
      }
    } catch (err) {
      toast.error('Network error');
    }
  };

  useEffect(() => {
    fetchData(search, selectedDate, 1, false);
    setHistoryPage(1);
    const interval = setInterval(() => {
      fetchData(search, selectedDate, 1, false);
    }, 5000); // 5s refresh for quick updates
    return () => clearInterval(interval);
  }, [search, selectedDate]);


  // Activity Monitor (Notifications for exits)
  useEffect(() => {
    const totalRecords = data.activeVehicles.length + data.exitedVehicles.length;
    if (lastActivityCount > 0 && totalRecords > lastActivityCount) {
       // Check if there was a new exit
       const latestExit = data.exitedVehicles[0];
       if (latestExit && (new Date().getTime() - new Date(latestExit.exitTime).getTime()) < 10000) {
         toast(`Vehicle Out: ${latestExit.vehicleNo}`, {
           icon: '🚗',
           description: `${latestExit.profile?.name || 'Visitor'} has left the campus.`
         });
       }
    }
    setLastActivityCount(totalRecords);
  }, [data]);

  const isOverstayed = (entryTime: string) => {
    const entry = new Date(entryTime);
    const now = new Date();
    return (now.getTime() - entry.getTime()) > (8 * 60 * 60 * 1000);
  };

  if (loading && !data.stats.totalToday) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Shield className="w-12 h-12 text-[color:var(--accent)]" />
        </motion.div>
        <p className="text-neutral-500 font-medium animate-pulse">Initializing Guard Dashboard...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground p-4 md:p-8 pt-24 md:pt-28 relative overflow-hidden transition-colors duration-500">
      <QRScanner 
        isOpen={isScannerOpen} 
        onClose={() => setIsScannerOpen(false)} 
        onScanSuccess={handleScanSuccess} 
      />

      <QRGenerator 
        isOpen={isQROpen} 
        onClose={() => setIsQROpen(false)} 
      />

      <VisitorForm 
        isOpen={isVisitorOpen}
        onClose={() => setIsVisitorOpen(false)}
        onSuccess={() => fetchData(search, selectedDate)}
      />



      <VerificationModal 
        profile={verifyingProfile} 
        onClose={() => setVerifyingProfile(null)} 
        onAuthorize={handleAuthorizeEntry}
      />

      {isVerifying && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <Smartphone className="w-12 h-12 text-[color:var(--accent)] animate-bounce" />
            <p className="text-white font-bold animate-pulse">Scanning Database...</p>
          </div>
        </div>
      )}

      {/* Background Glow */}
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-accent/10 rounded-full blur-[150px] -z-10" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-600/5 rounded-full blur-[150px] -z-10" />

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto space-y-8 pb-20">
        {/* Top Header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-center justify-between w-full lg:w-auto">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl font-black tracking-tight flex items-center gap-3">
                  {data.guardBuildingName ? (
                    <>
                      <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
                        <Shield className="w-4 h-4 text-[color:var(--accent)]" />
                      </div>
                      {data.guardBuildingName} Portal
                    </>
                  ) : (
                    "Security Command"
                  )}
                </h1>
                <div className="flex items-center gap-2 text-foreground/50 text-[10px] font-bold uppercase tracking-widest mt-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  Active Session: {data.guardName || 'Security Officer'}
                </div>
              </div>
            </div>

            
            {/* Mobile Logout */}
            <button onClick={handleLogout} aria-label="Logout" className="p-3.5 bg-card/60 border border-border rounded-2xl lg:hidden">
              <LogOut className="w-5 h-5 text-neutral-400" />
            </button>
          </div>


          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <button 
              onClick={() => setIsScannerOpen(true)}
              className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-accent text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 shadow-xl shadow-accent/20 transition-all"
            >
              <QrCode className="w-4 h-4" />
              Scan QR
            </button>

            <button 
              onClick={() => setIsVisitorOpen(true)}
              className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-card/60 border border-border text-neutral-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-neutral-800 hover:text-white transition-all"
            >
              <Users className="w-4 h-4" />
              Visitor Entry
            </button>

            <div className="flex items-center gap-2 w-full lg:w-auto">
               <div className="relative flex-1 lg:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                <input 
                  type="text"
                  placeholder={data.guardBuildingName ? "Search Student / Name..." : "Search Vehicle / Name..."}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-foreground/5 border border-foreground/10 rounded-2xl pl-11 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all backdrop-blur-md text-sm"
                />
              </div>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                <input 
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-foreground/5 border border-foreground/10 rounded-2xl pl-11 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all backdrop-blur-md text-sm uppercase font-bold text-[10px] text-foreground"
                />
              </div>
              <button 
                onClick={handleExportData}
                className="p-3.5 bg-foreground/5 border border-foreground/10 rounded-2xl hover:bg-accent hover:text-white transition-all text-foreground/40"
                aria-label="Export History"
                title="Export History"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
            
            <button onClick={handleLogout} aria-label="Logout" className="p-3.5 bg-red-500/5 border border-red-500/10 rounded-2xl hover:bg-red-500 text-red-500 transition-all hidden lg:block" title="Logout">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={data.guardBuildingName ? <User className="w-5 h-5" /> : <Car className="w-5 h-5" />} label={data.guardBuildingName ? "Student Entries" : "Vehicle Entries"} value={data.stats.totalToday} color="blue" />
          <StatCard icon={<Users className="w-5 h-5" />} label="Currently Inside" value={data.stats.insideCount} color="green" />
          <StatCard icon={<Clock className="w-5 h-5" />} label="Overstayed" value={data.stats.overstayedCount} color="orange" trend={data.stats.overstayedCount > 0 ? "Warning" : "Clear"} />
          <div className="bg-card/80 border border-border rounded-3xl p-6 flex flex-col justify-center gap-2 backdrop-blur-md">
            <p className="text-neutral-500 text-[10px] font-black uppercase tracking-widest">Global Reports</p>
            <Link href="/admin/dashboard" className="flex items-center justify-between group hover:text-[color:var(--accent)] transition-colors">
              <span className="text-sm font-bold">Admin Core View</span>
              <ShieldCheck className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Records Display Area */}
        <div className="min-h-[500px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                  {activeTab === 'active' && <>{data.guardBuildingName ? <User className="w-5 h-5 text-[color:var(--accent)]" /> : <Car className="w-5 h-5 text-[color:var(--accent)]" />} Active {data.guardBuildingName ? "Entries" : "Vehicles"}</>}
                  {activeTab === 'temporary' && <><Users className="w-5 h-5 text-purple-400" /> Temporary Visitors</>}
                  {activeTab === 'exited' && <><Clock className="w-5 h-5 text-neutral-500" /> {data.guardBuildingName ? "Entry History" : "Exited History"}</>}
                </h2>
                
                <div className="flex items-center gap-3">
                  {activeTab === 'exited' && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-2xl">
                      <Calendar className="w-4 h-4 text-neutral-500" />
                      <input 
                        type="date" 
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="bg-transparent text-xs font-bold text-neutral-300 focus:outline-none"
                      />
                    </div>
                  )}
                  <span className="text-[10px] font-black bg-white/5 border border-white/10 px-3 py-1 rounded-full uppercase tracking-[0.2em]">
                    {activeTab === 'active' ? data.activeVehicles.length : activeTab === 'temporary' ? data.temporaryVisitors.length : data.exitedVehicles.length} Records
                  </span>
                </div>
              </div>

              
              {activeTab === 'active' && <RecordList items={data.activeVehicles || []} type="active" isOverstayed={isOverstayed} />}
              {activeTab === 'temporary' && <RecordList items={data.temporaryVisitors || []} type="temporary" />}
              {activeTab === 'exited' && (
                <>
                  <RecordList items={data.exitedVehicles || []} type="exited" />
                  {data.pagination && historyPage < data.pagination.totalPages && (
                    <div className="flex justify-center mt-8">
                      <button
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                        className="flex items-center gap-2 px-8 py-3 bg-card border border-border rounded-2xl text-sm font-bold hover:border-accent/40 transition-all disabled:opacity-50"
                      >
                        {loadingMore ? (
                          <span className="animate-spin w-4 h-4 border-2 border-accent border-t-transparent rounded-full" />
                        ) : (
                          <ChevronRight className="w-4 h-4 rotate-90" />
                        )}
                        Load More ({data.pagination.totalExited - data.exitedVehicles.length} remaining)
                      </button>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Fixed Bottom Navigation Dock */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-md px-6 z-50">
        <div className="bg-card/90 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-2 flex items-center justify-between shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)]">
          <DockItem 
            active={activeTab === 'active'} 
            onClick={() => setActiveTab('active')} 
            icon={data.guardBuildingName ? <User className="w-5 h-5" /> : <Car className="w-5 h-5" />} 
            label={data.guardBuildingName ? "Entries" : "Active"}
            count={data.activeVehicles?.length}
          />
          <DockItem 
            active={activeTab === 'temporary'} 
            onClick={() => setActiveTab('temporary')} 
            icon={<Users className="w-5 h-5" />} 
            label="Visitors"
            count={data.temporaryVisitors?.length}
          />
          <DockItem 
            active={activeTab === 'exited'} 
            onClick={() => setActiveTab('exited')} 
            icon={<Clock className="w-5 h-5" />} 
            label="History"
            count={data.exitedVehicles?.length}
          />
        </div>
      </div>
    </main>
  );
}

function StatCard({ icon, label, value, color, trend }: any) {
  const colors: any = {
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    green: 'text-green-400 bg-green-500/10 border-green-500/20',
    orange: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  };

  return (
    <div className="bg-card/80 border border-border rounded-3xl p-6 backdrop-blur-md">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${colors[color]}`}>
        {icon}
      </div>
      <p className="text-neutral-500 text-xs font-bold uppercase tracking-widest mb-1">{label}</p>
      <div className="flex items-end justify-between">
        <p className="text-3xl font-bold">{value}</p>
        {trend && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${trend === 'Warning' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}

function DockItem({ active, onClick, icon, label, count }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex-1 flex flex-col items-center gap-1 py-3 px-2 rounded-[2rem] transition-all relative ${active ? 'text-white' : 'text-neutral-500'}`}
    >
      {active && (
        <motion.div 
          layoutId="dock-active"
          className="absolute inset-0 bg-accent rounded-[2rem] -z-10"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
      <div className="relative">
        {icon}
        {count > 0 && (
          <span className={`absolute -top-2 -right-2 text-[8px] font-black px-1 rounded-md ${active ? 'bg-white text-[color:var(--accent)]' : 'bg-neutral-800 text-neutral-400'}`}>
            {count}
          </span>
        )}
      </div>
      <span className="text-[10px] font-black uppercase tracking-tighter">{label}</span>
    </button>
  );
}


function RecordList({ items, type, isOverstayed }: any) {
  if (items.length === 0) {
    return (
      <div className="bg-foreground/[0.03] border border-dashed border-border rounded-[2.5rem] flex flex-col items-center justify-center p-20 text-neutral-600">
        <Shield className="w-16 h-16 mb-4 opacity-10" />
        <p className="text-lg font-medium">No records found</p>
        <p className="text-sm">Real-time data will appear here.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item: any) => (
        <RecordCard 
          key={item.id} 
          item={item} 
          type={type} 
          overstay={isOverstayed && isOverstayed(item.entryTime)} 
        />
      ))}
    </div>
  );
}

function RecordCard({ item, type, overstay }: any) {
  const profile = item.profile || {};
  const isTemp = type === 'temporary' || item.isTemporary;

  return (
    <motion.div 
      layout
      className={`
        relative overflow-hidden bg-background border rounded-3xl p-5 group transition-all duration-300
        ${overstay ? 'border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.1)]' : 'border-border hover:border-accent/40'}
      `}
    >
      {overstay && (
        <div className="absolute top-0 right-0 p-2">
          <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${isTemp ? 'bg-purple-500/10 text-purple-400' : 'bg-accent/10 text-[color:var(--accent)]'}`}>
            {isTemp ? <Users className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
          </div>
          <div>
            <h3 className="font-bold text-neutral-100 truncate max-w-[140px]">
              {isTemp ? item.visitorName : profile.name}
            </h3>
            <p className="text-[10px] text-neutral-500 uppercase tracking-tighter">
              {isTemp ? 'Temporary Visitor' : 'Permanent Profile'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className={`font-mono font-bold text-sm ${overstay ? 'text-red-500' : 'text-[color:var(--accent)]'}`}>
            {item.vehicleNo || profile.vehicleNo}
          </p>
          <div className="text-[10px] text-neutral-500 flex items-center justify-end gap-1">
            <Clock className="w-3 h-3" />
            {new Date(item.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {isTemp ? (
          <div className="bg-card/60 rounded-xl p-3 space-y-1">
            <p className="text-[10px] text-neutral-500 font-bold uppercase">Purpose of Visit</p>
            <p className="text-xs text-neutral-300 line-clamp-2">{item.visitorPurpose || 'N/A'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-card/60 rounded-xl p-2">
              <p className="text-[10px] text-neutral-500 font-bold uppercase">Roll No</p>
              <p className="text-xs font-semibold">{profile.rollNo}</p>
            </div>
            <div className="bg-card/60 rounded-xl p-2">
              <p className="text-[10px] text-neutral-500 font-bold uppercase">Course</p>
              <p className="text-xs font-semibold truncate">{profile.course}</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-900">
        <div className="flex items-center gap-2">
          {item.visitorPhoto || profile.rcPhoto ? (
            <div className="w-6 h-6 rounded-full overflow-hidden bg-neutral-800">
               <Image 
                src={item.visitorPhoto || profile.rcPhoto} 
                alt="Profile" 
                width={24}
                height={24}
                className="w-full h-full object-cover" 
              />
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center">
              <Users className="w-3 h-3 text-neutral-600" />
            </div>
          )}
          <span className="text-[10px] text-neutral-500">View ID Card</span>
        </div>
        
        {type !== 'exited' && (
          <button 
            onClick={async () => {
              const res = await fetch('/api/exit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ entryId: item.id })
              });
              if (res.ok) toast.success('Exit Registered');
              else toast.error('Exit Failed');
            }}
            className="flex items-center gap-1 text-[10px] font-bold text-red-500 hover:text-red-400 transition-colors uppercase"
          >
            Register Exit
            <ChevronRight className="w-3 h-3" />
          </button>
        )}
        {type === 'exited' && (
           <span className="text-[10px] font-bold text-green-500 uppercase">
             Exited {new Date(item.exitTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
           </span>
        )}
      </div>
    </motion.div>
  );
}

function VerificationModal({ profile, onClose, onAuthorize }: any) {
  if (!profile) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-md bg-card border-2 border-border rounded-[3rem] overflow-hidden shadow-2xl relative"
        >
          {/* Header/Vehicle Number */}
          <div className="bg-accent p-6 text-center">
            <p className="text-[10px] text-white/60 font-black uppercase tracking-[0.2em] mb-1">Vehicle Verified</p>
            <h2 className="text-3xl font-black text-white tracking-widest uppercase">{profile.vehicleNo}</h2>
          </div>

          <div className="p-8 space-y-8">
            {/* User Photo */}
            <div className="flex justify-center">
              <div className="relative group">
                <div className="absolute inset-0 bg-accent/20 rounded-[2.5rem] blur-2xl group-hover:bg-accent/40 transition-all" />
                <div className="relative w-48 h-48 rounded-[2.5rem] border-4 border-border overflow-hidden bg-background">
                  {profile.profilePhoto ? (
                    <Image src={profile.profilePhoto} alt="Student" fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-neutral-800">
                      <User className="w-20 h-20 text-neutral-600" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* User Details */}
            <div className="bg-foreground/[0.03] border border-border rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-accent/10 rounded-2xl">
                  <User className="w-5 h-5 text-[color:var(--accent)]" />
                </div>
                <div>
                  <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">Full Name</p>
                  <p className="text-lg font-black text-white">{profile.name}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">Roll Number</p>
                  <p className="font-bold text-neutral-200">{profile.rollNo}</p>
                </div>
                <div>
                  <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">Semester</p>
                  <p className="font-bold text-neutral-200">{profile.semester || 'N/A'}</p>
                </div>
              </div>

              <div>
                <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">Faculty/Course</p>
                <p className="text-xs font-bold text-neutral-400 line-clamp-1">{profile.faculty || profile.course}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={onClose}
                className="flex-1 py-4 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2"
              >
                <X className="w-5 h-5" />
                Cancel
              </button>
              <button
                onClick={onAuthorize}
                className="flex-[2] py-4 bg-green-600 hover:bg-green-500 text-white font-black rounded-2xl shadow-xl shadow-green-500/20 transition-all flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-5 h-5" />
                Authorize Entry
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
