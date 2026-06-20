'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, Download, RefreshCw, Send, Car } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function QRGenerator({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [vehicleNo, setVehicleNo] = useState('');
  const [qrValue, setQrValue] = useState('');

  const generateQR = () => {
    if (!vehicleNo) return;
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    setQrValue(`${baseUrl}/entry?v=${encodeURIComponent(vehicleNo.toUpperCase())}`);
  };

  const downloadQR = () => {
    const svg = document.getElementById('vehicle-qr');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width + 40;
      canvas.height = img.height + 40;
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 20, 20);
      }
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `QR_${vehicleNo.toUpperCase()}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-2xl bg-card border border-border p-8 rounded-[2rem] shadow-2xl overflow-y-auto max-h-[90vh]"
          >
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 bg-neutral-800 hover:bg-neutral-700 rounded-full text-neutral-400 hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className="p-2.5 bg-accent/20 rounded-xl">
                <QrCode className="w-6 h-6 text-[color:var(--accent)]" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Quick QR Generator</h3>
                <p className="text-xs text-neutral-500 uppercase tracking-widest font-bold">Gate Pass Issuance</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Vehicle Number</label>
                  <div className="relative">
                    <Car className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <input
                      type="text"
                      value={vehicleNo}
                      onChange={(e) => setVehicleNo(e.target.value)}
                      placeholder="UP 81 AB 1234"
                      className="w-full bg-background border border-border rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all uppercase font-mono font-bold"
                    />
                  </div>
                </div>
                <button
                  onClick={generateQR}
                  className="w-full bg-accent hover:opacity-90 text-white py-4 rounded-2xl font-black shadow-lg shadow-accent/20 transition-all flex items-center justify-center gap-2 group"
                >
                  Create Pass
                  <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              <AnimatePresence mode="wait">
                {qrValue ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex flex-col items-center gap-4"
                  >
                    <div className="p-6 bg-white rounded-3xl shadow-[0_0_40px_rgba(37,99,235,0.2)] border-4 border-accent/20 relative group">
                      <QRCodeSVG id="vehicle-qr" value={qrValue} size={180} />
                      <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-[1.2rem]" />
                    </div>
                    <div className="text-center">
                      <p className="text-neutral-100 font-mono font-bold text-lg tracking-widest">{vehicleNo.toUpperCase()}</p>
                      <button
                        onClick={downloadQR}
                        className="mt-2 flex items-center gap-2 text-[color:var(--accent)] hover:text-white text-xs font-bold uppercase transition-colors"
                      >
                        <Download className="w-3 h-3" />
                        Save as Image
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <div className="h-full min-h-[220px] flex flex-col items-center justify-center border-2 border-dashed border-border rounded-3xl text-neutral-700">
                    <RefreshCw className="w-10 h-10 mb-4 opacity-10" />
                    <p className="text-xs font-bold uppercase tracking-widest">Waiting for input</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

