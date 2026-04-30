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

  const handleLogout = () => {
    document.cookie = "student_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    toast.success('Logged out safely');
    router.push('/student-login');
  };

  const downloadQR = () => {
    const svg = document.getElementById('student-qr');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
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
        // Refresh profile to show new entry in history
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex flex-col items-center justify-center space-y-4">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <ShieldCheck className="w-12 h-12 text-accent" />
        </motion.div>
        <p className="text-neutral-500 font-bold uppercase tracking-widest text-[10px]">Verifying Security Access...</p>
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

      {processing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
           <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-12 h-12 text-accent animate-spin" />
              <p className="text-white font-black uppercase tracking-widest text-xs">Processing Entry...</p>
           </div>
        </div>
      )}
      {/* Background Glow */}
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[150px] -z-10" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-600/5 rounded-full blur-[150px] -z-10" />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div className="flex items-center gap-6">
            <Logo className="scale-110 origin-left" />
            <div className="w-[1px] h-10 bg-white/10 hidden md:block" />
            <div>
              <h1 className="text-3xl font-black tracking-tight">Student Portal</h1>
              <div className="flex items-center gap-2 text-neutral-500 text-sm font-medium mt-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                System Active • Secure Access
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsScannerOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 shadow-xl shadow-accent/20 transition-all"
            >
              <QrCode className="w-4 h-4" />
              Scan Gate QR
            </button>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-6 py-3 bg-neutral-900/50 border border-neutral-800 text-neutral-400 rounded-2xl font-bold hover:bg-red-500/10 hover:text-red-500 transition-all group"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Personal Info */}
          <div className="lg:col-span-7 space-y-8">
            <motion.section 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-neutral-900/40 border border-neutral-800 rounded-[2.5rem] p-8 backdrop-blur-xl"
            >
              <h2 className="text-xl font-bold mb-8 flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-accent" />
                Profile Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoItem label="Full Name" value={profile.name} icon={<User className="w-4 h-4" />} />
                <InfoItem label="Roll Number" value={profile.rollNo} icon={<ShieldCheck className="w-4 h-4" />} />
                <InfoItem label="Course" value={profile.course} icon={<CreditCard className="w-4 h-4" />} />
                <InfoItem label="Current Semester" value={profile.semester || 'N/A'} icon={<Calendar className="w-4 h-4" />} />
                <InfoItem label="Vehicle No" value={profile.vehicleNo} icon={<Car className="w-4 h-4" />} />
                <InfoItem label="Last Login" value={new Date(profile.lastLogin).toLocaleDateString()} icon={<Clock className="w-4 h-4" />} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10 pt-8 border-t border-neutral-800">
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1">College ID Card (Front)</p>
                  <div className="relative overflow-hidden rounded-3xl border border-neutral-800 aspect-[1.6/1]">
                    <img src={profile.idCardFront} alt="ID Front" className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1">College ID Card (Back)</p>
                  <div className="relative overflow-hidden rounded-3xl border border-neutral-800 aspect-[1.6/1]">
                    <img src={profile.idCardBack} alt="ID Back" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-neutral-800 flex justify-between items-center">
                <div className="space-y-1">
                   <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Profile Status</p>
                   <p className="text-sm font-bold text-green-500">Fully Verified</p>
                </div>
                <Link 
                  href="/profile?edit=true"
                  className="px-6 py-3 bg-accent/10 border border-accent/30 text-accent rounded-2xl font-bold hover:bg-accent hover:text-white transition-all text-sm"
                >
                  Edit Profile Details
                </Link>
              </div>

            </motion.section>

            {/* Entry History */}
            <motion.section 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-neutral-900/40 border border-neutral-800 rounded-[2.5rem] p-8 backdrop-blur-xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold flex items-center gap-3">
                  <Clock className="w-5 h-5 text-accent" />
                  Recent Activity
                </h2>
                <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Last 5 Entries</span>
              </div>

              <div className="space-y-4">
                {profile.entries?.length > 0 ? (
                  profile.entries.map((entry: any) => (
                    <div key={entry.id} className="bg-neutral-950/50 border border-neutral-800 p-4 rounded-2xl flex items-center justify-between hover:border-accent/40 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-xl ${entry.exitTime ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'}`}>
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-bold">Campus Gate Access</p>
                          <p className="text-xs text-neutral-500">{new Date(entry.entryTime).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-xs font-black uppercase tracking-widest ${entry.exitTime ? 'text-green-500' : 'text-blue-500'}`}>
                          {entry.exitTime ? 'Completed' : 'Inside'}
                        </p>
                        {entry.exitTime && (
                          <p className="text-[10px] text-neutral-600">Exit: {new Date(entry.exitTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-neutral-600 italic text-sm">
                    No recent entry records found.
                  </div>
                )}
              </div>
            </motion.section>
          </div>

          {/* Right Column: Gate Pass QR */}
          <div className="lg:col-span-5">
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="sticky top-8 bg-accent rounded-[3rem] p-10 text-white shadow-[0_30px_60px_-15px_rgba(37,99,235,0.4)] overflow-hidden"
            >
              {/* Card Decoration */}
              <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-white/10 rounded-full blur-[80px]" />
              <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-black/10 rounded-full blur-[80px]" />

              <div className="relative z-10 flex flex-col items-center">
                <div className="flex items-center gap-3 mb-10">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/30">
                    <QrCode className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-lg font-black tracking-widest uppercase">Digital Gate Pass</p>
                </div>

                <div className="p-6 bg-white rounded-[2.5rem] shadow-2xl mb-8 group relative overflow-hidden">
                  <QRCodeSVG 
                    id="student-qr" 
                    value={`${window.location.origin}/entry?p=${profile.id}`} 
                    size={240} 
                    level="H"
                  />
                  <div className="absolute inset-0 bg-accent/90 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center p-8 text-center gap-3 cursor-pointer" onClick={downloadQR}>
                    <Download className="w-12 h-12 mb-2" />
                    <p className="font-black text-lg">Download Pass</p>
                    <p className="text-xs opacity-70">Save this QR to show at the gate for instant entry</p>
                  </div>
                </div>

                <div className="text-center space-y-1 mb-8">
                  <p className="text-2xl font-black uppercase tracking-tight">{profile.name}</p>
                  <p className="text-sm font-bold opacity-80 font-mono">{profile.rollNo} • {profile.vehicleNo}</p>
                </div>

                <div className="w-full bg-black/20 backdrop-blur-md rounded-2xl p-4 flex items-center justify-between border border-white/10">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 opacity-70" />
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">Pass Status</span>
                  </div>
                  <span className="text-xs font-black uppercase bg-white text-accent px-3 py-1 rounded-full">Validated</span>
                </div>

                <button 
                  onClick={downloadQR}
                  className="mt-8 flex items-center gap-2 text-sm font-black uppercase tracking-widest hover:translate-y-[-2px] transition-transform"
                >
                  <Download className="w-4 h-4" />
                  Save Image
                </button>
              </div>
            </motion.section>
          </div>
        </div>
      </div>
    </main>
  );
}

function InfoItem({ label, value, icon }: any) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest flex items-center gap-2 ml-1">
        {icon}
        {label}
      </p>
      <div className="bg-neutral-950/50 border border-neutral-800 rounded-2xl px-5 py-4 font-bold text-neutral-100">
        {value}
      </div>
    </div>
  );
}
