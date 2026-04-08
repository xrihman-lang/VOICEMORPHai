export type VoicePreset =
  | 'robot' | 'deep' | 'female' | 'anime' | 'chipmunk' | 'echo' | 'custom'
  // Anime Heroes
  | 'gojo' | 'naruto' | 'luffy' | 'goku'
  // Dark/Villain
  | 'sukuna' | 'madara' | 'kenpachi' | 'aizen'
  // Soft/Emotional
  | 'tanjiro' | 'hinata' | 'zenitsu'
  // Mysterious
  | 'itachi' | 'l_deathnote' | 'levi'
  // Cartoon Characters
  | 'mickey' | 'donald' | 'doraemon' | 'shinchan' | 'batman_cartoon' | 'joker_cartoon' | 'minion' | 'oggy';

export type PresetCategory = 'classic' | 'anime_hero' | 'dark_villain' | 'soft_emotional' | 'mysterious' | 'cartoon';

export interface VoiceSettings {
  pitch: number;
  speed: number;
  preset: VoicePreset;
}

export interface PresetConfig {
  name: string;
  icon: string;
  pitch: number;
  speed: number;
  description: string;
  color: string;
  category: PresetCategory;
  character?: string;
  effects: {
    distortion?: number;
    delay?: { time: number; feedback: number };
    reverb?: number;
    ringMod?: number;
    bitcrush?: number;
    formantShift?: number;  // Mapped to bandpass filter chain that reshapes vocal formants
    lowPass?: number;       // Mapped to BiquadFilter lowpass — cuts high freqs for muffled/nasal sound
    compression?: number;   // Mapped to DynamicsCompressor — 0-1 range, higher = more squash
  };
}

export const PRESET_CATEGORIES: { id: PresetCategory; label: string; icon: string; color: string }[] = [
  { id: 'classic', label: 'Classic', icon: '🎛️', color: '#8888a8' },
  { id: 'anime_hero', label: 'Anime Heroes', icon: '⚔️', color: '#00e5ff' },
  { id: 'dark_villain', label: 'Dark / Villain', icon: '👹', color: '#ff1744' },
  { id: 'soft_emotional', label: 'Soft / Emotional', icon: '🌸', color: '#ff00e5' },
  { id: 'mysterious', label: 'Mysterious', icon: '🌑', color: '#8b5cf6' },
  { id: 'cartoon', label: 'Cartoon', icon: '🎬', color: '#00e676' },
];

