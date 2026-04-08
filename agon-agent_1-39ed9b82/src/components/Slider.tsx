interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (value: number) => void;
  icon?: React.ReactNode;
}

export default function Slider({ label, value, min, max, step, unit = '', onChange, icon }: SliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon && <span className="text-accent-cyan">{icon}</span>}
          <span className="text-sm font-medium text-text-secondary">{label}</span>
        </div>
        <span className="text-sm font-mono text-accent-cyan font-semibold">
          {value.toFixed(2)}{unit}
        </span>
      </div>
      <div className="relative">
        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1.5 rounded-full bg-bg-secondary">
          <div
            className="h-full rounded-full"
            style={{
              width: `${percentage}%`,
              background: 'linear-gradient(90deg, var(--color-accent-cyan), var(--color-accent-magenta))',
            }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="slider-track relative z-10 w-full opacity-0 h-6 cursor-pointer"
          style={{ opacity: 0 }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white shadow-lg pointer-events-none z-20"
          style={{
            left: `calc(${percentage}% - 10px)`,
            boxShadow: '0 0 12px rgba(0, 229, 255, 0.5), 0 2px 8px rgba(0,0,0,0.3)',
          }}
        />
      </div>
    </div>
  );
}
