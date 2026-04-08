import { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileAudio, X } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

export default function FileUpload({ onFileSelect, isProcessing }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('audio/')) {
        setSelectedFile(file);
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setSelectedFile(file);
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const clearFile = () => {
    setSelectedFile(null);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {!selectedFile ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`relative flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer
              ${
                dragActive
                  ? 'border-accent-cyan bg-accent-cyan/5'
                  : 'border-border hover:border-accent-cyan/40 bg-bg-secondary/50'
              }`}
          >
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isProcessing}
            />
            <motion.div
              animate={dragActive ? { scale: 1.1, y: -5 } : { scale: 1, y: 0 }}
              className="p-3 rounded-xl bg-bg-card"
            >
              <Upload className="w-8 h-8 text-accent-cyan" />
            </motion.div>
            <div className="text-center">
              <p className="text-text-primary font-medium">Drop audio file here or click to browse</p>
              <p className="text-text-muted text-sm mt-1">MP3, WAV, OGG, M4A supported</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="file"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-4 p-4 rounded-2xl border border-border bg-bg-secondary/50"
          >
            <div className="p-3 rounded-xl bg-accent-cyan/10">
              <FileAudio className="w-6 h-6 text-accent-cyan" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-text-primary font-medium truncate">{selectedFile.name}</p>
              <p className="text-text-muted text-sm">{formatSize(selectedFile.size)}</p>
            </div>
            {!isProcessing && (
              <button
                onClick={clearFile}
                className="p-2 rounded-lg hover:bg-bg-card transition-colors"
              >
                <X className="w-4 h-4 text-text-muted" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
