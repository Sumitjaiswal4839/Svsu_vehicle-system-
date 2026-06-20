'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Car, 
  Clock, 
  ShieldCheck, 
  LogOut, 
  QrCode, 
  Download, 
  ChevronRight,
  Loader2,
  Calendar,
  CreditCard,
  MapPin
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import QRScanner from '@/components/QRScanner';
import Logo from '@/components/Logo';

export default function StudentDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  const [activeTab, setActiveTab] = useState<'qr' | 'profile' | 'activity'>('qr');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/profile');
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        } else {
          router.push('/student-login');
        }
      } catch (err) {
        toast.error('Session error');
        router.push('/student-login');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [router]);

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        toast.success('Logged out successfully');
        router.push('/');
        router.refresh();
      } else {
        toast.error('Logout failed');
      }
    } catch (err) {
      toast.error('Connection error');
    }
  };

  const downloadQR = () => {
    const svg = document.getElementById('student-qr');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new window.Image();
    img.onload = () => {
      canvas.width = img.width + 80;
      canvas.height = img.height + 140;
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#2563eb';
        ctx.fillRect(0, 0, canvas.width, 60);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 20px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('SVSU GATE PASS', canvas.width/2, 40);
        ctx.drawImage(img, 40, 80);
        ctx.fillStyle = '#0a0a0c';
        ctx.font = 'bold 16px Inter, sans-serif';
        ctx.fillText(profile.name.toUpperCase(), canvas.width/2, img.height + 110);
        ctx.font = '14px Inter, sans-serif';
        ctx.fillStyle = '#666';
        ctx.fillText(`${profile.rollNo} • ${profile.vehicleNo}`, canvas.width/2, img.height + 130);
      }
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `GatePass_${profile.rollNo}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const handleScanSuccess = async (decodedText: string) => {
    setIsScannerOpen(false);
    if (decodedText !== "SVSU_GATE_ENTRY" && decodedText !== "SVSU_GATE_EXIT") {
      toast.error("Invalid Gate QR Code. Please scan the official SVSU Gate QR.");
      return;
    }

    setProcessing(true);
    const isEntry = decodedText === "SVSU_GATE_ENTRY";
    const endpoint = isEntry ? '/api/entry' : '/api/exit';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          profileId: profile.id,
          vehicleNo: profile.vehicleNo 
        })
      });

      if (res.ok) {
        toast.success(isEntry ? "Entry Registered Successfully!" : "Exit Registered Successfully!");
        const updated = await fetch('/api/profile').then(r => r.json());
        setProfile(updated);
      } else {
        const err = await res.json();
        toast.error(err.error || "Action Failed");
      }
    } catch (err) {
      toast.error("Connection Error");
    } finally {
      setProcessing(false);
    }
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
          <ShieldCheck className="w-12 h-12 text-[color:var(--accent)]" />
        </motion.div>
        <p className="text-neutral-500 font-bold uppercase tracking-widest text-[10px]">Verifying Security Access...</p>
      </div>
    );
  }


  return (
    <main className="min-h-screen bg-background text-foreground pb-28 pt-8 relative overflow-hidden flex flex-col transition-colors duration-500">
      <div className="watermark opacity-[0.03] grayscale" />
      <QRScanner isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} onScanSuccess={handleScanSuccess} />

      {processing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
           <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-12 h-12 text-[color:var(--accent)] animate-spin" />
              <p className="text-white font-black uppercase tracking-widest text-xs">Processing Entry...</p>
           </div>
        </div>
      )}




      {/* Main Content Area */}
      <div className="flex-1 max-w-lg mx-auto w-full px-6 overflow-y-auto custom-scrollbar">
        <AnimatePresence mode="wait">
          {activeTab === 'qr' && (
            <motion.div 
              key="qr"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="py-4"
            >
              <div className="w-full bg-accent rounded-[3rem] p-10 text-white shadow-[0_30px_60px_-15px_rgba(37,99,235,0.4)] overflow-hidden relative">
                <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-white/10 rounded-full blur-[80px]" />
                
                <div className="relative z-10 flex flex-col items-center">
                  <div className="flex items-center gap-3 mb-8">
                    <QrCode className="w-6 h-6 text-white" />
                    <p className="text-sm font-black tracking-widest uppercase">Digital Gate Pass</p>
                  </div>

                  <div className="p-6 bg-white rounded-[2.5rem] shadow-2xl mb-8 group relative cursor-pointer" onClick={downloadQR}>
                    <QRCodeSVG id="student-qr" value={`${window.location.origin}/entry?p=${profile.id}`} size={180} level="H" />
                    <div className="absolute inset-0 bg-accent/90 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center p-4 text-center rounded-[2.5rem]">
                      <Download className="w-8 h-8 text-white mb-2" />
                      <p className="font-bold text-sm">Download PNG</p>
                    </div>
                  </div>

                  <div className="text-center space-y-1 mb-8">
                    <p className="text-xl font-black uppercase tracking-tight">{profile.name}</p>
                    <p className="text-[10px] font-bold opacity-80 font-mono tracking-widest">{profile.rollNo}</p>
                  </div>

                  <div className="w-full bg-black/20 backdrop-blur-md rounded-2xl p-4 flex items-center justify-between border border-white/10">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-70">Security Validated</span>
                    </div>
                    <span className="text-[8px] font-black uppercase bg-white text-[color:var(--accent)] px-3 py-1 rounded-full">{profile.vehicleNo}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 grid grid-cols-2 gap-4">
                 <QuickStat 
                   icon={<MapPin className="w-4 h-4" />} 
                   label="Last Entry" 
                   value={
                     profile.entries?.[0]
                       ? new Date(profile.entries[0].entryTime).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
                       : 'No entries'
                   } 
                 />
                 <QuickStat 
                   icon={<Clock className="w-4 h-4" />} 
                   label="Total Entries" 
                   value={`${profile.entries?.length ?? 0} visits`} 
                 />
              </div>
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div 
              key="profile"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6 py-4"
            >
              <div className="bg-card/80 border border-border rounded-[2.5rem] p-8 backdrop-blur-xl">
                <div className="flex flex-col items-center mb-8">
                  <div className="w-24 h-24 rounded-full border-4 border-accent/20 mb-4 shadow-xl overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={profile.profilePhoto || '/placeholder-user.png'}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h2 className="text-xl font-black">{profile.name}</h2>
                  <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mt-1">{profile.rollNo}</p>
                </div>

                <div className="space-y-3">
                  <InfoItem label="Registration" value={profile.rollNo} icon={<ShieldCheck className="w-3 h-3" />} />
                  <InfoItem label="Course" value={profile.course} icon={<CreditCard className="w-3 h-3" />} />
                  <InfoItem label="Building" value={profile.buildingId || 'Unassigned'} icon={<MapPin className="w-3 h-3" />} />
                  <InfoItem label="Vehicle No" value={profile.vehicleNo} icon={<Car className="w-3 h-3" />} />
                </div>

                <div className="mt-6 flex justify-center">
                   <Link href="/profile?edit=true" className="text-[color:var(--accent)] text-[10px] font-black uppercase tracking-widest border-b border-accent/20 pb-1 hover:border-accent transition-all">Edit Profile Details</Link>
                </div>

                <button 
                  onClick={handleLogout}

                  className="w-full mt-8 py-4 bg-red-600/10 border border-red-600/20 text-red-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-600/20 transition-all flex items-center justify-center gap-3"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out Account
                </button>
              </div>

              <div className="bg-neutral-900/20 p-6 rounded-[2rem] border border-dashed border-border">
                 <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest text-center mb-4">Verification Documents</p>
                 <div className="flex gap-3">
                    <div className="flex-1 rounded-2xl border border-border overflow-hidden shadow-xl bg-black" style={{ aspectRatio: '16/9' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={profile.idCardFront}
                        alt="ID Card Front"
                        className="w-full h-full object-cover opacity-70 hover:opacity-100 transition-opacity"
                      />
                    </div>
                    <div className="flex-1 rounded-2xl border border-border overflow-hidden shadow-xl bg-black" style={{ aspectRatio: '16/9' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={profile.idCardBack}
                        alt="ID Card Back"
                        className="w-full h-full object-cover opacity-70 hover:opacity-100 transition-opacity"
                      />
                    </div>
                 </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'activity' && (
            <motion.div 
              key="activity"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="py-4"
            >
              <div className="bg-card/80 border border-border rounded-[2.5rem] p-8 backdrop-blur-xl">
                <h2 className="text-xl font-black mb-8 flex items-center gap-3 uppercase tracking-tighter">
                  <Clock className="w-6 h-6 text-[color:var(--accent)]" />
                  Entry Records
                </h2>
                <div className="space-y-4">
                  {profile.entries?.length > 0 ? (
                    profile.entries.map((entry: any) => (
                      <div key={entry.id} className="bg-foreground/[0.03] border border-border p-4 rounded-2xl flex items-center justify-between group hover:border-accent/30 transition-all">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${entry.exitTime ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'}`}>
                            <Car className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-white uppercase tracking-widest">Entry Registered</p>
                            <p className="text-[10px] text-neutral-500 uppercase font-bold">{new Date(entry.entryTime).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-[10px] font-black uppercase tracking-tight ${entry.exitTime ? 'text-green-500' : 'text-blue-500'}`}>
                            {entry.exitTime ? 'Completed' : 'Active'}
                          </p>
                          <p className="text-[10px] text-neutral-600 font-mono">{new Date(entry.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-20 text-neutral-700 text-[10px] font-black uppercase tracking-widest">No Activity Found</div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Premium Multi-Dock */}
      <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-6">
         <div className="bg-card/90 backdrop-blur-3xl border border-white/5 rounded-[3rem] px-4 py-2 flex items-center gap-4 shadow-[0_30px_100px_-15px_rgba(0,0,0,1)]">
            <DockItem active={activeTab === 'activity'} onClick={() => setActiveTab('activity')} icon={<Clock className="w-5 h-5" />} label="History" ariaLabel="View entry history" />
            
            {/* Center Primary Action: Scan QR */}
            <div className="relative -mt-10 px-2">
               <button 
                onClick={() => setIsScannerOpen(true)}
                aria-label="Scan gate QR code"
                className="w-16 h-16 bg-accent rounded-[2rem] flex items-center justify-center text-white shadow-[0_20px_40px_-10px_rgba(37,99,235,0.6)] hover:scale-105 active:scale-95 transition-all group"
               >
                  <div className="absolute inset-0 bg-accent rounded-[2rem] animate-ping opacity-20 group-hover:hidden" />
                  <QrCode className="w-7 h-7 relative z-10" />
               </button>
            </div>

            <DockItem active={activeTab === 'qr'} onClick={() => setActiveTab('qr')} icon={<CreditCard className="w-5 h-5" />} label="Pass" ariaLabel="View digital gate pass" />
            <DockItem active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} 
              icon={
                <div className={`w-6 h-6 rounded-full border ${activeTab === 'profile' ? 'border-white' : 'border-neutral-500'} overflow-hidden transition-all`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={profile.profilePhoto || '/placeholder-user.png'} alt="Profile" className="w-full h-full object-cover" />
                </div>
              } 
              label="Profile" 
              ariaLabel="View profile"
            />

         </div>
      </div>
    </main>
  );
}

function DockItem({ active, onClick, icon, label, ariaLabel }: any) {
  return (
    <button 
      onClick={onClick}
      aria-label={ariaLabel || label}
      className={`flex flex-col items-center gap-1 py-3 px-4 rounded-[2rem] transition-all relative ${active ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'}`}
    >
      {active && (
        <motion.div 
          layoutId="dock-indicator"
          className="absolute inset-0 bg-white/5 rounded-[2rem] -z-10"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
      {icon}
      <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
    </button>
  );
}

function InfoItem({ label, value, icon }: any) {
  return (
    <div className="flex items-center justify-between p-4 bg-foreground/[0.03] border border-border rounded-2xl group hover:border-accent/20 transition-all">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-card rounded-lg text-neutral-500 group-hover:text-[color:var(--accent)] transition-colors">{icon}</div>
        <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">{label}</span>
      </div>
      <span className="text-xs font-black text-white">{value}</span>
    </div>
  );
}

function QuickStat({ icon, label, value }: any) {
  return (
    <div className="bg-card/80 border border-border rounded-3xl p-5 flex flex-col items-center gap-2">
       <div className="w-8 h-8 rounded-xl bg-accent/10 text-[color:var(--accent)] flex items-center justify-center">{icon}</div>
       <p className="text-[8px] font-black text-neutral-500 uppercase tracking-widest">{label}</p>
       <p className="text-sm font-black text-white">{value}</p>
    </div>
  );
}