export const PRESETS: Record<VoicePreset, PresetConfig> = {
  // ─── Classic Presets ────────────────────────────────────────
  robot: {
    name: 'Robot',
    icon: '🤖',
    pitch: 1.0,
    speed: 1.0,
    description: 'Metallic robotic voice',
    color: '#00e5ff',
    category: 'classic',
    effects: { distortion: 8, ringMod: 200, bitcrush: 6 },
  },
  deep: {
    name: 'Deep Bass',
    icon: '🎵',
    pitch: 0.55,
    speed: 0.88,
    description: 'Ultra-deep bass voice',
    color: '#8b5cf6',
    category: 'classic',
    effects: { reverb: 0.4 },
  },
  female: {
    name: 'Female',
    icon: '👩',
    pitch: 1.65,
    speed: 1.05,
    description: 'Higher-pitched feminine voice',
    color: '#ff00e5',
    category: 'classic',
    effects: { formantShift: 1.3 },
  },
  anime: {
    name: 'Anime',
    icon: '✨',
    pitch: 1.85,
    speed: 1.15,
    description: 'Cute anime character voice',
    color: '#ffb300',
    category: 'classic',
    effects: { formantShift: 1.5, reverb: 0.15 },
  },
  chipmunk: {
    name: 'Chipmunk',
    icon: '🐿️',
    pitch: 2.2,
    speed: 1.3,
    description: 'High-speed squeaky voice',
    color: '#00e676',
    category: 'classic',
    effects: {},
  },
  echo: {
    name: 'Echo Cave',
    icon: '🏔️',
    pitch: 0.9,
    speed: 0.95,
    description: 'Echoing cave reverb',
    color: '#ff1744',
    category: 'classic',
    effects: { delay: { time: 0.3, feedback: 0.5 }, reverb: 0.7 },
  },
  custom: {
    name: 'Custom',
    icon: '🎛️',
    pitch: 1.0,
    speed: 1.0,
    description: 'Your custom settings',
    color: '#e8e8f0',
    category: 'classic',
    effects: {},
  },

  // ─── Anime Heroes (Energetic & Cool) ───────────────────────
  gojo: {
    name: 'Gojo',
    icon: '🔵',
    pitch: 1.12,
    speed: 1.08,
    description: 'Confident & playful sensei',
    color: '#38bdf8',
    category: 'anime_hero',
    character: 'Gojo Satoru',
    effects: { reverb: 0.25, delay: { time: 0.06, feedback: 0.18 } },
  },
  naruto: {
    name: 'Naruto',
    icon: '🍥',
    pitch: 1.3,
    speed: 1.22,
    description: 'Energetic ninja — Dattebayo!',
    color: '#f97316',
    category: 'anime_hero',
    character: 'Naruto Uzumaki',
    effects: { formantShift: 1.15 },
  },
  luffy: {
    name: 'Luffy',
    icon: '🏴‍☠️',
    pitch: 1.45,
    speed: 1.28,
    description: 'Carefree rubber pirate king',
    color: '#ef4444',
    category: 'anime_hero',
    character: 'Monkey D. Luffy',
    effects: { formantShift: 1.3 },
  },
  goku: {
    name: 'Goku',
    icon: '🟠',
    pitch: 1.18,
    speed: 1.05,
    description: 'Cheerful Saiyan warrior',
    color: '#fb923c',
    category: 'anime_hero',
    character: 'Son Goku',
    effects: { reverb: 0.18 },
  },

  // ─── Dark / Villain (Deep, Raspy, Intimidating) ────────────
  sukuna: {
    name: 'Sukuna',
    icon: '👁️',
    pitch: 0.55,
    speed: 0.82,
    description: 'King of Curses — menacing',
    color: '#dc2626',
    category: 'dark_villain',
    character: 'Ryomen Sukuna',
    effects: { distortion: 4, reverb: 0.55, delay: { time: 0.15, feedback: 0.3 } },
  },
  madara: {
    name: 'Madara',
    icon: '🔴',
    pitch: 0.48,
    speed: 0.78,
    description: 'Legendary Uchiha — commanding',
    color: '#991b1b',
    category: 'dark_villain',
    character: 'Madara Uchiha',
    effects: { reverb: 0.6, distortion: 2.5 },
  },
  kenpachi: {
    name: 'Kenpachi',
    icon: '⚔️',
    pitch: 0.42,
    speed: 0.75,
    description: 'Battle-crazed captain — raspy',
    color: '#facc15',
    category: 'dark_villain',
    character: 'Kenpachi Zaraki',
    effects: { distortion: 6, reverb: 0.4 },
  },
  aizen: {
    name: 'Aizen',
    icon: '🦋',
    pitch: 0.7,
    speed: 0.88,
    description: 'Calm mastermind — chilling',
    color: '#7c3aed',
    category: 'dark_villain',
    character: 'Sosuke Aizen',
    effects: { reverb: 0.65, delay: { time: 0.18, feedback: 0.25 } },
  },

  // ─── Soft / Emotional (Calm & Gentle) ──────────────────────
  tanjiro: {
    name: 'Tanjiro',
    icon: '🌊',
    pitch: 1.08,
    speed: 0.92,
    description: 'Kind-hearted demon slayer',
    color: '#22d3ee',
    category: 'soft_emotional',
    character: 'Tanjiro Kamado',
    effects: { reverb: 0.3 },
  },
  hinata: {
    name: 'Hinata',
    icon: '💜',
    pitch: 1.72,
    speed: 0.88,
    description: 'Shy & gentle Byakugan user',
    color: '#c084fc',
    category: 'soft_emotional',
    character: 'Hinata Hyuga',
    effects: { formantShift: 1.45, reverb: 0.22 },
  },
  zenitsu: {
    name: 'Zenitsu',
    icon: '⚡',
    pitch: 1.58,
    speed: 1.35,
    description: 'Panicked thunder breather',
    color: '#fbbf24',
    category: 'soft_emotional',
    character: 'Zenitsu Agatsuma',
    effects: { formantShift: 1.35, reverb: 0.08 },
  },

  // ─── Mysterious (Monotone & Deep) ──────────────────────────
  itachi: {
    name: 'Itachi',
    icon: '🌀',
    pitch: 0.78,
    speed: 0.85,
    description: 'Silent prodigy — haunting calm',
    color: '#a855f7',
    category: 'mysterious',
    character: 'Itachi Uchiha',
    effects: { reverb: 0.5, delay: { time: 0.22, feedback: 0.35 } },
  },
  l_deathnote: {
    name: 'L',
    icon: '🍰',
    pitch: 0.82,
    speed: 0.8,
    description: 'Genius detective — monotone',
    color: '#6b7280',
    category: 'mysterious',
    character: 'L Lawliet',
    effects: { reverb: 0.35 },
  },
  levi: {
    name: 'Levi',
    icon: '🗡️',
    pitch: 0.72,
    speed: 0.9,
    description: 'Humanity\'s strongest — cold',
    color: '#475569',
    category: 'mysterious',
    character: 'Levi Ackerman',
    effects: { reverb: 0.22, distortion: 1.5 },
  },

  // ─── Cartoon Characters ─────────────────────────────────────
  shinchan: {
    name: 'Shin-chan',
    icon: '🖍️',
    pitch: 1.4,
    speed: 0.8,
    description: 'Slow nasal naughty kid voice',
    color: '#f97316',
    category: 'cartoon',
    character: 'Shinnosuke Nohara',
    effects: { formantShift: 0.8, lowPass: 1100 },
  },
  batman_cartoon: {
    name: 'Batman',
    icon: '🦇',
    pitch: 0.6,
    speed: 0.92,
    description: 'Deep heavy dark knight growl',
    color: '#1e293b',
    category: 'cartoon',
    character: 'The Dark Knight',
    effects: { formantShift: 1.3, lowPass: 300, compression: 0.9, reverb: 0.5, distortion: 3 },
  },
  mickey: {
    name: 'Mickey',
    icon: '🐭',
    pitch: 2.1,
    speed: 1.1,
    description: 'High & cheerful mouse voice',
    color: '#ef4444',
    category: 'cartoon',
    character: 'Mickey Mouse',
    effects: { formantShift: 0.4 },
  },
  minion: {
    name: 'Minion',
    icon: '🍌',
    pitch: 2.3,
    speed: 1.2,
    description: 'Banana! Very high & very fast',
    color: '#facc15',
    category: 'cartoon',
    character: 'Minion',
    effects: { formantShift: 0.3 },
  },
  joker_cartoon: {
    name: 'Joker',
    icon: '🃏',
    pitch: 1.2,
    speed: 1.05,
    description: 'Psychotic laugh with eerie echo',
    color: '#a855f7',
    category: 'cartoon',
    character: 'The Joker',
    effects: { distortion: 2, delay: { time: 0.4, feedback: 0.5 }, reverb: 0.45 },
  },
  donald: {
    name: 'Donald',
    icon: '🦆',
    pitch: 1.6,
    speed: 0.88,
    description: 'Nasal & grumpy duck quack',
    color: '#3b82f6',
    category: 'cartoon',
    character: 'Donald Duck',
    effects: { formantShift: 1.45, distortion: 4, lowPass: 2000 },
  },
  doraemon: {
    name: 'Doraemon',
    icon: '🔔',
    pitch: 1.3,
    speed: 1.0,
    description: 'Metallic friendly robot cat',
    color: '#38bdf8',
    category: 'cartoon',
    character: 'Doraemon',
    effects: { reverb: 0.15, formantShift: 1.2, ringMod: 80 },
  },
  oggy: {
    name: 'Oggy',
    icon: '🐱',
    pitch: 1.5,
    speed: 0.95,
    description: 'Thin nasal scaredy cat',
    color: '#60a5fa',
    category: 'cartoon',
    character: 'Oggy',
    effects: { formantShift: 1.4, reverb: 0.12, lowPass: 2500 },
  },
};

