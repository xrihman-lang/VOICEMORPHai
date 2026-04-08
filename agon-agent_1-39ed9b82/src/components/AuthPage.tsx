import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, Waves, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { getPasswordStrength } from '../lib/auth';

export default function AuthPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const passwordStrength = getPasswordStrength(password);

  // Particle background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const dpr = window.devicePixelRatio || 1;

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
      color: string;
      alpha: number;
    }

    const particles: Particle[] = [];
    const colors = ['#00e5ff', '#ff00e5', '#8b5cf6', '#00e676'];

    function resize() {
      canvas!.width = window.innerWidth * dpr;
      canvas!.height = window.innerHeight * dpr;
      canvas!.style.width = window.innerWidth + 'px';
      canvas!.style.height = window.innerHeight + 'px';
      ctx!.scale(dpr, dpr);
    }

    function init() {
      resize();
      const count = Math.min(60, Math.floor(window.innerWidth / 20));
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          r: Math.random() * 2 + 0.5,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: Math.random() * 0.5 + 0.1,
        });
      }
    }

    function draw() {
      ctx!.clearRect(0, 0, window.innerWidth, window.innerHeight);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = window.innerWidth;
        if (p.x > window.innerWidth) p.x = 0;
        if (p.y < 0) p.y = window.innerHeight;
        if (p.y > window.innerHeight) p.y = 0;

        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fillStyle = p.color;
        ctx!.globalAlpha = p.alpha;
        ctx!.fill();
      }

      // Draw connections
      ctx!.globalAlpha = 0.04;
      ctx!.strokeStyle = '#00e5ff';
      ctx!.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx!.beginPath();
            ctx!.moveTo(particles[i].x, particles[i].y);
            ctx!.lineTo(particles[j].x, particles[j].y);
            ctx!.stroke();
          }
        }
      }
      ctx!.globalAlpha = 1;

      animId = requestAnimationFrame(draw);
    }

    init();
    draw();
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const clearErrors = () => {
    setError(null);
    setFieldErrors({});
  };

  const toggleMode = () => {
    setMode((m) => (m === 'login' ? 'signup' : 'login'));
    clearErrors();
    setPassword('');
    setSuccess(false);
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errs.email = 'Invalid email format';
    if (!password) errs.password = 'Password is required';
    else if (mode === 'signup' && password.length < 6) errs.password = 'Min 6 characters';
    if (mode === 'signup' && (!displayName.trim() || displayName.trim().length < 2))
      errs.displayName = 'Name must be at least 2 characters';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      clearErrors();
      if (!validate()) return;

      setIsSubmitting(true);
      // Simulate network latency
      await new Promise((r) => setTimeout(r, 600 + Math.random() * 400));

      let authError;
      if (mode === 'login') {
        authError = await login(email, password);
      } else {
        authError = await register(email, password, displayName);
      }

      if (authError) {
        setError(authError.message);
        setIsSubmitting(false);
        return;
      }

      setSuccess(true);
      // Brief success animation before redirect (handled by parent)
      setTimeout(() => setIsSubmitting(false), 300);
    },
    [mode, email, password, displayName, login, register]
  );

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4 relative overflow-hidden">
      {/* Particle canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0"
      />

      {/* Ambient glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-[0.06] blur-3xl bg-[radial-gradient(circle,#00e5ff,transparent_70%)]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-[0.05] blur-3xl bg-[radial-gradient(circle,#ff00e5,transparent_70%)]" />
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[300px] h-[300px] rounded-full opacity-[0.03] blur-3xl bg-[radial-gradient(circle,#8b5cf6,transparent_70%)]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="flex items-center justify-center gap-2.5 mb-3">
            <motion.div
              animate={{ rotate: [0, 8, -8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Waves className="w-9 h-9 text-accent-cyan" />
            </motion.div>
            <h1 className="text-3xl md:text-4xl font-bold font-[var(--font-display)] tracking-wider">
              <span className="text-accent-cyan glow-text-cyan">VOICE</span>
              <span className="text-accent-magenta glow-text-magenta">MORPH</span>
            </h1>
          </div>
          <p className="text-text-muted text-sm">AI-Powered Voice Transformer</p>
        </motion.div>

        {/* Card */}
        <motion.div
          layout
          className="rounded-2xl border border-border bg-bg-secondary/70 backdrop-blur-xl overflow-hidden"
          style={{ boxShadow: '0 0 80px rgba(0, 229, 255, 0.04), 0 20px 60px rgba(0,0,0,0.4)' }}
        >
          {/* Tab header */}
          <div className="flex border-b border-border">
            {(['login', 'signup'] as const).map((t) => (
              <button
                key={t}
                onClick={() => { if (t !== mode) toggleMode(); }}
                className={`flex-1 relative py-4 text-sm font-semibold transition-colors duration-300 cursor-pointer
                  ${mode === t ? 'text-text-primary' : 'text-text-muted hover:text-text-secondary'}`}
              >
                {mode === t && (
                  <motion.div
                    layoutId="authTabIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5"
                    style={{ background: 'linear-gradient(90deg, var(--color-accent-cyan), var(--color-accent-magenta))' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                {t === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          {/* Form */}
          <AnimatePresence mode="wait">
            <motion.form
              key={mode}
              initial={{ opacity: 0, x: mode === 'login' ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: mode === 'login' ? 20 : -20 }}
              transition={{ duration: 0.25 }}
              onSubmit={handleSubmit}
              className="p-6 space-y-4"
            >
              {/* Global error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-accent-red/10 border border-accent-red/25">
                      <div className="w-2 h-2 rounded-full bg-accent-red flex-shrink-0" />
                      <p className="text-sm text-accent-red">{error}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Success */}
              <AnimatePresence>
                {success && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl bg-accent-green/10 border border-accent-green/25"
                  >
                    <Sparkles className="w-4 h-4 text-accent-green" />
                    <p className="text-sm text-accent-green font-medium">
                      {mode === 'login' ? 'Welcome back!' : 'Account created!'} Redirecting...
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Display Name (signup only) */}
              {mode === 'signup' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-1.5">
                    Display Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => { setDisplayName(e.target.value); setFieldErrors((p) => ({ ...p, displayName: '' })); }}
                      placeholder="Your name"
                      className={`w-full pl-10 pr-4 py-3 rounded-xl bg-bg-card border text-text-primary placeholder:text-text-muted/50 text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-accent-cyan/30
                        ${fieldErrors.displayName ? 'border-accent-red/50' : 'border-border focus:border-accent-cyan/50'}`}
                    />
                  </div>
                  {fieldErrors.displayName && (
                    <p className="text-xs text-accent-red mt-1">{fieldErrors.displayName}</p>
                  )}
                </motion.div>
              )}

              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    ref={emailRef}
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setFieldErrors((p) => ({ ...p, email: '' })); }}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl bg-bg-card border text-text-primary placeholder:text-text-muted/50 text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-accent-cyan/30
                      ${fieldErrors.email ? 'border-accent-red/50' : 'border-border focus:border-accent-cyan/50'}`}
                  />
                </div>
                {fieldErrors.email && (
                  <p className="text-xs text-accent-red mt-1">{fieldErrors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setFieldErrors((p) => ({ ...p, password: '' })); }}
                    placeholder={mode === 'signup' ? 'Min 6 characters' : 'Enter password'}
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    className={`w-full pl-10 pr-12 py-3 rounded-xl bg-bg-card border text-text-primary placeholder:text-text-muted/50 text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-accent-cyan/30
                      ${fieldErrors.password ? 'border-accent-red/50' : 'border-border focus:border-accent-cyan/50'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="text-xs text-accent-red mt-1">{fieldErrors.password}</p>
                )}

                {/* Password strength (signup only) */}
                {mode === 'signup' && password.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-2"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-bg-card overflow-hidden flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <motion.div
                            key={i}
                            className="flex-1 rounded-full"
                            initial={{ scaleX: 0 }}
                            animate={{
                              scaleX: i <= passwordStrength.score ? 1 : 0,
                              backgroundColor: i <= passwordStrength.score ? passwordStrength.color : 'transparent',
                            }}
                            transition={{ duration: 0.2, delay: i * 0.05 }}
                            style={{ originX: 0 }}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-medium" style={{ color: passwordStrength.color }}>
                        {passwordStrength.label}
                      </span>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={isSubmitting || success}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="w-full relative py-3.5 rounded-xl font-semibold text-sm text-white overflow-hidden transition-all duration-300 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group"
                style={{
                  background: 'linear-gradient(135deg, var(--color-accent-cyan), var(--color-accent-magenta))',
                }}
              >
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300" />
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : success ? (
                    <Sparkles className="w-5 h-5" />
                  ) : (
                    <>
                      {mode === 'login' ? 'Sign In' : 'Create Account'}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </span>
              </motion.button>

              {/* Switch mode */}
              <p className="text-center text-sm text-text-muted pt-1">
                {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="text-accent-cyan hover:text-accent-cyan/80 font-semibold transition-colors cursor-pointer"
                >
                  {mode === 'login' ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </motion.form>
          </AnimatePresence>
        </motion.div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-xs text-text-muted/50 mt-6"
        >
          Data stored locally in your browser • No server required
        </motion.p>
      </motion.div>
    </div>
  );
}
