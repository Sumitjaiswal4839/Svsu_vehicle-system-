'use client';

import { useRef, useState, useCallback } from 'react';

interface CameraCaptureProps {
  onCapture: (base64Image: string) => void;
}

export default function CameraCapture({ onCapture }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsCameraOpen(true);
    } catch (err) {
      console.error('Error accessing camera:', err);
      alert('Camera access denied or not available.');
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
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL('image/jpeg');
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
          className="w-full py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-sm font-medium hover:bg-neutral-700 transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Open Camera
        </button>
      ) : (
        <div className="relative rounded-2xl overflow-hidden border border-neutral-700 bg-black">
          <video
            ref={videoRef}
            autoPlay
            playsInline
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