export type MicPermissionState = 'unknown' | 'checking' | 'prompt' | 'granted' | 'denied' | 'unavailable' | 'iframe-blocked';

export class AudioEngine {
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private isRecording = false;
  private isLiveMode = false;

  // Noise filter nodes
  private highpassFilter: BiquadFilterNode | null = null;
  private lowpassFilter: BiquadFilterNode | null = null;

  // Effect nodes
  private gainNode: GainNode | null = null;
  private distortionNode: WaveShaperNode | null = null;
  private delayNode: DelayNode | null = null;
  private feedbackGain: GainNode | null = null;
  private convolverNode: ConvolverNode | null = null;
  private oscillatorNode: OscillatorNode | null = null;
  private ringModGain: GainNode | null = null;
  private effectLowPass: BiquadFilterNode | null = null;
  private formantFilters: BiquadFilterNode[] = [];
  private compressorNode: DynamicsCompressorNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private scriptProcessorNode: ScriptProcessorNode | null = null;

  private settings: VoiceSettings = { pitch: 1.0, speed: 1.0, preset: 'custom' };
  private onAnalyserData: ((data: Uint8Array) => void) | null = null;

  getAudioContext(): AudioContext | null { return this.audioContext; }
  getAnalyserNode(): AnalyserNode | null { return this.analyserNode; }
  setOnAnalyserData(cb: (data: Uint8Array) => void) { this.onAnalyserData = cb; }

