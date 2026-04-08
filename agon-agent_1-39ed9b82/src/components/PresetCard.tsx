import { motion } from 'framer-motion';
import type { VoicePreset, PresetConfig } from '../lib/audioEngine';

interface PresetCardProps {
  preset: VoicePreset;
  config: PresetConfig;
  isActive: boolean;
  onClick: () => void;
}

export default function PresetCard({ config, isActive, onClick }: PresetCardProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.04, y: -2 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`relative flex flex-col items-center gap-1.5 p-3 md:p-4 rounded-2xl border transition-all duration-300 cursor-pointer min-w-0
        ${
          isActive
            ? 'border-transparent bg-bg-card'
            : 'border-border bg-bg-secondary hover:border-border-active hover:bg-bg-card'
        }`}
      style={{
        boxShadow: isActive ? `0 0 25px ${config.color}30, 0 0 50px ${config.color}10` : 'none',
        borderColor: isActive ? `${config.color}60` : undefined,
      }}
    >
      {isActive && (
        <motion.div
          layoutId="activePreset"
          className="absolute inset-0 rounded-2xl"
          style={{ background: `linear-gradient(135deg, ${config.color}15, transparent)` }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      )}
      <span className="text-2xl md:text-3xl relative z-10">{config.icon}</span>
      <span
        className="text-[11px] md:text-sm font-semibold relative z-10 font-[var(--font-display)] truncate w-full text-center"
        style={{ color: isActive ? config.color : 'var(--color-text-secondary)' }}
      >
        {config.name}
      </span>
      {config.character ? (
        <span className="text-[9px] text-text-muted relative z-10 text-center leading-tight truncate w-full">
          {config.character}
        </span>
      ) : (
        <span className="text-[9px] text-text-muted relative z-10 text-center leading-tight truncate w-full">
          {config.description}
        </span>
      )}
    </motion.button>
  );
}
