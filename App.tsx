import React, { useState, useEffect } from 'react';
import { Dropzone } from './components/Dropzone';
import { ComparisonSlider } from './components/ComparisonSlider';
import { ScissorsIcon, ZapIcon, MaximizeIcon, DownloadIcon, LoaderIcon, TrashIcon } from './components/Icons';
import { ProcessType, ImageFile, ProcessingState } from './types';
import { imageProcessor } from './services/antigravityService';

const App = () => {
  const [currentImage, setCurrentImage] = useState<ImageFile | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [processingState, setProcessingState] = useState<ProcessingState>({
    isProcessing: false,
    progress: 0,
    type: null,
    startTime: 0,
  });

  const handleFileSelect = (file: File) => {
    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setCurrentImage({
        file,
        previewUrl,
        width: img.width,
        height: img.height,
      });
      // Reset state on new file
      setProcessedUrl(null);
      setProcessingState({ isProcessing: false, progress: 0, type: null, startTime: 0 });
    };
    img.src = previewUrl;
  };

  const handleReset = () => {
    setCurrentImage(null);
    setProcessedUrl(null);
    setProcessingState({
      isProcessing: false,
      progress: 0,
      type: null,
      startTime: 0,
    });
  };

  const handleProcess = async (type: ProcessType) => {
    if (!currentImage || processingState.isProcessing) return;

    setProcessingState({
      isProcessing: true,
      progress: 0,
      type: type,
      startTime: Date.now(),
    });

    try {
      // Execute Image Processor Stack
      const resultBase64 = await imageProcessor.processImage(currentImage.file, type, (progress) => {
        setProcessingState(prev => ({ ...prev, progress }));
      });

      // Artificial Delay for UX if response is too fast (to show progress bar)
      if (Date.now() - processingState.startTime < 1000) {
        await new Promise(r => setTimeout(r, 800));
      }

      setProcessedUrl(resultBase64);
    } catch (error) {
      alert("An error occurred during processing. Please check console.");
      console.error(error);
    } finally {
      setProcessingState(prev => ({ ...prev, isProcessing: false, progress: 100 }));
    }
  };

  const handleDownload = () => {
    if (!processedUrl) return;
    const link = document.createElement('a');
    link.href = processedUrl;
    link.download = 'processed_image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex h-screen w-full bg-background text-gray-100 font-sans overflow-hidden">
      
      {/* Sidebar / Control Panel */}
      <aside className="w-64 bg-surface border-r border-gray-700 flex flex-col shadow-2xl z-20">
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent tracking-tighter">
            IMAGE PROCESSOR PRO
          </h1>
          <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest">AI Studio v2.0</p>
        </div>

        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* Actions */}
          <div className="space-y-4">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">AI Operations</h2>
            
            <button
              onClick={() => handleProcess(ProcessType.REMOVE_BG)}
              disabled={!currentImage || processingState.isProcessing}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 border border-transparent
                ${processingState.type === ProcessType.REMOVE_BG && processingState.isProcessing 
                    ? 'bg-primary/20 border-primary text-primary' 
                    : 'bg-gray-700/50 hover:bg-gray-700 text-gray-300 hover:text-white'}
                ${!currentImage ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <ScissorsIcon className="w-5 h-5" />
              <span className="font-medium">Remove Background</span>
            </button>

            <button
              onClick={() => handleProcess(ProcessType.UPSCALE_2X)}
              disabled={!currentImage || processingState.isProcessing}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 border border-transparent
                ${processingState.type === ProcessType.UPSCALE_2X && processingState.isProcessing 
                    ? 'bg-primary/20 border-primary text-primary' 
                    : 'bg-gray-700/50 hover:bg-gray-700 text-gray-300 hover:text-white'}
                ${!currentImage ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <ZapIcon className="w-5 h-5" />
              <span className="font-medium">Upscale 2x</span>
            </button>

             <button
              onClick={() => handleProcess(ProcessType.UPSCALE_4X)}
              disabled={!currentImage || processingState.isProcessing}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 border border-transparent
                ${processingState.type === ProcessType.UPSCALE_4X && processingState.isProcessing 
                    ? 'bg-primary/20 border-primary text-primary' 
                    : 'bg-gray-700/50 hover:bg-gray-700 text-gray-300 hover:text-white'}
                ${!currentImage ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <MaximizeIcon className="w-5 h-5" />
              <span className="font-medium">Upscale 4x</span>
            </button>
          </div>

          {/* Stats */}
          {currentImage && (
             <div className="pt-6 border-t border-gray-700">
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Input Properties</h2>
                <div className="bg-background rounded-lg p-3 text-xs space-y-2 text-gray-400">
                    <div className="flex justify-between">
                        <span>Resolution:</span>
                        <span className="text-gray-200">{currentImage.width} x {currentImage.height}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Format:</span>
                        <span className="text-gray-200">{currentImage.file.type.split('/')[1].toUpperCase()}</span>
                    </div>
                     <div className="flex justify-between">
                        <span>Size:</span>
                        <span className="text-gray-200">{(currentImage.file.size / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                </div>
             </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="p-6 border-t border-gray-700 bg-gray-900/50">
            <button 
                onClick={handleDownload}
                disabled={!processedUrl || processingState.isProcessing}
                className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all shadow-lg
                    ${!processedUrl 
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                        : 'bg-primary hover:bg-primaryHover text-white shadow-primary/25'}
                `}
            >
                <DownloadIcon className="w-5 h-5" />
                Descargar PNG
            </button>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-gray-700 flex items-center px-8 bg-surface/50 backdrop-blur-md z-10 justify-between">
            <div className="flex items-center gap-4">
                 <span className="text-sm font-medium text-gray-400">Workspace / </span>
                 <span className="text-sm font-semibold text-white">
                    {currentImage ? currentImage.file.name : 'No file selected'}
                 </span>
            </div>
            {processingState.isProcessing && (
                 <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-accent animate-pulse">
                        PROCESSING PIPELINE :: {processingState.type}
                    </span>
                    <LoaderIcon className="w-4 h-4 text-accent animate-spin" />
                 </div>
            )}
        </header>

        {/* Canvas Area */}
        <div className="flex-1 p-8 flex items-center justify-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-800 to-background">
            <div className="w-full max-w-5xl h-full flex flex-col justify-center">
                
                {/* Progress Bar Overlay */}
                {processingState.isProcessing && (
                    <div className="absolute top-0 left-0 w-full h-1 bg-gray-800 z-50">
                        <div 
                            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300 ease-out"
                            style={{ width: `${processingState.progress}%` }}
                        />
                    </div>
                )}

                {/* Viewport */}
                {!currentImage ? (
                    <Dropzone onFileSelect={handleFileSelect} />
                ) : (
                    <div className="relative w-full h-full flex flex-col">
                        {/* Toolbar above image to clear */}
                        <div className="flex justify-between items-center mb-4">
                           <h3 className="text-lg font-semibold text-gray-200">
                               {processedUrl ? 'Comparison View' : 'Original Preview'}
                           </h3>
                            <button 
                                onClick={handleReset}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-700/50 hover:bg-red-500/10 text-gray-400 hover:text-red-400 border border-gray-600 hover:border-red-500/50 transition-all text-xs font-medium"
                                disabled={processingState.isProcessing}
                            >
                                <TrashIcon className="w-4 h-4" />
                                <span>Reset Workspace</span>
                            </button>
                        </div>
                        
                        {/* Visualization */}
                        <div className="flex-1 relative min-h-0">
                             {!processedUrl ? (
                                 <div className="w-full h-full flex items-center justify-center bg-black/20 rounded-xl border border-gray-700 p-4">
                                     <img 
                                        src={currentImage.previewUrl} 
                                        className="max-w-full max-h-full object-contain shadow-2xl" 
                                        alt="Original" 
                                     />
                                 </div>
                             ) : (
                                 <ComparisonSlider 
                                    beforeImage={currentImage.previewUrl} 
                                    afterImage={processedUrl} 
                                 />
                             )}
                        </div>
                    </div>
                )}
            </div>
        </div>
      </main>
    </div>
  );
};

export default App;