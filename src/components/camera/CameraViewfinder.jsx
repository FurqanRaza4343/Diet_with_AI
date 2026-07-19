import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, X, RotateCcw } from 'lucide-react';

const CameraViewfinder = ({ onCapture, onClose }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [facingMode, setFacingMode] = useState('environment');
  const [error, setError] = useState(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  }, []);

  const startCamera = useCallback(async (mode) => {
    stopCamera();
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError(err.message || 'Camera access denied. Please allow camera permissions.');
    }
  }, [stopCamera]);

  useEffect(() => {
    startCamera(facingMode);
    return () => stopCamera();
  }, [facingMode, startCamera, stopCamera]);

  const capture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `camera_${Date.now()}.jpg`, { type: 'image/jpeg' });
        onCapture(file);
      }
    }, 'image/jpeg', 0.9);
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  return (
    <div className="relative bg-black rounded-2xl overflow-hidden" style={{ minHeight: 400 }}>
      {error ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6">
          <Camera size={48} className="mb-3 opacity-50" />
          <p className="text-sm text-center opacity-80">{error}</p>
          <button onClick={() => startCamera(facingMode)}
            className="mt-4 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition-colors">
            Try Again
          </button>
        </div>
      ) : (
        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
      )}
      <canvas ref={canvasRef} className="hidden" />

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent flex items-center justify-center gap-6">
        <button onClick={onClose}
          className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors">
          <X size={20} />
        </button>
        <button onClick={capture}
          className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center hover:scale-105 transition-transform">
          <div className="w-12 h-12 rounded-full bg-white" />
        </button>
        <button onClick={toggleCamera}
          className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors">
          <RotateCcw size={20} />
        </button>
      </div>
    </div>
  );
};

export default CameraViewfinder;
