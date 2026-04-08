import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, AlertTriangle } from 'lucide-react';

interface LiveCountdownProps {
  /** Expiry timestamp in ms */
  expiresAt: number;
  /** Total duration in ms (for progress bar) */
  totalDuration: number;
  /** Color accent */
  color?: string;
  /** Label shown before timer */
  label?: string;
  /** Called when timer hits zero */
  onExpired?: () => void;
  /** Compact mode for inline use */
  compact?: boolean;
}

export default function LiveCountdown({
  expiresAt,
  totalDuration,
  color = '#00e5ff',
  label = 'Time Remaining',
  onExpired,
  compact = false,
}: LiveCountdownProps) {
  const [now, setNow] = useState(Date.now());
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (current >= expiresAt && !expired) {
        setExpired(true);
        onExpired?.();
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, expired, onExpired]);

  const remaining = Math.max(0, expiresAt - now);
  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
  const percentage = Math.max(0, Math.min(100, (remaining / totalDuration) * 100));
  const isUrgent = remaining < 10 * 60 * 1000; // less than 10 min
  const isCritical = remaining < 2 * 60 * 1000; // less than 2 min

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (expired) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl border border-accent-red/30 bg-accent-red/8 ${compact ? '' : 'w-full'}`}
      >
        <AlertTriangle className="w-5 h-5 text-accent-red flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-bold text-accent-red">Time Expired!</p>
          <p className="text-xs text-text-muted">Upgrade to Pro to continue using premium features</p>
        </div>
      </motion.div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <motion.div
          animate={isCritical ? { scale: [1, 1.15, 1] } : undefined}
          transition={isCritical ? { duration: 1, repeat: Infinity } : undefined}
        >
          <Clock className="w-3.5 h-3.5" style={{ color: isCritical ? '#ff1744' : isUrgent ? '#ffb300' : color }} />
        </motion.div>
        <span
          className="text-sm font-mono font-bold tabular-nums"
          style={{ color: isCritical ? '#ff1744' : isUrgent ? '#ffb300' : color }}
        >
          {pad(hours)}:{pad(minutes)}:<AnimatedDigit value={pad(seconds)} color={isCritical ? '#ff1744' : isUrgent ? '#ffb300' : color} />
        </span>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Label + Timer */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-text-muted font-medium">{label}</span>
        <div className="flex items-center gap-1.5">
          <motion.div
            animate={isCritical ? { scale: [1, 1.2, 1], opacity: [1, 0.5, 1] } : isUrgent ? { opacity: [1, 0.6, 1] } : undefined}
            transition={isCritical || isUrgent ? { duration: 1, repeat: Infinity } : undefined}
          >
            <Clock className="w-3.5 h-3.5" style={{ color: isCritical ? '#ff1744' : isUrgent ? '#ffb300' : color }} />
          </motion.div>
          <span
            className="text-lg font-mono font-bold tabular-nums tracking-wider"
            style={{ color: isCritical ? '#ff1744' : isUrgent ? '#ffb300' : color }}
          >
            {pad(hours)}:{pad(minutes)}:<AnimatedDigit value={pad(seconds)} color={isCritical ? '#ff1744' : isUrgent ? '#ffb300' : color} />
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 rounded-full bg-bg-card overflow-hidden">
        <motion.div
          className="h-full rounded-full transition-colors duration-500"
          style={{
            width: `${percentage}%`,
            backgroundColor: isCritical ? '#ff1744' : isUrgent ? '#ffb300' : color,
          }}
          layout
        />
      </div>

      {/* Urgency message */}
      <AnimatePresence>
        {isUrgent && !isCritical && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="text-[10px] text-accent-amber mt-1.5 flex items-center gap-1"
          >
            <AlertTriangle className="w-3 h-3" /> Less than 10 minutes remaining!
          </motion.p>
        )}
        {isCritical && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="text-[10px] text-accent-red mt-1.5 flex items-center gap-1"
          >
            <AlertTriangle className="w-3 h-3" /> Expiring soon! Upgrade now to keep access
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Single digit with flip animation */
function AnimatedDigit({ value, color }: { value: string; color: string }) {
  return (
    <span className="inline-block relative">
      <AnimatePresence mode="popLayout">
        <motion.span
          key={value}
          initial={{ y: -8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 8, opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          style={{ color }}
          className="inline-block"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
