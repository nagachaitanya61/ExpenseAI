import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CropIcon } from './icons/CropIcon';
import { useTheme } from '../contexts/ThemeContext';

interface Crop {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CropperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCrop: (file: File) => void;
  imageSrc: string;
}

export const CropperModal: React.FC<CropperModalProps> = ({ isOpen, onClose, onCrop, imageSrc }) => {
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [crop, setCrop] = useState<Crop>({ x: 0, y: 0, width: 0, height: 0 });
  const [isInteracting, setIsInteracting] = useState(false);
  const [interactionType, setInteractionType] = useState<'drag' | 'resize' | null>(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0, cropX: 0, cropY: 0, cropW: 0, cropH: 0 });
  const { accent, accentColor } = useTheme();

  const resetCrop = useCallback(() => {
    if (imageRef.current) {
        const { clientWidth, clientHeight } = imageRef.current;
        const width = clientWidth * 0.9;
        const height = clientHeight * 0.9;
        const x = (clientWidth - width) / 2;
        const y = (clientHeight - height) / 2;
        const newCrop = { x, y, width, height };
        setCrop(newCrop);
    }
  }, []);

  const handleImageLoad = useCallback(() => {
    resetCrop();
  }, [resetCrop]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>, type: 'drag' | 'resize') => {
    e.preventDefault();
    e.stopPropagation();
    setIsInteracting(true);
    setInteractionType(type);
    setStartPos({ x: e.clientX, y: e.clientY, cropX: crop.x, cropY: crop.y, cropW: crop.width, cropH: crop.height });
  };
  
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isInteracting || !interactionType || !imageRef.current || !containerRef.current) return;
    e.preventDefault();
    e.stopPropagation();

    const dx = e.clientX - startPos.x;
    const dy = e.clientY - startPos.y;
    const { clientWidth: imgWidth, clientHeight: imgHeight } = imageRef.current;
    
    let newCrop = { ...crop };

    if (interactionType === 'drag') {
        newCrop.x = Math.max(0, Math.min(startPos.cropX + dx, imgWidth - crop.width));
        newCrop.y = Math.max(0, Math.min(startPos.cropY + dy, imgHeight - crop.height));
    } else if (interactionType === 'resize') {
        newCrop.width = Math.max(50, Math.min(startPos.cropW + dx, imgWidth - crop.x));
        newCrop.height = Math.max(50, Math.min(startPos.cropH + dy, imgHeight - crop.y));
    }

    setCrop(newCrop);

  }, [isInteracting, interactionType, startPos, crop]);

  const handleMouseUp = useCallback(() => {
    setIsInteracting(false);
    setInteractionType(null);
  }, []);

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isOpen, handleMouseMove, handleMouseUp]);


  const handleConfirmCrop = async () => {
    if (!imageRef.current) return;

    const image = imageRef.current;
    const scaleX = image.naturalWidth / image.clientWidth;
    const scaleY = image.naturalHeight / image.clientHeight;

    const canvas = document.createElement('canvas');
    canvas.width = crop.width * scaleX;
    canvas.height = crop.height * scaleY;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );

    canvas.toBlob((blob) => {
      if (blob) {
        const croppedFile = new File([blob], 'receipt_cropped.png', { type: 'image/png' });
        onCrop(croppedFile);
      }
    }, 'image/png', 1);
  };
  
  if (!isOpen) return null;
  
  const accentRGB = accent === 'cyan' ? 'rgb(6 182 212)' : accent === 'indigo' ? 'rgb(99 102 241)' : 'rgb(236 72 153)';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 max-w-4xl w-full m-4 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CropIcon className={`w-6 h-6 ${accentColor.text}`}/>
            Crop Receipt
          </h2>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-3xl">&times;</button>
        </div>
        
        <div ref={containerRef} className="relative w-full h-[60vh] bg-gray-200 dark:bg-gray-900 rounded-lg flex items-center justify-center overflow-hidden">
          <img 
            ref={imageRef} 
            src={imageSrc} 
            onLoad={handleImageLoad}
            alt="Receipt to crop" 
            className="max-w-full max-h-full object-contain"
          />
          <div 
             className={`absolute border-2 border-dashed`}
             style={{ 
                borderColor: accentRGB,
                transform: `translate(${crop.x}px, ${crop.y}px)`, 
                width: crop.width, 
                height: crop.height,
                boxShadow: '0 0 0 9999px rgba(0,0,0,0.7)',
                cursor: isInteracting ? 'grabbing' : 'grab',
             }}
             onMouseDown={(e) => handleMouseDown(e, 'drag')}
          >
            <div 
                className={`absolute -bottom-1.5 -right-1.5 w-4 h-4 ${accentColor.bg} rounded-sm border-2 border-white dark:border-gray-800`}
                style={{ cursor: 'nwse-resize' }}
                onMouseDown={(e) => handleMouseDown(e, 'resize')}
            />
          </div>
        </div>
        
        <div className="mt-6 flex flex-col sm:flex-row justify-between gap-4">
            <div>
                <button
                    onClick={resetCrop}
                    className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white font-bold py-2 px-4 rounded-md hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
                >
                    Reset Crop
                </button>
            </div>
            <div className="flex gap-4">
                <button
                    onClick={onClose}
                    className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white font-bold py-2 px-4 rounded-md hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={handleConfirmCrop}
                    className={`bg-accent-600 text-white font-bold py-2 px-4 rounded-md hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-accent-500 transition-colors`}
                >
                    Confirm Crop & Analyze
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};