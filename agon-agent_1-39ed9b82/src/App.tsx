import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Play, Square, Download, Volume2, VolumeX, Radio, Waves, Crown, Lock } from 'lucide-react';
import { AudioEngine, PRESETS, PRESET_CATEGORIES, MicError, type VoicePreset, type VoiceSettings, type MicPermissionState, type PresetCategory } from './lib/audioEngine';
import { useAuth } from './lib/AuthContext';
import { canUsePreset, getMaxRecordingSeconds, getActivePlan, type PlanId } from './lib/subscription';
import WaveformVisualizer from './components/WaveformVisualizer';
import PresetCard from './components/PresetCard';
import Slider from './components/Slider';
import FileUpload from './components/FileUpload';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorToast from './components/ErrorToast';
import MicPermissionGuide from './components/MicPermissionGuide';
import AuthPage from './components/AuthPage';
import UserHeader from './components/UserHeader';
import SubscriptionPage from './components/SubscriptionPage';
import AdminPanel from './components/AdminPanel';


type AppTab = 'live' | 'upload';
type AppView = 'dashboard' | 'subscription' | 'admin';

// ─── Preset Section with Category Tabs ───────────────────────

function PresetSection({
  activePlan, isPro, settings, onPresetChange, onOpenSubscription,
}: {
  activePlan: PlanId; isPro: boolean; settings: VoiceSettings;
  onPresetChange: (preset: VoicePreset) => void; onOpenSubscription: () => void;
}) {
  const [category, setCategory] = useState<PresetCategory | 'all'>('all');

  const allPresets = Object.entries(PRESETS) as [VoicePreset, typeof PRESETS[VoicePreset]][];
  const filtered = category === 'all' ? allPresets : allPresets.filter(([, c]) => c.category === category);
  const animeCount = allPresets.filter(([, c]) => c.category !== 'classic').length;

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="mb-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-text-muted uppercase tracking-widest font-[var(--font-display)]">
          Voice Presets
        </h2>
        <div className="flex items-center gap-2">
          {!isPro && (
            <span className="text-[10px] text-text-muted flex items-center gap-1">
              <Lock className="w-3 h-3" /> {animeCount} anime voices require Pro
            </span>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        <button
          onClick={() => setCategory('all')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex-shrink-0
            ${category === 'all' ? 'bg-bg-card text-text-primary border border-border-active' : 'text-text-muted hover:text-text-secondary bg-bg-secondary/50 border border-transparent hover:border-border'}`}
        >
          🎭 All <span className="text-[9px] opacity-60">({allPresets.length})</span>
        </button>
        {PRESET_CATEGORIES.map((cat) => {
          const count = allPresets.filter(([, c]) => c.category === cat.id).length;
          const isActive = category === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex-shrink-0
                ${isActive ? 'text-text-primary border' : 'text-text-muted hover:text-text-secondary bg-bg-secondary/50 border border-transparent hover:border-border'}`}
              style={isActive ? { backgroundColor: `${cat.color}12`, borderColor: `${cat.color}30`, color: cat.color } : undefined}
            >
              {cat.icon} {cat.label} <span className="text-[9px] opacity-60">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Preset Grid */}
      <motion.div layout className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-3">
        <AnimatePresence mode="popLayout">
          {filtered.map(([key, config]) => {
            const locked = !canUsePreset(activePlan, key);
            return (
              <motion.div
                key={key}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="relative"
              >
                <PresetCard
                  preset={key}
                  config={config}
                  isActive={settings.preset === key}
                  onClick={() => onPresetChange(key)}
                />
                {locked && (
                  <div
                    className="absolute inset-0 rounded-2xl bg-bg-primary/60 backdrop-blur-[2px] flex flex-col items-center justify-center cursor-pointer z-10"
                    onClick={() => onOpenSubscription()}
                  >
                    <Lock className="w-4 h-4 text-accent-amber mb-1" />
                    <span className="text-[9px] font-bold text-accent-amber uppercase tracking-wider">Pro</span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* Anime character hint */}
      {category !== 'classic' && category !== 'all' && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 flex items-center gap-2 text-[10px] text-text-muted"
        >
          <span>💡</span>
          <span>
            {category === 'anime_hero' && 'Energetic & cool voices inspired by anime protagonists'}
            {category === 'dark_villain' && 'Deep, raspy & intimidating villain voices'}
            {category === 'soft_emotional' && 'Calm, gentle & emotional character voices'}
            {category === 'mysterious' && 'Monotone & deep mysterious character voices'}
          </span>
        </motion.div>
      )}
    </motion.section>
  );
}

function Dashboard({ onOpenSubscription }: { onOpenSubscription: () => void }) {
  const { user } = useAuth();
  const engineRef = useRef<AudioEngine | null>(null);
  const [tab, setTab] = useState<AppTab>('live');
  const [micActive, setMicActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analyserData, setAnalyserData] = useState<Uint8Array | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [micErrorCode, setMicErrorCode] = useState<string | null>(null);
  const [micErrorMessage, setMicErrorMessage] = useState<string | null>(null);
  const [showPermGuide, setShowPermGuide] = useState(false);
  const [permState, setPermState] = useState<MicPermissionState>('unknown');
  const [micLoading, setMicLoading] = useState(false);
  const [settings, setSettings] = useState<VoiceSettings>({
    pitch: 1.0,
    speed: 1.0,
    preset: 'robot',
  });
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const processedAudioRef = useRef<HTMLAudioElement | null>(null);
  const recordedAudioRef = useRef<HTMLAudioElement | null>(null);

  const activePlan: PlanId = user ? getActivePlan(user.id) : 'free';
  const isPro = activePlan !== 'free';
  const maxRecSeconds = getMaxRecordingSeconds(activePlan);

  useEffect(() => {
    engineRef.current = new AudioEngine();
    engineRef.current.setOnAnalyserData((data) => {
      setAnalyserData(new Uint8Array(data));
    });
    engineRef.current.checkMicPermission().then((state) => {
      setPermState(state);
    });
    return () => {
      engineRef.current?.destroy();
    };
  }, []);

  // Auto-stop recording when free limit reached
  useEffect(() => {
    if (isRecording && !isPro && recordingTime >= maxRecSeconds) {
      toggleRecording();
      setError(`Free plan recording limit reached (${maxRecSeconds}s). Upgrade to Pro for unlimited recording!`);
    }
  }, [recordingTime, isRecording, isPro, maxRecSeconds]);

  const getEngine = useCallback(() => {
    if (!engineRef.current) {
      engineRef.current = new AudioEngine();
      engineRef.current.setOnAnalyserData((data) => {
        setAnalyserData(new Uint8Array(data));
      });
    }
    return engineRef.current;
  }, []);

  const handlePresetChange = useCallback(
    (preset: VoicePreset) => {
      // Check if user can use this preset
      if (!canUsePreset(activePlan, preset)) {
        onOpenSubscription();
        return;
      }
      const presetConfig = PRESETS[preset];
      const newSettings: VoiceSettings = {
        pitch: presetConfig.pitch,
        speed: presetConfig.speed,
        preset,
      };
      setSettings(newSettings);
      getEngine().updateSettings(newSettings);
    },
    [getEngine, activePlan, onOpenSubscription]
  );

  const handleSliderChange = useCallback(
    (key: 'pitch' | 'speed', value: number) => {
      const newSettings = { ...settings, [key]: value, preset: 'custom' as VoicePreset };
      setSettings(newSettings);
      getEngine().updateSettings(newSettings);
    },
    [settings, getEngine]
  );

  const toggleMicrophone = useCallback(async () => {
    const engine = getEngine();
    if (micActive) {
      engine.stopMicrophone();
      setMicActive(false);
      setIsLive(false);
      setIsRecording(false);
      setAnalyserData(null);
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    setMicLoading(true);
    setMicErrorCode(null);
    setMicErrorMessage(null);
    setShowPermGuide(false);

    try {
      await engine.startMicrophone();
      engine.updateSettings(settings);
      setMicActive(true);
      setPermState('granted');
    } catch (err: any) {
      if (err instanceof MicError) {
        setMicErrorCode(err.code);
        setMicErrorMessage(err.message);
        setShowPermGuide(true);
        if (err.code === 'denied') setPermState('denied');
        else if (err.code === 'iframe-blocked' || err.code === 'security' || err.code === 'insecure-context') setPermState('iframe-blocked');
      } else {
        setMicErrorCode('unknown');
        setMicErrorMessage(err.message || 'Failed to access microphone. Please try again.');
        setShowPermGuide(true);
      }
    } finally {
      setMicLoading(false);
    }
  }, [micActive, settings, getEngine]);

  const handleRetryMic = useCallback(() => {
    setShowPermGuide(false);
    setMicErrorCode(null);
    setMicErrorMessage(null);
    setTimeout(() => {
      toggleMicrophone();
    }, 300);
  }, [toggleMicrophone]);

  const toggleLiveMode = useCallback(() => {
    if (!isPro) {
      onOpenSubscription();
      return;
    }
    const engine = getEngine();
    const newLive = !isLive;
    engine.setLiveMode(newLive);
    setIsLive(newLive);
  }, [isLive, getEngine, isPro, onOpenSubscription]);

  const toggleRecording = useCallback(async () => {
    const engine = getEngine();
    try {
      if (isRecording) {
        const blob = await engine.stopRecording();
        setRecordedBlob(blob);
        setIsRecording(false);
        if (timerRef.current) clearInterval(timerRef.current);
      } else {
        setRecordedBlob(null);
        setRecordingTime(0);
        engine.startRecording();
        setIsRecording(true);
        timerRef.current = setInterval(() => {
          setRecordingTime((t) => t + 1);
        }, 1000);
      }
    } catch (err: any) {
      setError(err.message || 'Recording failed');
    }
  }, [isRecording, getEngine]);

  const handleFileUpload = useCallback(
    async (file: File) => {
      const engine = getEngine();
      setIsProcessing(true);
      setProcessedBlob(null);
      setError(null);
      try {
        engine.updateSettings(settings);
        const blob = await engine.processAudioFile(file);
        setProcessedBlob(blob);
      } catch (err: any) {
        setError(err.message || 'Failed to process audio file');
      } finally {
        setIsProcessing(false);
      }
    },
    [settings, getEngine]
  );

  const downloadBlob = useCallback((blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const playBlob = useCallback((blob: Blob, audioRef: React.MutableRefObject<HTMLAudioElement | null>) => {
    if (audioRef.current) {
      audioRef.current.pause();
      URL.revokeObjectURL(audioRef.current.src);
    }
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.play().catch(() => {});
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const activeColor = PRESETS[settings.preset]?.color || '#00e5ff';
  const isInIframe = window !== window.top;

  return (
    <div className="min-h-screen bg-bg-primary bg-grid">
      {/* Ambient background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-1/4 -right-1/4 w-[600px] h-[600px] rounded-full opacity-[0.04] blur-3xl"
          style={{ background: `radial-gradient(circle, ${activeColor}, transparent 70%)` }}
        />
        <div
          className="absolute -bottom-1/4 -left-1/4 w-[500px] h-[500px] rounded-full opacity-[0.03] blur-3xl"
          style={{ background: 'radial-gradient(circle, var(--color-accent-magenta), transparent 70%)' }}
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8 md:py-12">
        {/* Header with user menu */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Waves className="w-8 h-8 md:w-10 md:h-10 text-accent-cyan" />
              </motion.div>
              <h1 className="text-2xl md:text-4xl font-bold font-[var(--font-display)] tracking-wider">
                <span className="text-accent-cyan glow-text-cyan">VOICE</span>
                <span className="text-accent-magenta glow-text-magenta">MORPH</span>
              </h1>
            </div>
            <UserHeader onOpenSubscription={onOpenSubscription} />
          </div>
          <p className="text-text-secondary text-sm md:text-base">AI-Powered Voice Transformer • Real-Time Processing</p>
        </motion.header>

        {/* Upgrade banner for free users */}
        {!isPro && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <button
              onClick={onOpenSubscription}
              className="w-full flex items-center gap-4 px-5 py-3.5 rounded-xl border border-accent-amber/25 bg-gradient-to-r from-accent-amber/5 to-accent-magenta/5 hover:from-accent-amber/10 hover:to-accent-magenta/10 transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-accent-amber/15 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Crown className="w-5 h-5 text-accent-amber" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-accent-amber">Upgrade to Pro</p>
                <p className="text-xs text-text-muted">Unlock all anime & cartoon voices + unlimited recording</p>
              </div>
              <span className="text-xs font-bold text-accent-amber bg-accent-amber/10 px-3 py-1 rounded-lg hidden sm:block">From ₹99</span>
            </button>
          </motion.div>
        )}

        {/* Iframe warning banner */}
        {isInIframe && permState !== 'granted' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-center gap-3 px-4 py-3 rounded-xl border border-accent-amber/30 bg-accent-amber/5"
          >
            <span className="text-lg">⚠️</span>
            <div className="flex-1">
              <p className="text-sm text-accent-amber font-semibold">Embedded Preview Detected</p>
              <p className="text-xs text-text-muted mt-0.5">
                Microphone may not work in embedded previews.
                <button
                  onClick={() => window.open(window.location.href, '_blank', 'noopener,noreferrer')}
                  className="text-accent-cyan underline ml-1 cursor-pointer hover:text-accent-cyan/80"
                >
                  Open in new tab
                </button>
                {' '}for full functionality, or use the Upload tab.
              </p>
            </div>
          </motion.div>
        )}

        {/* Tab Switcher */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center mb-8"
        >
          <div className="flex bg-bg-secondary rounded-2xl p-1.5 border border-border">
            {(['live', 'upload'] as AppTab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`relative flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300
                  ${tab === t ? 'text-white' : 'text-text-muted hover:text-text-secondary'}`}
              >
                {tab === t && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-xl bg-bg-card border border-border-active"
                    style={{ boxShadow: `0 0 20px ${activeColor}15` }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{t === 'live' ? <Radio className="w-4 h-4" /> : <Waves className="w-4 h-4" />}</span>
                <span className="relative z-10">{t === 'live' ? 'Live Mode' : 'Upload File'}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Visualizer */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="mb-8 p-1 rounded-2xl border border-border bg-bg-secondary/50 backdrop-blur-sm"
          style={{ borderColor: (micActive || isProcessing) ? `${activeColor}30` : undefined }}
        >
          <div className="rounded-xl bg-bg-primary/80 p-4">
            <WaveformVisualizer
              data={analyserData}
              isActive={micActive || isProcessing}
              color={activeColor}
              height={100}
            />
          </div>
        </motion.div>

        {/* Voice Presets with Category Tabs */}
        <PresetSection
          activePlan={activePlan}
          isPro={isPro}
          settings={settings}
          onPresetChange={handlePresetChange}
          onOpenSubscription={onOpenSubscription}
        />

        {/* Sliders */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl border border-border bg-bg-secondary/50"
        >
          <Slider
            label="Pitch"
            value={settings.pitch}
            min={0.25}
            max={3.0}
            step={0.05}
            unit="x"
            onChange={(v) => handleSliderChange('pitch', v)}
            icon={<Volume2 className="w-4 h-4" />}
          />
          <Slider
            label="Speed"
            value={settings.speed}
            min={0.25}
            max={2.5}
            step={0.05}
            unit="x"
            onChange={(v) => handleSliderChange('speed', v)}
            icon={<Radio className="w-4 h-4" />}
          />
        </motion.section>

        {/* Main Content Area */}
        <AnimatePresence mode="wait">
          {tab === 'live' ? (
            <motion.section
              key="live"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div className="flex flex-col items-center gap-6 p-8 rounded-2xl border border-border bg-bg-secondary/50">
                {/* Mic Button */}
                <div className="relative">
                  {micActive && (
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{ background: activeColor }}
                      animate={{ scale: [1, 1.4], opacity: [0.3, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                  {micLoading && (
                    <motion.div
                      className="absolute inset-[-4px] rounded-full border-2 border-transparent"
                      style={{ borderTopColor: 'var(--color-accent-cyan)', borderRightColor: 'var(--color-accent-magenta)' }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                  )}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleMicrophone}
                    disabled={micLoading}
                    className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer disabled:opacity-60 disabled:cursor-wait
                      ${micActive ? 'bg-accent-cyan/20 border-2 border-accent-cyan' : 'bg-bg-card border-2 border-border hover:border-accent-cyan/40'}`}
                  >
                    {micLoading ? (
                      <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                        <Mic className="w-8 h-8 text-accent-cyan/50" />
                      </motion.div>
                    ) : micActive ? (
                      <Mic className="w-8 h-8 text-accent-cyan" />
                    ) : (
                      <MicOff className="w-8 h-8 text-text-muted" />
                    )}
                  </motion.button>
                </div>

                <p className="text-sm text-text-secondary text-center">
                  {micLoading
                    ? 'Requesting microphone access...'
                    : micActive
                    ? 'Microphone active — choose a preset and start recording!'
                    : 'Click to enable microphone'}
                </p>

                {showPermGuide && (
                  <div className="w-full">
                    <MicPermissionGuide
                      errorCode={micErrorCode}
                      errorMessage={micErrorMessage}
                      onRetry={handleRetryMic}
                      onDismiss={() => setShowPermGuide(false)}
                      isVisible={showPermGuide}
                    />
                  </div>
                )}

                {micActive && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-wrap justify-center gap-3"
                  >
                    {/* Live Monitor — Pro only */}
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={toggleLiveMode}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 cursor-pointer relative
                        ${isLive ? 'bg-accent-green/20 text-accent-green border border-accent-green/40' : 'bg-bg-card text-text-secondary border border-border hover:border-accent-green/40'}`}
                    >
                      {isLive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                      {isLive ? 'Monitor ON' : 'Monitor OFF'}
                      {!isPro && (
                        <span className="ml-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-accent-amber/15 text-accent-amber">PRO</span>
                      )}
                    </motion.button>

                    {/* Record */}
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={toggleRecording}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 cursor-pointer
                        ${isRecording ? 'bg-accent-red/20 text-accent-red border border-accent-red/40' : 'bg-bg-card text-text-secondary border border-border hover:border-accent-red/40'}`}
                    >
                      {isRecording ? (
                        <>
                          <Square className="w-4 h-4" />
                          Stop {formatTime(recordingTime)}
                        </>
                      ) : (
                        <>
                          <div className="w-3 h-3 rounded-full bg-accent-red" />
                          Record
                        </>
                      )}
                    </motion.button>
                  </motion.div>
                )}

                {/* Recording indicator with limit */}
                {isRecording && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-2">
                      <motion.div
                        className="w-2.5 h-2.5 rounded-full bg-accent-red"
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                      <span className="text-sm text-accent-red font-mono">Recording with effects...</span>
                    </div>
                    {!isPro && (
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-1.5 rounded-full bg-bg-card overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-accent-amber"
                            style={{ width: `${Math.min(100, (recordingTime / maxRecSeconds) * 100)}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-text-muted font-mono">
                          {formatTime(recordingTime)} / {formatTime(maxRecSeconds)}
                        </span>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Recorded output */}
                {recordedBlob && !isRecording && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-wrap justify-center gap-3 pt-4 border-t border-border w-full"
                  >
                    <button
                      onClick={() => playBlob(recordedBlob, recordedAudioRef)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/30 text-sm font-semibold hover:bg-accent-cyan/20 transition-all cursor-pointer"
                    >
                      <Play className="w-4 h-4" /> Play Recording
                    </button>
                    <button
                      onClick={() => downloadBlob(recordedBlob, `voicemorph-recording-${Date.now()}.webm`)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent-magenta/10 text-accent-magenta border border-accent-magenta/30 text-sm font-semibold hover:bg-accent-magenta/20 transition-all cursor-pointer"
                    >
                      <Download className="w-4 h-4" /> Download
                    </button>
                  </motion.div>
                )}
              </div>

              <div className="p-4 rounded-xl border border-border bg-bg-card/50">
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">💡 Tips</h3>
                <ul className="text-xs text-text-muted space-y-1">
                  <li>• Use headphones to prevent feedback when Monitor is ON</li>
                  <li>• Select a preset or adjust pitch/speed sliders for custom effects</li>
                  <li>• Hit Record to capture your transformed voice</li>
                  {!isPro && <li>• <span className="text-accent-amber">Upgrade to Pro</span> for unlimited recording & all presets</li>}
                </ul>
              </div>
            </motion.section>
          ) : (
            <motion.section
              key="upload"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="p-8 rounded-2xl border border-border bg-bg-secondary/50">
                <FileUpload onFileSelect={handleFileUpload} isProcessing={isProcessing} />

                {isProcessing && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 flex justify-center">
                    <LoadingSpinner message="Applying voice effects..." />
                  </motion.div>
                )}

                {processedBlob && !isProcessing && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 flex flex-col items-center gap-4"
                  >
                    <div className="flex items-center gap-2 text-accent-green">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                        className="w-8 h-8 rounded-full bg-accent-green/20 flex items-center justify-center"
                      >
                        ✓
                      </motion.div>
                      <span className="font-semibold">Processing complete!</span>
                    </div>
                    <div className="flex flex-wrap justify-center gap-3">
                      <button
                        onClick={() => playBlob(processedBlob, processedAudioRef)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/30 text-sm font-semibold hover:bg-accent-cyan/20 transition-all cursor-pointer"
                      >
                        <Play className="w-4 h-4" /> Play Result
                      </button>
                      <button
                        onClick={() => downloadBlob(processedBlob, `voicemorph-processed-${Date.now()}.wav`)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent-magenta/10 text-accent-magenta border border-accent-magenta/30 text-sm font-semibold hover:bg-accent-magenta/20 transition-all cursor-pointer"
                      >
                        <Download className="w-4 h-4" /> Download WAV
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="p-4 rounded-xl border border-border bg-bg-card/50">
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">💡 Tips</h3>
                <ul className="text-xs text-text-muted space-y-1">
                  <li>• Choose a voice preset before uploading for best results</li>
                  <li>• Adjust pitch and speed sliders for fine-tuning</li>
                  <li>• Processed audio downloads as high-quality WAV</li>
                  <li>• No microphone needed — works with any audio file!</li>
                </ul>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center pb-8"
        >
          <p className="text-text-muted text-xs">
            Built with Web Audio API • All processing happens locally in your browser
          </p>
        </motion.footer>
      </div>

      <ErrorToast message={error} onClose={() => setError(null)} />
    </div>
  );
}

// Loading screen
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 rounded-full border-2 border-transparent"
          style={{ borderTopColor: 'var(--color-accent-cyan)', borderRightColor: 'var(--color-accent-magenta)' }}
        />
        <p className="text-text-muted text-sm font-[var(--font-display)]">Loading...</p>
      </motion.div>
    </div>
  );
}

export default function App() {
  const { user, loading } = useAuth();
  const [view, setView] = useState<AppView>(() => {
    // Check if URL has /admin-entry hash
    if (window.location.hash === '#/admin-entry') return 'admin';
    return 'dashboard';
  });

  // Listen for hash changes to detect admin route
  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash === '#/admin-entry') {
        setView('admin');
      }
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  if (loading) return <LoadingScreen />;

  // Admin panel — accessible without user login via #/admin-entry
  if (view === 'admin') {
    return (
      <AdminPanel onExit={() => { window.location.hash = ''; setView('dashboard'); }} />
    );
  }

  return (
    <AnimatePresence mode="wait">
      {!user ? (
        <motion.div
          key="auth"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <AuthPage />
        </motion.div>
      ) : view === 'subscription' ? (
        <motion.div
          key="subscription"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3 }}
        >
          <SubscriptionPage onBack={() => setView('dashboard')} />
        </motion.div>
      ) : (
        <motion.div
          key="dashboard"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Dashboard onOpenSubscription={() => setView('subscription')} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
