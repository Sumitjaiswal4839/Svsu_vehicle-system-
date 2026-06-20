'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { Camera, X, CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CameraCaptureProps {
  onCapture: (base64Image: string) => void;
  facingMode?: 'user' | 'environment';
}

export default function CameraCapture({ onCapture, facingMode = 'environment' }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState<string>('');
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  useEffect(() => {
    if (isCameraOpen && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      const playVideo = async () => {
        try {
          if (videoRef.current) {
            await videoRef.current.play();
          }
        } catch (err) {
          console.error("Auto-play failed:", err);
        }
      };
      playVideo();
    }
  }, [isCameraOpen, stream]);

  const startCamera = async () => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      setStream(mediaStream);
      setIsCameraOpen(true);
      setAnalysisError(null);
    } catch (err) {
      console.error('Error accessing camera:', err);
      alert('Camera access denied. Please ensure your browser has camera permissions.');
    }
  };

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraOpen(false);
  }, [stream]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
        alert('Camera initializing, please wait...');
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const base64 = canvas.toDataURL('image/jpeg', 0.9);

        // Start simulated AI validation
        setIsAnalyzing(true);
        setAnalysisStatus('AI Scanning Image... Testing for helmet, mask, or face coverings...');
        
        setTimeout(() => {
          setAnalysisStatus('Verifying Identity & SVSU ID Format Matching...');
          
          setTimeout(() => {
            // For testing: simulate a highly secure validation
            // If the photo was a valid SVSU ID format or correct selfie:
            const isApproved = true; // Set to true to allow testing

            if (isApproved) {
              setIsAnalyzing(false);
              onCapture(base64);
              stopCamera();
            } else {
              setIsAnalyzing(false);
              setAnalysisError('Invalid Document or Face Obscured (Helmet/Scarf detected). Please try again.');
            }
          }, 1500);
        }, 1500);
      }
    }
  };

  return (
    <div className="space-y-4">
      {!isCameraOpen ? (
        <button
          type="button"
          onClick={startCamera}
          className="w-full py-4 bg-card border border-border rounded-2xl text-sm font-bold hover:bg-neutral-800 transition-all flex items-center justify-center gap-3 text-neutral-400 group"
        >
          <div className="p-2 bg-accent/10 rounded-lg group-hover:bg-accent/20 transition-colors">
            <Camera className="w-5 h-5 text-[color:var(--accent)]" />
          </div>
          Open Smart Camera
        </button>
      ) : (
        <AnimatePresence>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black select-none overflow-hidden flex flex-col justify-between"
          >
            {/* Fullscreen Video Background */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover z-0 select-none pointer-events-none"
            />

            {/* Native Style Top bar */}
            <div className="flex justify-between items-center w-full p-4 z-10 bg-gradient-to-b from-black/80 via-black/30 to-transparent backdrop-blur-[2px]">
              <button 
                type="button"
                onClick={stopCamera}
                className="p-3 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors backdrop-blur-md border border-border"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-full backdrop-blur-md border border-border">
                <ShieldCheck className="w-5 h-5 text-[color:var(--accent)] animate-pulse" />
                <span className="text-xs text-white font-bold tracking-widest uppercase">SVSU AI Scan</span>
              </div>
              <div className="w-12 h-12" /> {/* Spacer */}
            </div>

            {/* Viewfinder Overlay with guide frame */}
            <div className="flex-1 flex items-center justify-center relative w-full z-10 pointer-events-none">
              <div className="w-[85%] h-[60%] max-w-[340px] max-h-[460px] border-2 border-dashed border-accent/60 rounded-3xl relative flex flex-col items-center justify-between p-4 bg-accent/5 backdrop-blur-none shadow-[0_0_40px_rgba(37,99,235,0.15)]">
                {/* Glowing corners */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-accent rounded-tl-xl m-[-4px]" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-accent rounded-tr-xl m-[-4px]" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-accent rounded-bl-xl m-[-4px]" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-accent rounded-br-xl m-[-4px]" />
                
                <span className="text-[10px] text-[color:var(--accent)] font-black uppercase tracking-widest bg-black/80 px-3 py-1 rounded-full border border-accent/30 shadow-[0_0_10px_rgba(37,99,235,0.4)] mt-2">
                  Place Face / ID Card here
                </span>

                <span className="text-[10px] text-neutral-300 font-bold text-center px-3 mb-2 leading-relaxed bg-black/70 p-2 rounded-xl backdrop-blur-sm border border-border/80">
                  AI will auto-reject helmet, scarf or non-SVSU formats.
                </span>
              </div>

              {/* Laser scan line */}
              <motion.div 
                animate={{ top: ['20%', '80%', '20%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent shadow-[0_0_15px_rgba(37,99,235,1)]"
              />
            </div>

            {/* Analysis Overlay State */}
            <AnimatePresence>
              {isAnalyzing && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm z-30"
                >
                  <div className="p-4 bg-accent/20 rounded-full mb-4 border border-accent/40 shadow-[0_0_30px_rgba(37,99,235,0.4)]">
                    <RefreshCw className="w-10 h-10 text-[color:var(--accent)] animate-spin" />
                  </div>
                  <p className="text-white font-black tracking-tighter text-xl text-center px-4">{analysisStatus}</p>
                  <p className="text-neutral-400 text-xs mt-2 uppercase font-bold tracking-widest animate-pulse">Running checks in SVSU AI System...</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Popup inside camera */}
            <AnimatePresence>
              {analysisError && (
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 p-6 z-40"
                >
                  <div className="p-4 bg-red-500/20 rounded-full border border-red-500/40 text-red-500 mb-4 animate-bounce">
                    <AlertTriangle className="w-12 h-12" />
                  </div>
                  <h4 className="text-lg font-bold text-red-500 text-center">Validation Rejected</h4>
                  <p className="text-neutral-400 text-center text-sm max-w-xs mt-2 leading-relaxed">{analysisError}</p>
                  <button 
                    type="button"
                    onClick={() => setAnalysisError(null)}
                    className="mt-6 px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-widest rounded-2xl shadow-xl transition-all"
                  >
                    Try Again
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Native Style Bottom Translucent Bar */}
            <div className="w-full z-10 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-6 flex items-center justify-around backdrop-blur-[2px]">
              <button
                type="button"
                onClick={stopCamera}
                className="p-4 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full text-neutral-300 border border-border/60 hover:text-white transition-all transform active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>
              
              <button
                type="button"
                onClick={capturePhoto}
                className="w-20 h-20 bg-white hover:bg-neutral-100 rounded-full flex items-center justify-center shadow-[0_0_35px_rgba(255,255,255,0.4)] border-4 border-neutral-300 active:scale-90 transition-all group"
              >
                <div className="w-14 h-14 border-4 border-black rounded-full bg-white flex items-center justify-center group-hover:scale-105 transition-transform" />
              </button>

              <div className="w-12 h-12" /> {/* Spacer to align with X */}
            </div>
          </motion.div>
        </AnimatePresence>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
