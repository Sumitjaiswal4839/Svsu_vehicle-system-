'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
import { toast } from 'sonner';

interface DashboardData {
  activeVehicles: any[];
  exitedVehicles: any[];
  temporaryVisitors: any[];
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
  stats: {
    totalToday: 0,
    insideCount: 0,
    overstayedCount: 0,
  },
};

type TabType = 'active' | 'exited' | 'temporary';

export default function GuardDashboard() {
  const [data, setData] = useState<DashboardData>(EMPTY_DASHBOARD);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [verifyingProfile, setVerifyingProfile] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [lastActivityCount, setLastActivityCount] = useState(0);

  const fetchData = async (currentSearch: string) => {
    try {
      const res = await fetch(`/api/dashboard?search=${encodeURIComponent(currentSearch)}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Failed to load dashboard data');
      setData(json);
    } catch (err) {
      console.error(err);
      toast.error('Could not sync dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleScanSuccess = async (decodedText: string) => {
    setIsScannerOpen(false);
    setIsVerifying(true);
    toast.info('Verifying Student Identity...');

    try {
      // Extract ID from URL if it's a URL
      let profileId = decodedText;
      if (decodedText.includes('?p=')) {
        profileId = decodedText.split('?p=')[1];
      }

      const res = await fetch(`/api/admin/verify?id=${profileId}`);
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
        fetchData(search);
      } else {
        const err = await res.json();
        toast.error(err.error || 'Entry failed');
      }
    } catch (err) {
      toast.error('Network error');
    }
  };

  useEffect(() => {
    fetchData(search);
    const interval = setInterval(() => {
      fetchData(search);
    }, 5000); // 5s refresh for quick updates
    return () => clearInterval(interval);
  }, [search]);

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
    return (now.getTime() - entry.getTime()) > (12 * 60 * 60 * 1000);
  };

  if (loading && !data.stats.totalToday) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Shield className="w-12 h-12 text-accent" />
        </motion.div>
        <p className="text-neutral-500 font-medium animate-pulse">Initializing Guard Dashboard...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0c] text-neutral-100 p-4 md:p-8 relative overflow-hidden">
      <QRScanner 
        isOpen={isScannerOpen} 
        onClose={() => setIsScannerOpen(false)} 
        onScanSuccess={handleScanSuccess} 
      />

      <VerificationModal 
        profile={verifyingProfile} 
        onClose={() => setVerifyingProfile(null)} 
        onAuthorize={handleAuthorizeEntry}
      />

      {isVerifying && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <Smartphone className="w-12 h-12 text-accent animate-bounce" />
            <p className="text-white font-bold animate-pulse">Scanning Database...</p>
          </div>
        </div>
      )}

      {/* Background Glow */}
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-accent/10 rounded-full blur-[150px] -z-10" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-600/5 rounded-full blur-[150px] -z-10" />

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-accent/20 rounded-2xl border border-accent/30 shadow-[0_0_20px_rgba(37,99,235,0.2)]">
              <Shield className="w-8 h-8 text-accent" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">
                Guard Control Center
              </h1>
              <div className="flex items-center gap-2 text-neutral-500 text-sm">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Live Security Feed • SVSU Campus
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <button 
              onClick={() => setIsScannerOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-2xl font-bold hover:opacity-90 shadow-lg shadow-accent/20 transition-all"
            >
              <QrCode className="w-5 h-5" />
              Quick Scan
            </button>

            <Link
              href="/admin/gate-qr"
              className="flex items-center gap-2 px-6 py-3 bg-neutral-900/50 border border-neutral-800 text-neutral-400 rounded-2xl font-bold hover:bg-neutral-800 hover:text-white transition-all"
            >
              <Printer className="w-5 h-5" />
              Print Signs
            </Link>


            <div className="relative flex-1 lg:flex-none">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input 
                type="text" 
                placeholder="Search vehicles, names..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full lg:w-64 bg-neutral-900/50 border border-neutral-800 rounded-2xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all backdrop-blur-md"
              />
            </div>
            <button 
              onClick={() => {
                document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                window.location.href = '/login';
              }}
              className="p-3 bg-neutral-900/50 border border-neutral-800 rounded-2xl hover:bg-red-500/10 hover:border-red-500/30 text-neutral-400 hover:text-red-500 transition-all group"
            >
              <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </header>


        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            icon={<Car className="w-5 h-5" />} 
            label="Total Entries Today" 
            value={data.stats.totalToday} 
            color="blue" 
          />
          <StatCard 
            icon={<Users className="w-5 h-5" />} 
            label="Currently Inside" 
            value={data.stats.insideCount} 
            color="green" 
          />
          <StatCard 
            icon={<Clock className="w-5 h-5" />} 
            label="Overstayed (>12h)" 
            value={data.stats.overstayedCount} 
            color="orange" 
            trend={data.stats.overstayedCount > 0 ? "Warning" : "Clear"}
          />
          <div className="bg-neutral-900/40 border border-neutral-800 rounded-3xl p-6 flex flex-col justify-center gap-2 backdrop-blur-md">
            <p className="text-neutral-500 text-xs font-bold uppercase tracking-widest">Reports</p>
            <Link 
              href="/data/vehicle_logs.csv" 
              className="flex items-center justify-between group hover:text-accent transition-colors"
            >
              <span className="text-sm font-semibold">Download Audit Log</span>
              <Download className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* QR Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-accent/5 border border-accent/20 rounded-[2rem] overflow-hidden"
        >
          <div className="p-1">
            <QRGenerator />
          </div>
        </motion.div>

        {/* Tabs and Content */}
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2 p-1.5 bg-neutral-950 border border-neutral-800 rounded-2xl w-fit">
            <TabButton 
              active={activeTab === 'active'} 
              onClick={() => setActiveTab('active')} 
              icon={<Car className="w-4 h-4" />}
              label="Active Vehicles"
              count={data.activeVehicles?.length || 0}
            />
            <TabButton 
              active={activeTab === 'temporary'} 
              onClick={() => setActiveTab('temporary')} 
              icon={<Users className="w-4 h-4" />}
              label="Temporary Visitors"
              count={data.temporaryVisitors?.length || 0}
            />
            <TabButton 
              active={activeTab === 'exited'} 
              onClick={() => setActiveTab('exited')} 
              icon={<Clock className="w-4 h-4" />}
              label="Exited History"
              count={data.exitedVehicles?.length || 0}
            />
          </div>

          <div className="min-h-[500px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'active' && <RecordList items={data.activeVehicles || []} type="active" isOverstayed={isOverstayed} />}
                {activeTab === 'temporary' && <RecordList items={data.temporaryVisitors || []} type="temporary" />}
                {activeTab === 'exited' && <RecordList items={data.exitedVehicles || []} type="exited" />}
              </motion.div>
            </AnimatePresence>
          </div>
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
    <div className="bg-neutral-900/40 border border-neutral-800 rounded-3xl p-6 backdrop-blur-md">
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

function TabButton({ active, onClick, icon, label, count }: any) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all
        ${active 
          ? 'bg-accent text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]' 
          : 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-900'
        }
      `}
    >
      {icon}
      {label}
      <span className={`
        text-[10px] px-1.5 py-0.5 rounded-md font-bold
        ${active ? 'bg-white/20 text-white' : 'bg-neutral-800 text-neutral-500'}
      `}>
        {count}
      </span>
    </button>
  );
}

function RecordList({ items, type, isOverstayed }: any) {
  if (items.length === 0) {
    return (
      <div className="bg-neutral-950/50 border border-dashed border-neutral-800 rounded-[2.5rem] flex flex-col items-center justify-center p-20 text-neutral-600">
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
        relative overflow-hidden bg-neutral-950 border rounded-3xl p-5 group transition-all duration-300
        ${overstay ? 'border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.1)]' : 'border-neutral-800 hover:border-accent/40'}
      `}
    >
      {overstay && (
        <div className="absolute top-0 right-0 p-2">
          <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${isTemp ? 'bg-purple-500/10 text-purple-400' : 'bg-accent/10 text-accent'}`}>
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
          <p className={`font-mono font-bold text-sm ${overstay ? 'text-red-500' : 'text-accent'}`}>
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
          <div className="bg-neutral-900/50 rounded-xl p-3 space-y-1">
            <p className="text-[10px] text-neutral-500 font-bold uppercase">Purpose of Visit</p>
            <p className="text-xs text-neutral-300 line-clamp-2">{item.visitorPurpose || 'N/A'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-neutral-900/50 rounded-xl p-2">
              <p className="text-[10px] text-neutral-500 font-bold uppercase">Roll No</p>
              <p className="text-xs font-semibold">{profile.rollNo}</p>
            </div>
            <div className="bg-neutral-900/50 rounded-xl p-2">
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
               <img 
                src={item.visitorPhoto || profile.rcPhoto} 
                alt="Profile" 
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
          className="w-full max-w-md bg-neutral-900 border-2 border-neutral-800 rounded-[3rem] overflow-hidden shadow-2xl relative"
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
                <div className="relative w-48 h-48 rounded-[2.5rem] border-4 border-neutral-800 overflow-hidden bg-neutral-950">
                  {profile.profilePhoto ? (
                    <img src={profile.profilePhoto} alt="Student" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-neutral-800">
                      <User className="w-20 h-20 text-neutral-600" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* User Details */}
            <div className="bg-neutral-950/50 border border-neutral-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-accent/10 rounded-2xl">
                  <User className="w-5 h-5 text-accent" />
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
