'use client';

import { useRef, useState, useCallback } from 'react';

interface CameraCaptureProps {
  onCapture: (base64Image: string) => void;
  facingMode?: 'user' | 'environment';
}

export default function CameraCapture({ onCapture, facingMode = 'environment' }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const startCamera = async () => {
    try {
      // Stop any existing tracks first
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
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        // Explicitly set muted to help with autoplay policies
        videoRef.current.muted = true;
        
        // Wait for video to be ready before playing
        videoRef.current.onloadedmetadata = async () => {
          try {
            await videoRef.current?.play();
            console.log('Camera started successfully');
          } catch (e) {
            console.error("Video play failed:", e);
          }
        };
      }
      setIsCameraOpen(true);
    } catch (err) {
      console.error('Error accessing camera:', err);
      alert('Camera access denied. Please allow camera permissions in your browser settings.');
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
      
      // Safety check for blank image
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        alert('Camera is not ready yet. Please try again in a second.');
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL('image/jpeg', 0.8); // 0.8 quality for better compression
        onCapture(base64);
        stopCamera();
      }
    }
  };

  return (
    <div className="space-y-4">
      {!isCameraOpen ? (
        <button
          type="button"
          onClick={startCamera}
          className="w-full py-4 bg-neutral-900 border border-neutral-800 rounded-2xl text-sm font-bold hover:bg-neutral-800 transition-all flex items-center justify-center gap-3 text-neutral-400 group"
        >
          <div className="p-2 bg-accent/10 rounded-lg group-hover:bg-accent/20 transition-colors">
            <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          Activate Camera
        </button>
      ) : (
        <div className="relative rounded-[2rem] overflow-hidden border border-neutral-800 bg-black shadow-2xl">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-auto aspect-video object-cover"
          />
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 px-4">
            <button
              type="button"
              onClick={stopCamera}
              className="px-4 py-2 bg-neutral-900/80 backdrop-blur text-sm rounded-full border border-neutral-700 hover:bg-neutral-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={capturePhoto}
              className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg transform active:scale-90 transition-transform"
            >
              <div className="w-10 h-10 border-2 border-black rounded-full" />
            </button>
          </div>
        </div>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
