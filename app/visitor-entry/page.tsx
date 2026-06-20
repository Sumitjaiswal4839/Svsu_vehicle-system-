'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Users, 
  User, 
  Phone, 
  ClipboardList, 
  Camera, 
  CheckCircle2, 
  ArrowLeft,
  Car,
  MapPin
} from 'lucide-react';
import CameraCapture from '@/components/CameraCapture';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { BUILDING_MAP } from '@/lib/building-logic';
import { isValidVehicleNumber, formatVehicleNumber } from '@/lib/validation';


export default function VisitorEntryPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    visitorName: '',
    visitorPurpose: '',
    visitorContact: '',
    vehicleNo: '',
    visitorPhoto: '',
    buildingId: '',
    isHackathon: false,
    isTemporary: true
  });


  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: value,
      isHackathon: name === 'visitorPurpose' ? value.toLowerCase().includes('hackathon') : prev.isHackathon
    }));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Vehicle number validation (optional field but validate if provided)
    if (formData.vehicleNo && !isValidVehicleNumber(formData.vehicleNo)) {
      toast.error('Invalid vehicle number format. Use format: HR 26 AB 1234');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/visitor/entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.visitorName,
          purpose: formData.visitorPurpose,
          contact: formData.visitorContact,
          photo: formData.visitorPhoto,
          buildingId: formData.buildingId,
          vehicleNo: formData.vehicleNo ? formatVehicleNumber(formData.vehicleNo) : undefined,
          isHackathon: formData.isHackathon
        }),
      });


      const data = await response.json();

      if (response.ok) {
        toast.success('Visitor registered successfully!');
        router.push('/admin'); // Redirect back to dashboard
      } else {
        toast.error(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Failed to connect to the server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-neutral-100 p-4 md:p-8 flex flex-col pt-28 pb-12 relative">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.1),transparent_50%)] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="z-10 w-full max-w-2xl bg-card/80 border border-border p-6 md:p-10 rounded-[2.5rem] shadow-2xl backdrop-blur-2xl my-auto mx-auto"
      >
        <Link href="/admin" className="flex items-center gap-2 text-neutral-500 hover:text-[color:var(--accent)] mb-8 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-semibold">Back to Dashboard</span>
        </Link>
        
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-accent/20 rounded-2xl border border-accent/30 shadow-[0_0_20px_rgba(37,99,235,0.2)]">
            <Users className="w-8 h-8 text-[color:var(--accent)]" />
          </div>
          <div>
            <h2 className="text-3xl font-bold">Visitor Entry</h2>
            <p className="text-neutral-500">Register temporary guest or admission query</p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-neutral-500 ml-1">Visitor Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  required
                  type="text"
                  name="visitorName"
                  value={formData.visitorName}
                  onChange={handleChange}
                  placeholder="E.g. Rajesh Kumar"
                  className="w-full bg-background border border-border rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-neutral-500 ml-1">Contact Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  required
                  type="tel"
                  name="visitorContact"
                  value={formData.visitorContact}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  className="w-full bg-background border border-border rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-neutral-500 ml-1">Purpose of Visit</label>
            <div className="relative">
              <ClipboardList className="absolute left-4 top-4 w-4 h-4 text-neutral-500" />
              <textarea
                required
                name="visitorPurpose"
                value={formData.visitorPurpose}
                onChange={handleChange}
                placeholder="Admission Query, Delivery, Guest Visit, etc."
                rows={3}
                className="w-full bg-background border border-border rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all"
              />
            </div>
            {formData.isHackathon && (
               <div className="px-3 py-1 bg-purple-500/10 text-purple-400 text-[10px] font-black rounded-lg border border-purple-500/20 w-fit mt-2">
                 HACKATHON PARTICIPANT TAGGED
               </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-neutral-500 ml-1">Destination Building</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <select
                required
                name="buildingId"
                value={formData.buildingId}
                onChange={handleChange}
                className="w-full bg-background border border-border rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all appearance-none font-bold"
              >
                <option value="">Select Building</option>
                {BUILDING_MAP.map(b => (
                  <option key={b.code} value={b.code}>{b.name} ({b.code})</option>
                ))}
              </select>
            </div>
          </div>


          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-neutral-500 ml-1">Vehicle No. (Optional)</label>
            <div className="relative">
              <Car className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="text"
                name="vehicleNo"
                value={formData.vehicleNo}
                onChange={handleChange}
                placeholder="E.g. HR 26 AB 1234"
                className="w-full bg-background border border-border rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all uppercase"
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-xs font-bold uppercase tracking-widest text-neutral-500 ml-1">Photo Identification (Mandatory)</label>
            {!capturedImage ? (
              <div className="bg-background border border-border rounded-[2rem] p-4">
                <CameraCapture onCapture={(img) => {
                  setCapturedImage(img);
                  setFormData(prev => ({ ...prev, visitorPhoto: img }));
                }} />
              </div>
            ) : (
              <div className="relative group">
                <img 
                  src={capturedImage} 
                  alt="Captured" 
                  className="w-full h-64 object-cover rounded-[2rem] border border-accent/40 shadow-lg" 
                />
                <button
                  type="button"
                  onClick={() => setCapturedImage(null)}
                  className="absolute top-4 right-4 p-3 bg-red-600/80 hover:bg-red-600 text-white rounded-full transition-all shadow-xl backdrop-blur-md"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="absolute bottom-4 left-4 bg-green-500/80 text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 backdrop-blur-md">
                  <CheckCircle2 className="w-4 h-4" />
                  Photo Captured
                </div>
              </div>
            )}
          </div>

          <button
            disabled={isSubmitting || !capturedImage}
            type="submit"
            className="w-full bg-accent hover:opacity-90 text-white font-bold py-3 md:py-4 rounded-2xl shadow-xl shadow-accent/20 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-4 flex items-center justify-center gap-3"
          >
            {isSubmitting ? (
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Users className="w-6 h-6" />
              </motion.div>
            ) : <Users className="w-6 h-6" />}
            {isSubmitting ? 'Registering Visitor...' : 'Authorize Entry'}
          </button>
        </form>
      </motion.div>
    </main>
  );
}
