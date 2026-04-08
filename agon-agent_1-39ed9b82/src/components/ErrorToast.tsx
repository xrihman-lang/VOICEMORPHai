import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface ErrorToastProps {
  message: string | null;
  onClose: () => void;
}

export default function ErrorToast({ message, onClose }: ErrorToastProps) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl bg-accent-red/10 border border-accent-red/30 backdrop-blur-xl shadow-2xl max-w-[90vw]"
        >
          <AlertTriangle className="w-5 h-5 text-accent-red flex-shrink-0" />
          <p className="text-sm text-text-primary">{message}</p>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0">
            <X className="w-4 h-4 text-text-muted" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