  async init(): Promise<void> {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.audioContext.state === 'suspended') await this.audioContext.resume();
  }

  async checkMicPermission(): Promise<MicPermissionState> {
    if (!window.isSecureContext) return 'unavailable';
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return window !== window.top ? 'iframe-blocked' : 'unavailable';
    }
    try {
      if (navigator.permissions?.query) {
        const r = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        if (r.state === 'granted') return 'granted';
        if (r.state === 'denied') return 'denied';
      }
    } catch {}
    return 'prompt';
  }

  async startMicrophone(): Promise<void> {
    await this.init();
    if (!window.isSecureContext) throw new MicError('insecure-context', 'Microphone requires HTTPS.');
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new MicError(window !== window.top ? 'iframe-blocked' : 'not-supported',
        window !== window.top ? 'Microphone blocked in embedded preview. Open in new tab.' : 'Browser does not support microphone.');
    }
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      this.sourceNode = this.audioContext!.createMediaStreamSource(this.mediaStream);
      this.setupEffectChain();
    } catch (err: any) {
      const name = err?.name || '';
      const msg = err?.message || '';
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        throw new MicError(window !== window.top ? 'iframe-blocked' : 'denied',
          window !== window.top ? 'Mic blocked in iframe. Open in new tab.' : 'Mic permission denied. Allow in address bar.');
      }
      if (name === 'NotFoundError') throw new MicError('not-found', 'No microphone detected.');
      if (name === 'NotReadableError') throw new MicError('in-use', 'Mic used by another app.');
      throw new MicError('unknown', `Mic error: ${msg || name}`);
    }
  }

  // ═══════════════════════════════════════════════════════════
  //  CORE: setupEffectChain — wires all effects to AudioContext
  // ═══════════════════════════════════════════════════════════
  private setupEffectChain(): void {
    if (!this.audioContext || !this.sourceNode) return;
    this.disconnectAll();
    const ctx = this.audioContext;
    const preset = PRESETS[this.settings.preset];
    const effects = preset.effects;

    this.analyserNode = ctx.createAnalyser();
    this.analyserNode.fftSize = 256;
    this.analyserNode.smoothingTimeConstant = 0.8;
    this.gainNode = ctx.createGain();
    this.gainNode.gain.value = 1.0;

    // ── Step 1: Noise reduction ──────────────────────────────
    this.highpassFilter = ctx.createBiquadFilter();
    this.highpassFilter.type = 'highpass';
    this.highpassFilter.frequency.value = 150;
    this.highpassFilter.Q.value = 0.7;

    this.lowpassFilter = ctx.createBiquadFilter();
    this.lowpassFilter.type = 'lowpass';
    this.lowpassFilter.frequency.value = 7500;
    this.lowpassFilter.Q.value = 0.7;

    this.sourceNode.connect(this.highpassFilter);
    this.highpassFilter.connect(this.lowpassFilter);
    let currentNode: AudioNode = this.lowpassFilter;

    // ── Step 2: Formant Shift (bandpass filter chain) ────────
    // formantShift < 1 = nasal/muffled (Shinchan, Mickey, Minion)
    // formantShift > 1 = bright/resonant (Female, Hinata)
    if (effects.formantShift && effects.formantShift !== 1.0) {
      const shift = effects.formantShift;
      // Base formant frequencies for human voice
      const baseFormants = [270, 730, 2300, 3000];
      this.formantFilters = [];

      for (const baseFreq of baseFormants) {
        const filter = ctx.createBiquadFilter();
        filter.type = 'peaking';
        filter.frequency.value = baseFreq * shift;
        filter.Q.value = 4;
        // Below 1 = cut highs/boost lows (nasal), Above 1 = boost highs (bright)
        filter.gain.value = shift < 1 ? -6 + (shift * 6) : 3 + ((shift - 1) * 8);
        currentNode.connect(filter);
        currentNode = filter;
        this.formantFilters.push(filter);
      }
    }

    // ── Step 3: Compression (DynamicsCompressor) ─────────────
    // Used by Batman etc. to squash dynamics for heavy/dark feel
    if (effects.compression && effects.compression > 0) {
      this.compressorNode = ctx.createDynamicsCompressor();
      const c = effects.compression; // 0-1
      this.compressorNode.threshold.value = -50 + (1 - c) * 40;  // -50 to -10
      this.compressorNode.knee.value = 10 - c * 8;               // 10 to 2
      this.compressorNode.ratio.value = 2 + c * 18;              // 2 to 20
      this.compressorNode.attack.value = 0.003;
      this.compressorNode.release.value = 0.1;
      currentNode.connect(this.compressorNode);
      currentNode = this.compressorNode;
    }

    // ── Step 4: Distortion ───────────────────────────────────
    if (effects.distortion) {
      this.distortionNode = ctx.createWaveShaper();
      this.distortionNode.curve = this.makeDistortionCurve(effects.distortion * 50);
      this.distortionNode.oversample = '4x';
      currentNode.connect(this.distortionNode);
      currentNode = this.distortionNode;
    }

    // ── Step 5: Ring Modulation ──────────────────────────────
    if (effects.ringMod) {
      this.oscillatorNode = ctx.createOscillator();
      this.oscillatorNode.frequency.value = effects.ringMod;
      this.oscillatorNode.type = 'sine';
      this.ringModGain = ctx.createGain();
      this.ringModGain.gain.value = 0;
      this.oscillatorNode.connect(this.ringModGain.gain);
      this.oscillatorNode.start();
      currentNode.connect(this.ringModGain);
      currentNode = this.ringModGain;
    }

    // ── Step 6: Delay / Echo ─────────────────────────────────
    if (effects.delay) {
      this.delayNode = ctx.createDelay(2.0);
      this.delayNode.delayTime.value = effects.delay.time;
      this.feedbackGain = ctx.createGain();
      this.feedbackGain.gain.value = effects.delay.feedback;
      const dryGain = ctx.createGain(); dryGain.gain.value = 1.0;
      const wetGain = ctx.createGain(); wetGain.gain.value = 0.5;
      currentNode.connect(dryGain);
      currentNode.connect(this.delayNode);
      this.delayNode.connect(this.feedbackGain);
      this.feedbackGain.connect(this.delayNode);
      this.delayNode.connect(wetGain);
      const merger = ctx.createGain();
      dryGain.connect(merger); wetGain.connect(merger);
      currentNode = merger;
    }

    // ── Step 7: Reverb ───────────────────────────────────────
    if (effects.reverb) {
      this.convolverNode = ctx.createConvolver();
      this.convolverNode.buffer = this.createReverbImpulse(ctx, 2, effects.reverb * 3);
      const dryGain = ctx.createGain(); dryGain.gain.value = 1.0;
      const wetGain = ctx.createGain(); wetGain.gain.value = effects.reverb;
      const merger = ctx.createGain();
      currentNode.connect(dryGain);
      currentNode.connect(this.convolverNode);
      this.convolverNode.connect(wetGain);
      dryGain.connect(merger); wetGain.connect(merger);
      currentNode = merger;
    }

    // ── Step 8: Effect LowPass (muffled/nasal tone shaping) ──
    // This is the key for Shinchan (1100Hz), Batman (300Hz), etc.
    if (effects.lowPass) {
      this.effectLowPass = ctx.createBiquadFilter();
      this.effectLowPass.type = 'lowpass';
      this.effectLowPass.frequency.value = effects.lowPass;
      this.effectLowPass.Q.value = 1.0;
      currentNode.connect(this.effectLowPass);
      currentNode = this.effectLowPass;
    }

    // ── Final: Gain → Analyser → Output ──────────────────────
    currentNode.connect(this.gainNode);
    this.gainNode.connect(this.analyserNode);
    if (this.isLiveMode) this.analyserNode.connect(ctx.destination);
    this.startAnalyserLoop();
  }

  private startAnalyserLoop(): void {
    if (!this.analyserNode || !this.onAnalyserData) return;
    const bufferLength = this.analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const loop = () => {
      if (!this.analyserNode) return;
      this.analyserNode.getByteFrequencyData(dataArray);
      this.onAnalyserData?.(dataArray);
      if (this.isRecording || this.isLiveMode) requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  private disconnectAll(): void {
    try {
      this.sourceNode?.disconnect();
      this.highpassFilter?.disconnect(); this.lowpassFilter?.disconnect();
      this.effectLowPass?.disconnect(); this.compressorNode?.disconnect();
      for (const f of this.formantFilters) f?.disconnect();
      this.distortionNode?.disconnect();
      this.delayNode?.disconnect(); this.feedbackGain?.disconnect();
      this.convolverNode?.disconnect(); this.gainNode?.disconnect();
      this.analyserNode?.disconnect(); this.ringModGain?.disconnect();
      if (this.oscillatorNode) { try { this.oscillatorNode.stop(); } catch {} this.oscillatorNode.disconnect(); }
      if (this.scriptProcessorNode) this.scriptProcessorNode.disconnect();
    } catch {}
    this.highpassFilter = null; this.lowpassFilter = null;
    this.effectLowPass = null; this.compressorNode = null; this.formantFilters = [];
    this.distortionNode = null; this.delayNode = null; this.feedbackGain = null;
    this.convolverNode = null; this.gainNode = null; this.analyserNode = null;
    this.oscillatorNode = null; this.ringModGain = null; this.scriptProcessorNode = null;
  }

  private makeDistortionCurve(amount: number): Float32Array<ArrayBuffer> {
    const samples = 44100;
    const curve = new Float32Array(samples) as Float32Array<ArrayBuffer>;
    const deg = Math.PI / 180;
    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
    }
    return curve;
  }

  private createReverbImpulse(ctx: AudioContext, duration: number, decay: number): AudioBuffer {
    const sampleRate = ctx.sampleRate;
    const length = sampleRate * duration;
    const impulse = ctx.createBuffer(2, length, sampleRate);
    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
      }
    }
    return impulse;
  }

  updateSettings(settings: Partial<VoiceSettings>): void {
    this.settings = { ...this.settings, ...settings };
    if (this.sourceNode) this.setupEffectChain();
  }

  getSettings(): VoiceSettings { return { ...this.settings }; }

  setLiveMode(enabled: boolean): void {
    this.isLiveMode = enabled;
    if (this.sourceNode) this.setupEffectChain();
    if (enabled && this.analyserNode) this.startAnalyserLoop();
  }

  getIsLiveMode(): boolean { return this.isLiveMode; }

  startRecording(): void {
    if (!this.mediaStream) return;
    this.recordedChunks = [];
    this.isRecording = true;
    const ctx = this.audioContext!;
    const dest = ctx.createMediaStreamDestination();
    if (this.analyserNode) this.analyserNode.connect(dest);
    this.mediaRecorder = new MediaRecorder(dest.stream, { mimeType: this.getSupportedMimeType() });
    this.mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) this.recordedChunks.push(e.data); };
    this.mediaRecorder.start(100);
    this.startAnalyserLoop();
  }

  private getSupportedMimeType(): string {
    for (const t of ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4']) {
      if (MediaRecorder.isTypeSupported(t)) return t;
    }
    return 'audio/webm';
  }

  stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') { reject(new Error('No active recording')); return; }
      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, { type: this.getSupportedMimeType() });
        this.isRecording = false;
        resolve(blob);
      };
      this.mediaRecorder.stop();
    });
  }

  getIsRecording(): boolean { return this.isRecording; }

  // ═══════════════════════════════════════════════════════════
  //  processAudioFile — offline rendering with all effects
  // ═══════════════════════════════════════════════════════════
  async processAudioFile(file: File): Promise<Blob> {
    await this.init();
    const ctx = this.audioContext!;
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    const preset = PRESETS[this.settings.preset];
    const pitch = this.settings.preset === 'custom' ? this.settings.pitch : preset.pitch;
    const speed = this.settings.preset === 'custom' ? this.settings.speed : preset.speed;
    const effects = preset.effects;
    const duration = audioBuffer.duration / speed;
    const offlineCtx = new OfflineAudioContext(audioBuffer.numberOfChannels, Math.ceil(ctx.sampleRate * duration), ctx.sampleRate);

    const source = offlineCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.playbackRate.value = speed * pitch;
    let currentNode: AudioNode = source;

    // Formant shift
    if (effects.formantShift && effects.formantShift !== 1.0) {
      const shift = effects.formantShift;
      for (const baseFreq of [270, 730, 2300, 3000]) {
        const f = offlineCtx.createBiquadFilter();
        f.type = 'peaking';
        f.frequency.value = baseFreq * shift;
        f.Q.value = 4;
        f.gain.value = shift < 1 ? -6 + (shift * 6) : 3 + ((shift - 1) * 8);
        currentNode.connect(f);
        currentNode = f;
      }
    }
    // Compression
    if (effects.compression && effects.compression > 0) {
      const comp = offlineCtx.createDynamicsCompressor();
      const c = effects.compression;
      comp.threshold.value = -50 + (1 - c) * 40;
      comp.knee.value = 10 - c * 8;
      comp.ratio.value = 2 + c * 18;
      comp.attack.value = 0.003;
      comp.release.value = 0.1;
      currentNode.connect(comp);
      currentNode = comp;
    }
    // Distortion
    if (effects.distortion) {
      const dist = offlineCtx.createWaveShaper();
      dist.curve = this.makeDistortionCurve(effects.distortion * 50);
      dist.oversample = '4x';
      currentNode.connect(dist); currentNode = dist;
    }
    // Ring mod
    if (effects.ringMod) {
      const osc = offlineCtx.createOscillator(); osc.frequency.value = effects.ringMod; osc.type = 'sine';
      const rg = offlineCtx.createGain(); rg.gain.value = 0;
      osc.connect(rg.gain); osc.start();
      currentNode.connect(rg); currentNode = rg;
    }
    // Delay
    if (effects.delay) {
      const dl = offlineCtx.createDelay(2.0); dl.delayTime.value = effects.delay.time;
      const fb = offlineCtx.createGain(); fb.gain.value = effects.delay.feedback;
      const dry = offlineCtx.createGain(); dry.gain.value = 1.0;
      const wet = offlineCtx.createGain(); wet.gain.value = 0.5;
      currentNode.connect(dry); currentNode.connect(dl);
      dl.connect(fb); fb.connect(dl); dl.connect(wet);
      const m = offlineCtx.createGain();
      dry.connect(m); wet.connect(m); currentNode = m;
    }
    // Reverb
    if (effects.reverb) {
      const conv = offlineCtx.createConvolver();
      const irLen = offlineCtx.sampleRate * 2;
      const irBuf = offlineCtx.createBuffer(2, irLen, offlineCtx.sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const d = irBuf.getChannelData(ch);
        for (let i = 0; i < irLen; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / irLen, effects.reverb * 3);
      }
      conv.buffer = irBuf;
      const dry = offlineCtx.createGain(); dry.gain.value = 1.0;
      const wet = offlineCtx.createGain(); wet.gain.value = effects.reverb;
      const m = offlineCtx.createGain();
      currentNode.connect(dry); currentNode.connect(conv);
      conv.connect(wet); dry.connect(m); wet.connect(m);
      currentNode = m;
    }
    // LowPass
    if (effects.lowPass) {
      const lp = offlineCtx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = effects.lowPass;
      lp.Q.value = 1.0;
      currentNode.connect(lp); currentNode = lp;
    }

    currentNode.connect(offlineCtx.destination);
    source.start(0);
    const rendered = await offlineCtx.startRendering();
    return this.audioBufferToWav(rendered);
  }

  private audioBufferToWav(buffer: AudioBuffer): Blob {
    const nc = buffer.numberOfChannels, sr = buffer.sampleRate, bd = 16;
    const bps = bd / 8, ba = nc * bps, dl = buffer.length * ba, tl = 44 + dl;
    const ab = new ArrayBuffer(tl), v = new DataView(ab);
    const ws = (o: number, s: string) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
    ws(0,'RIFF'); v.setUint32(4,tl-8,true); ws(8,'WAVE'); ws(12,'fmt ');
    v.setUint32(16,16,true); v.setUint16(20,1,true); v.setUint16(22,nc,true);
    v.setUint32(24,sr,true); v.setUint32(28,sr*ba,true);
    v.setUint16(32,ba,true); v.setUint16(34,bd,true);
    ws(36,'data'); v.setUint32(40,dl,true);
    const chs: Float32Array[] = [];
    for (let i = 0; i < nc; i++) chs.push(buffer.getChannelData(i));
    let off = 44;
    for (let i = 0; i < buffer.length; i++) {
      for (let ch = 0; ch < nc; ch++) {
        const s = Math.max(-1, Math.min(1, chs[ch][i]));
        v.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7fff, true);
        off += 2;
      }
    }
    return new Blob([ab], { type: 'audio/wav' });
  }

  stopMicrophone(): void {
    this.disconnectAll();
    if (this.mediaStream) { this.mediaStream.getTracks().forEach(t => t.stop()); this.mediaStream = null; }
    this.sourceNode = null; this.isRecording = false; this.isLiveMode = false;
  }

  destroy(): void {
    this.stopMicrophone();
    if (this.audioContext) { this.audioContext.close(); this.audioContext = null; }
  }
}

export class MicError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message); this.code = code; this.name = 'MicError';
  }
}
