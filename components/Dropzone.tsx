import React, { useCallback, useRef, useState } from 'react';
import { UploadIcon } from './Icons';

interface DropzoneProps {
  onFileSelect: (file: File) => void;
}

export const Dropzone: React.FC<DropzoneProps> = ({ onFileSelect }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.match(/^image\/(png|jpeg|jpg)$/)) {
        onFileSelect(file);
      } else {
        alert("Only JPG and PNG files are supported.");
      }
    }
  }, [onFileSelect]);

  const handleInputCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        onFileSelect(e.target.files[0]);
    }
  }

  return (
    <div 
      className={`
        w-full h-[400px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center
        transition-all duration-300 ease-in-out cursor-pointer group relative overflow-hidden
        ${isDragOver 
            ? 'border-accent bg-accent/10 shadow-[0_0_30px_rgba(56,189,248,0.2)]' 
            : 'border-gray-600 bg-surface hover:bg-gray-800 hover:border-gray-500'
        }
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input 
        type="file" 
        className="hidden" 
        ref={inputRef} 
        accept="image/png, image/jpeg, image/jpg"
        onChange={handleInputCheck}
      />
      
      <div className="z-10 flex flex-col items-center gap-4 p-8 text-center transition-transform group-hover:scale-105 duration-300">
        <div className={`p-4 rounded-full ${isDragOver ? 'bg-accent/20 text-accent' : 'bg-gray-700 text-gray-400'}`}>
            <UploadIcon className="w-8 h-8" />
        </div>
        <div>
            <h3 className="text-xl font-bold text-gray-100 mb-2">Upload Image</h3>
            <p className="text-gray-400 text-sm max-w-xs mx-auto">
                Drag & drop your .jpg or .png here, or click to browse.
            </p>
        </div>
      </div>
      
      {/* Background grid animation effect */}
      <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
    </div>
  );
};