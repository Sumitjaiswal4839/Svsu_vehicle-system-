'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, FileText, MapPin, Camera, X, CheckCircle, Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';
import CameraCapture from './CameraCapture';
import { BUILDING_MAP } from '@/lib/building-logic';

export default function VisitorForm({ isOpen, onClose, onSuccess }: { isOpen: boolean, onClose: () => void, onSuccess?: () => void }) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    purpose: '',
    contact: '',
    buildingId: '',
    photo: '',
    isHackathon: false
  });

  const handleSubmit = async () => {
    if (!formData.name || !formData.purpose || !formData.buildingId) {
      return toast.error('Please fill name, purpose and building');
    }

    setLoading(true);
    try {
      const res = await fetch('/api/visitor/entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success('Visitor Entry Registered!');
        setStep(3);
        if (onSuccess) onSuccess();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Registration failed');
      }
    } catch (err) {
      toast.error('Connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl"
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-black">Visitor Pass</h2>
                  <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest">SVSU Access Control</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-neutral-800 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {step === 1 && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                      <input 
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-accent/40 outline-none"
                        placeholder="Guest Name"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Purpose of Visit</label>
                    <div className="relative">
                      <FileText className="absolute left-4 top-4 w-4 h-4 text-neutral-500" />
                      <textarea 
                        value={formData.purpose}
                        onChange={e => {
                          const val = e.target.value;
                          setFormData({...formData, purpose: val, isHackathon: val.toLowerCase().includes('hackathon')});
                        }}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-accent/40 outline-none min-h-[100px]"
                        placeholder="Reason for entry..."
                      />
                    </div>
                    {formData.isHackathon && (
                       <div className="px-3 py-1 bg-purple-500/10 text-purple-400 text-[10px] font-black rounded-lg border border-purple-500/20 w-fit">
                         HACKATHON PARTICIPANT TAGGED
                       </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Destination Building</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                      <select 
                        value={formData.buildingId}
                        onChange={e => setFormData({...formData, buildingId: e.target.value})}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-accent/40 outline-none appearance-none font-bold"
                      >
                        <option value="">Select Building</option>
                        {BUILDING_MAP.map(b => (
                          <option key={b.code} value={b.code}>{b.name} ({b.code})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button 
                    onClick={() => setStep(2)}
                    className="w-full bg-accent hover:opacity-90 py-4 rounded-2xl font-black text-white shadow-xl shadow-accent/20 transition-all flex items-center justify-center gap-2"
                  >
                    Next: Capture Identity
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6 text-center">
                  <div className="relative w-48 h-48 mx-auto rounded-[2rem] border-4 border-neutral-800 overflow-hidden bg-neutral-950">
                    {formData.photo ? (
                      <img src={formData.photo} alt="Visitor" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-neutral-700">
                        <Camera className="w-12 h-12 mb-2" />
                        <p className="text-[10px] font-bold uppercase">Identity Required</p>
                      </div>
                    )}
                  </div>
                  
                  <CameraCapture 
                    facingMode="user"
                    onCapture={img => setFormData({...formData, photo: img})}
                  />

                  <div className="flex gap-3">
                    <button onClick={() => setStep(1)} className="flex-1 py-4 bg-neutral-800 rounded-2xl font-bold">Back</button>
                    <button 
                      onClick={handleSubmit}
                      disabled={loading || !formData.photo}
                      className="flex-[2] bg-green-600 hover:bg-green-500 py-4 rounded-2xl font-black text-white shadow-xl shadow-green-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Send className="w-4 h-4" />}
                      {loading ? 'Processing...' : 'Authorize Entry'}
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="text-center py-10 space-y-6">
                  <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto border border-green-500/30">
                    <CheckCircle className="w-12 h-12 text-green-500" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black">Access Granted</h3>
                    <p className="text-neutral-500">Visitor can now proceed to {formData.buildingId}.</p>
                  </div>
                  <button 
                    onClick={onClose}
                    className="w-full bg-neutral-800 hover:bg-neutral-700 py-4 rounded-2xl font-bold transition-all"
                  >
                    Finish
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
