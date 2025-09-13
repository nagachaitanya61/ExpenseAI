import React, { useRef, useEffect, useCallback } from 'react';
import { CameraIcon } from './icons/CameraIcon';
import { useTheme } from '../contexts/ThemeContext';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
}

export const CameraModal: React.FC<CameraModalProps> = ({ isOpen, onClose, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { accentColor } = useTheme();

  useEffect(() => {
    let stream: MediaStream | null = null;
    
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        alert("Could not access the camera. Please ensure you have given permission.");
        onClose();
      }
    };

    if (isOpen) {
      startCamera();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen, onClose]);

  const handleCapture = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        
        canvas.toBlob(blob => {
          if (blob) {
            const imageFile = new File([blob], 'receipt.png', { type: 'image/png' });
            onCapture(imageFile);
          }
        }, 'image/png');
      }
    }
  }, [onCapture]);
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 max-w-2xl w-full m-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Scan Receipt</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-800 dark:hover:text-white text-3xl">&times;</button>
        </div>
        
        <div className="relative bg-black rounded-lg overflow-hidden">
          <video ref={videoRef} autoPlay playsInline className="w-full h-auto" />
          <canvas ref={canvasRef} className="hidden" />
        </div>
        
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
           <button
            onClick={handleCapture}
            className={`w-full flex-1 ${accentColor.bg} text-white font-bold py-3 px-4 rounded-md ${accentColor.hoverBg} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 ${accentColor.focusRing} transition-colors flex items-center justify-center`}
          >
            <CameraIcon className="w-5 h-5 mr-2" />
            Capture Photo
          </button>
          <button
            onClick={onClose}
            className="w-full sm:w-auto bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white font-bold py-3 px-6 rounded-md hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};