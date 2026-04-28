'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, X, CheckCircle2, AlertCircle, RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function QRScanner({ onScanSuccess, isOpen, onClose }: QRScannerProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure the container is rendered
      const timer = setTimeout(() => {
        scannerRef.current = new Html5QrcodeScanner(
          "reader",
          { 
            fps: 10, 
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
          },
          /* verbose= */ false
        );

        scannerRef.current.render(
          (decodedText) => {
            setSuccess(decodedText);
            onScanSuccess(decodedText);
            // Auto-close after success
            setTimeout(() => {
              handleClose();
            }, 1500);
          },
          (errorMessage) => {
            // Silently ignore errors during scanning unless they are critical
          }
        );
      }, 300);

      return () => {
        if (scannerRef.current) {
          scannerRef.current.clear().catch(e => console.error("Failed to clear scanner", e));
        }
        clearTimeout(timer);
      };
    }
  }, [isOpen]);

  const handleClose = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(e => console.error("Failed to clear scanner", e));
    }
    setSuccess(null);
    setError(null);
    onClose();
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
            className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-[2.5rem] overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-800 bg-neutral-950/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent/20 rounded-xl">
                  <QrCode className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">QR Scanner</h3>
                  <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">Scanning for entry/exit</p>
                </div>
              </div>
              <button 
                onClick={handleClose}
                className="p-2 hover:bg-neutral-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-neutral-500" />
              </button>
            </div>

            {/* Scanner Area */}
            <div className="p-6">
              <div className="relative aspect-square rounded-3xl overflow-hidden bg-black border border-neutral-800 shadow-inner">
                {!success && <div id="reader" className="w-full h-full"></div>}
                
                {success && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 flex flex-col items-center justify-center bg-green-500/10 backdrop-blur-sm"
                  >
                    <div className="p-4 bg-green-500 rounded-full shadow-[0_0_30px_rgba(34,197,94,0.5)] mb-4">
                      <CheckCircle2 className="w-12 h-12 text-white" />
                    </div>
                    <p className="text-green-500 font-black uppercase tracking-widest text-sm">QR Verified</p>
                    <p className="text-neutral-400 text-xs mt-2">{success}</p>
                  </motion.div>
                )}

                {!success && (
                   <div className="absolute inset-0 pointer-events-none">
                     <div className="absolute inset-0 border-[2px] border-accent/20 m-12 rounded-3xl" />
                     <motion.div 
                        animate={{ top: ['20%', '80%', '20%'] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute left-12 right-12 h-[2px] bg-accent shadow-[0_0_15px_rgba(37,99,235,0.8)]"
                     />
                   </div>
                )}
              </div>

              <div className="mt-6 flex flex-col items-center text-center">
                <div className="flex items-center gap-2 text-neutral-500 text-xs mb-4">
                  <RefreshCcw className="w-3 h-3 animate-spin-slow" />
                  Align the QR code within the frame to scan
                </div>
                
                <div className="w-full p-4 bg-neutral-950 border border-neutral-800 rounded-2xl flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-accent shrink-0" />
                  <p className="text-[10px] text-neutral-400 text-left leading-relaxed">
                    Scanner handles both permanent vehicle IDs and temporary visitor passes. 
                    Authorization is logged instantly.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
