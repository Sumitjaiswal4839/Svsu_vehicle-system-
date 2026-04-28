'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Car, 
  FileCheck, 
  QrCode, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  Loader2,
  Camera,
  ShieldCheck,
  GraduationCap,
  Lock,
  ArrowLeft
} from 'lucide-react';
import CameraCapture from '@/components/CameraCapture';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isNew = searchParams.get('new') === 'true';
  const isEdit = searchParams.get('edit') === 'true';

  const [step, setStep] = useState(isNew || isEdit ? 1 : 0); // 0: Check Login, 1: Info, 2: Vehicle, 3: ID, 4: QR
  const [loading, setLoading] = useState(false);
  const [fetchingProfile, setFetchingProfile] = useState(!isNew);
  const [profile, setProfile] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    course: '',
    semester: '',
    faculty: '',
    rollNo: '',
    password: '',
    vehicleNo: '',
    license: '',
    rcPhoto: '',
    idCardFront: '',
    idCardBack: '',
    profilePhoto: ''
  });

  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [rcPreview, setRcPreview] = useState<string | null>(null);
  const [idFrontPreview, setIdFrontPreview] = useState<string | null>(null);
  const [idBackPreview, setIdBackPreview] = useState<string | null>(null);

  // Check if student is logged in
  useEffect(() => {
    if (!isNew || isEdit) {
      const checkAuth = async () => {
        try {
          const res = await fetch('/api/profile');
          if (res.ok) {
            const data = await res.json();
            setProfile(data);
            
            if (isEdit) {
              setFormData({
                name: data.name,
                course: data.course,
                semester: data.semester,
                faculty: data.faculty || '',
                rollNo: data.rollNo,
                password: '', // Don't pre-fill password for security
                vehicleNo: data.vehicleNo,
                license: data.license || '',
                rcPhoto: data.rcPhoto,
                idCardFront: data.idCardFront,
                idCardBack: data.idCardBack,
                profilePhoto: data.profilePhoto || ''
              });
              setRcPreview(data.rcPhoto);
              setIdFrontPreview(data.idCardFront);
              setIdBackPreview(data.idCardBack);
              setProfilePreview(data.profilePhoto || null);
              setStep(1);
            } else {
              router.push('/student/dashboard');
            }
          } else {
            router.push('/student-login');
          }
        } catch (err) {
          router.push('/student-login');
        } finally {
          setFetchingProfile(false);
        }
      };
      checkAuth();
    }
  }, [isNew, isEdit, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formData.name || !formData.rollNo || !formData.vehicleNo || !formData.rcPhoto || !formData.idCardFront || !formData.idCardBack || !formData.password || !formData.faculty || !formData.semester || !formData.course || !formData.profilePhoto) {
      toast.error('Please fill all mandatory fields including Profile Photo');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(isEdit ? 'Profile updated successfully!' : 'Profile registered! Please login.');
        router.push(isEdit ? '/student/dashboard' : '/student-login');
      } else {
        toast.error(data.error || 'Failed to save profile');
      }
    } catch (err) {
      toast.error('Connection error');
    } finally {
      setLoading(false);
    }
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

  if (fetchingProfile) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-accent animate-spin mb-4" />
        <p className="text-neutral-500 font-bold uppercase tracking-widest text-xs">Securing Session...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0c] text-neutral-100 p-4 md:p-8 flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />

      <div className="z-10 w-full max-w-xl">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-neutral-900/40 border border-neutral-800 p-8 rounded-[2.5rem] backdrop-blur-2xl shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-accent/20 rounded-2xl border border-accent/30">
                    <User className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-black">{isEdit ? 'Update Profile' : 'New Registration'}</h1>
                    <p className="text-neutral-500 text-xs uppercase tracking-widest font-bold">Step 1 of 3</p>
                  </div>
                </div>
                <button onClick={() => router.push(isEdit ? '/student/dashboard' : '/student-login')} className="text-neutral-500 hover:text-white transition-colors">
                  <ArrowLeft className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Full Name</label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="E.g. Sumit Bhardwaj"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all"
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Profile Photo (Selfie)</label>
                  <div className="flex items-center gap-6">
                    <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-neutral-800 bg-neutral-950 flex-shrink-0">
                      {profilePreview ? (
                        <img src={profilePreview} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="w-8 h-8 text-neutral-800" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <CameraCapture 
                        facingMode="user"
                        onCapture={(img) => {
                          setProfilePreview(img);
                          setFormData(prev => ({ ...prev, profilePhoto: img }));
                        }} 
                      />
                      <p className="text-[10px] text-neutral-500 mt-2 italic">* Required for security verification</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Roll Number</label>
                    <input
                      name="rollNo"
                      value={formData.rollNo}
                      onChange={handleChange}
                      placeholder="2100..."
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Set Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Faculty</label>
                  <select
                    name="faculty"
                    value={formData.faculty}
                    onChange={handleChange}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all appearance-none"
                  >
                    <option value="">Select Faculty</option>
                    <option value="Skill Faculty of Engineering & Technology">Skill Faculty of Engineering & Technology</option>
                    <option value="Skill Faculty of Applied Sciences & Humanities">Skill Faculty of Applied Sciences & Humanities</option>
                    <option value="Skill Faculty of Management Studies & Research">Skill Faculty of Management Studies & Research</option>
                    <option value="Skill Faculty of Agriculture">Skill Faculty of Agriculture</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Course</label>
                    <input
                      name="course"
                      value={formData.course}
                      onChange={handleChange}
                      placeholder="B.Tech CS"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Semester</label>
                    <select
                      name="semester"
                      value={formData.semester}
                      onChange={handleChange}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all appearance-none"
                    >
                      <option value="">Select Semester</option>
                      {[1,2,3,4,5,6,7,8].map(sem => (
                        <option key={sem} value={`${sem}${sem === 1 ? 'st' : sem === 2 ? 'nd' : sem === 3 ? 'rd' : 'th'}`}>{sem}{sem === 1 ? 'st' : sem === 2 ? 'nd' : sem === 3 ? 'rd' : 'th'} Sem</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  onClick={() => setStep(2)}
                  className="w-full bg-accent hover:opacity-90 text-white font-black py-5 rounded-2xl shadow-xl shadow-accent/20 mt-4 flex items-center justify-center gap-2 group transition-all"
                >
                  Continue to Vehicle Details
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-neutral-900/40 border border-neutral-800 p-8 rounded-[2.5rem] backdrop-blur-2xl shadow-2xl"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-purple-500/20 rounded-2xl border border-purple-500/30">
                  <Car className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <h1 className="text-2xl font-black">Vehicle Verification</h1>
                  <p className="text-neutral-500 text-xs uppercase tracking-widest font-bold">Step 2 of 3</p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Vehicle Number</label>
                  <input
                    name="vehicleNo"
                    value={formData.vehicleNo}
                    onChange={handleChange}
                    placeholder="HR 26 AB 1234"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all uppercase font-mono font-bold"
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">RC Photo (Mandatory)</label>
                  {!rcPreview ? (
                    <div className="bg-neutral-950 border border-neutral-800 rounded-[2rem] p-4">
                      <CameraCapture 
                        facingMode="environment"
                        onCapture={(img) => {
                          setRcPreview(img);
                          setFormData(prev => ({ ...prev, rcPhoto: img }));
                        }} 
                      />
                    </div>
                  ) : (
                    <div className="relative group">
                      <img src={rcPreview} alt="RC" className="w-full h-48 object-cover rounded-[2rem] border border-accent/40 shadow-lg" />
                      <button onClick={() => setRcPreview(null)} className="absolute top-4 right-4 p-2 bg-red-600 rounded-full text-white shadow-xl">
                        <Camera className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex gap-4 mt-8">
                  <button onClick={() => setStep(1)} className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-5 rounded-2xl transition-all">Back</button>
                  <button
                    disabled={!rcPreview}
                    onClick={() => setStep(3)}
                    className="flex-[2] bg-accent hover:opacity-90 text-white font-black py-5 rounded-2xl shadow-xl shadow-accent/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    Next: ID Cards
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-neutral-900/40 border border-neutral-800 p-8 rounded-[2.5rem] backdrop-blur-2xl shadow-2xl"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-blue-500/20 rounded-2xl border border-blue-500/30">
                  <ShieldCheck className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h1 className="text-2xl font-black">Identity Verification</h1>
                  <p className="text-neutral-500 text-xs uppercase tracking-widest font-bold">Step 3 of 3</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* ID Front */}
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">College ID Card (Front)</label>
                  {!idFrontPreview ? (
                    <div className="bg-neutral-950 border border-neutral-800 rounded-[2rem] p-4">
                      <CameraCapture 
                        facingMode="environment"
                        onCapture={(img) => {
                          setIdFrontPreview(img);
                          setFormData(prev => ({ ...prev, idCardFront: img }));
                        }} 
                      />
                    </div>
                  ) : (
                    <div className="relative group">
                      <img src={idFrontPreview} alt="ID Front" className="w-full h-40 object-cover rounded-[2rem] border border-accent/40 shadow-lg" />
                      <button onClick={() => setIdFrontPreview(null)} className="absolute top-4 right-4 p-2 bg-red-600 rounded-full text-white">
                        <Camera className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* ID Back */}
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">College ID Card (Back)</label>
                  {!idBackPreview ? (
                    <div className="bg-neutral-950 border border-neutral-800 rounded-[2rem] p-4">
                      <CameraCapture 
                        facingMode="environment"
                        onCapture={(img) => {
                          setIdBackPreview(img);
                          setFormData(prev => ({ ...prev, idCardBack: img }));
                        }} 
                      />
                    </div>
                  ) : (
                    <div className="relative group">
                      <img src={idBackPreview} alt="ID Back" className="w-full h-40 object-cover rounded-[2rem] border border-accent/40 shadow-lg" />
                      <button onClick={() => setIdBackPreview(null)} className="absolute top-4 right-4 p-2 bg-red-600 rounded-full text-white">
                        <Camera className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex gap-4 mt-8">
                  <button onClick={() => setStep(2)} className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-5 rounded-2xl transition-all">Back</button>
                  <button
                    disabled={loading || !idFrontPreview || !idBackPreview}
                    onClick={handleSave}
                    className="flex-[2] bg-accent hover:opacity-90 text-white font-black py-5 rounded-2xl shadow-xl shadow-accent/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                    {loading ? 'Processing...' : 'Complete Registration'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 0 && profile && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-neutral-900/40 border border-neutral-800 p-10 rounded-[3rem] backdrop-blur-2xl shadow-2xl text-center"
            >
              <div className="flex flex-col items-center mb-8">
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-4 border border-green-500/30 overflow-hidden relative">
                  {profile?.profilePhoto ? (
                    <img src={profile.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <CheckCircle2 className="w-10 h-10 text-green-500" />
                  )}
                </div>
                <h1 className="text-3xl font-black mb-2">Gate Pass Active</h1>
                <p className="text-neutral-500 text-sm">Welcome, {profile.name}</p>
              </div>

              <div className="p-8 bg-white rounded-[2.5rem] shadow-2xl inline-block mb-8 relative group">
                <QRCodeSVG 
                  id="student-qr" 
                  value={`${window.location.origin}/entry?p=${profile.id}`} 
                  size={220} 
                  level="H"
                />
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex flex-col items-center">
                  <p className="text-2xl font-black text-neutral-100 uppercase tracking-tight">{profile.name}</p>
                  <p className="text-neutral-500 font-mono font-bold">{profile.rollNo} • {profile.vehicleNo}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={downloadQR}
                  className="w-full bg-neutral-950 border border-neutral-800 hover:border-accent/40 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all"
                >
                  <Download className="w-5 h-5" />
                  Save to Device
                </button>
                <button
                  onClick={() => {
                    document.cookie = "student_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                    router.push('/student-login');
                  }}
                  className="w-full text-red-500 text-xs font-bold uppercase tracking-widest transition-colors py-2"
                >
                  Logout Securely
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
export default function StudentProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0c] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-accent animate-spin mb-4" />
        <p className="text-neutral-500 font-bold uppercase tracking-widest text-xs">Loading Security Portal...</p>
      </div>
    }>
      <ProfileContent />
    </Suspense>
  );
}
