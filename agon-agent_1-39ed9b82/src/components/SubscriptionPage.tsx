import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check, Crown, Zap, ArrowLeft, Shield, Clock, Sparkles, Loader2, X, AlertTriangle,
  QrCode, Copy, CheckCircle2, XCircle, ArrowRight, RefreshCw, History, IndianRupee,
  Smartphone, ScanLine, CircleAlert,
} from 'lucide-react';
import UPIQRCode from './UPIQRCode';
import LiveCountdown from './LiveCountdown';
import { useAuth } from '../lib/AuthContext';
import {
  PLANS,
  type PlanId,
  type PlanConfig,
  getUserSubscription,
  getRemainingTime,
  cancelSubscription,
  getActivePlan,
  getTrialStatus,
  createPaymentRecord,
  verifyPayment,
  validateUTR,
  getUserPayments,
  UPI_ID,
  UPI_NAME,
} from '../lib/subscription';

interface SubscriptionPageProps {
  onBack: () => void;
}

export default function SubscriptionPage({ onBack }: SubscriptionPageProps) {
  const { user, activateTrial } = useAuth();
  const [activePlan, setActivePlan] = useState<PlanId>('free');
  const [remaining, setRemaining] = useState(getRemainingTime(null));
  const [showPayment, setShowPayment] = useState<PlanId | null>(null);
  const [success, setSuccess] = useState<PlanId | null>(null);
  const [showCancel, setShowCancel] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const refreshSub = useCallback(() => {
    if (!user) return;
    const plan = getActivePlan(user.id);
    setActivePlan(plan);
    const sub = getUserSubscription(user.id);
    setRemaining(getRemainingTime(sub));
  }, [user]);

  useEffect(() => {
    refreshSub();
    const interval = setInterval(refreshSub, 60000);
    return () => clearInterval(interval);
  }, [refreshSub]);

  const handlePaymentSuccess = useCallback(
    (planId: PlanId) => {
      setShowPayment(null);
      setSuccess(planId);
      refreshSub();
      setTimeout(() => setSuccess(null), 5000);
    },
    [refreshSub]
  );

  const handleCancel = useCallback(() => {
    if (!user) return;
    cancelSubscription(user.id);
    setShowCancel(false);
    refreshSub();
  }, [user, refreshSub]);

  const isPro = activePlan !== 'free';

  return (
    <div className="min-h-screen bg-bg-primary bg-grid">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-15%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-[0.05] blur-3xl bg-[radial-gradient(circle,#ffb300,transparent_70%)]" />
        <div className="absolute bottom-[-15%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-[0.04] blur-3xl bg-[radial-gradient(circle,#00e5ff,transparent_70%)]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8 md:py-12">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={onBack}
            className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Dashboard</span>
          </motion.button>

          {user && (
            <motion.button
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => setShowHistory(true)}
              className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors cursor-pointer text-sm"
            >
              <History className="w-4 h-4" />
              <span className="hidden sm:inline font-medium">Payment History</span>
            </motion.button>
          )}
        </div>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-amber/10 border border-accent-amber/20 mb-4">
            <Crown className="w-4 h-4 text-accent-amber" />
            <span className="text-xs font-semibold text-accent-amber uppercase tracking-wider">Premium Plans</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold font-[var(--font-display)] tracking-wide mb-3">
            <span className="text-text-primary">Upgrade to </span>
            <span className="text-accent-amber glow-text-cyan">Pro</span>
          </h1>
          <p className="text-text-secondary text-sm md:text-base max-w-lg mx-auto">
            Unlock all voice presets, unlimited recording, live monitoring, and HD audio exports
          </p>
        </motion.div>

        {/* Free Trial Banner */}
        {user && !isPro && (() => {
          const trial = getTrialStatus(user.trialStartedAt, user.isTrialUsed);
          const canStart = !user.isTrialUsed;
          if (trial.isActive && trial.expiresAt) {
            return (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <div className="p-5 rounded-2xl border border-accent-cyan/30 bg-gradient-to-r from-accent-cyan/5 to-accent-purple/5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-accent-cyan/15 flex items-center justify-center text-xl">⏱️</div>
                    <div>
                      <p className="text-sm font-bold text-accent-cyan">Free Trial Active</p>
                      <p className="text-xs text-text-muted">Buy a plan below to keep Pro access after trial ends</p>
                    </div>
                  </div>
                  <LiveCountdown
                    expiresAt={trial.expiresAt}
                    totalDuration={3 * 60 * 60 * 1000}
                    color="#00e5ff"
                    label="Trial Ends In"
                    onExpired={refreshSub}
                  />
                </div>
              </motion.div>
            );
          }
          if (canStart) {
            return (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <TrialStartCard onStart={() => { activateTrial(); refreshSub(); }} />
              </motion.div>
            );
          }
          if (user.isTrialUsed && !trial.isActive) {
            return (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <div className="p-4 rounded-xl border border-border bg-bg-secondary/30 flex items-center gap-3">
                  <span className="text-lg">✅</span>
                  <p className="text-xs text-text-muted">Free trial used. Purchase a plan below to continue with Pro features.</p>
                </div>
              </motion.div>
            );
          }
          return null;
        })()}

        {/* Active subscription banner */}
        <AnimatePresence>
          {isPro && !remaining.expired && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="mb-8"
            >
              <div
                className="rounded-2xl border p-5 md:p-6"
                style={{
                  borderColor: `${PLANS[activePlan].color}30`,
                  background: `linear-gradient(135deg, ${PLANS[activePlan].color}08, transparent)`,
                }}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl" style={{ background: `${PLANS[activePlan].color}15` }}>
                      {PLANS[activePlan].icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-text-primary">{PLANS[activePlan].name}</h3>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider" style={{ backgroundColor: `${PLANS[activePlan].color}20`, color: PLANS[activePlan].color }}>Active</span>
                      </div>
                      <p className="text-sm text-text-muted mt-0.5">Your subscription is active and running</p>
                    </div>
                  </div>
                  <LiveCountdown
                    expiresAt={getUserSubscription(user!.id)?.expiresAt || 0}
                    totalDuration={PLANS[activePlan].duration * 24 * 60 * 60 * 1000}
                    color={PLANS[activePlan].color}
                    compact
                    onExpired={refreshSub}
                  />
                </div>
                <div className="mt-4 pt-4 border-t border-border">
                  <LiveCountdown
                    expiresAt={getUserSubscription(user!.id)?.expiresAt || 0}
                    totalDuration={PLANS[activePlan].duration * 24 * 60 * 60 * 1000}
                    color={PLANS[activePlan].color}
                    label="Subscription Ends In"
                    onExpired={refreshSub}
                  />
                  <div className="flex justify-end mt-3">
                    <button onClick={() => setShowCancel(true)} className="text-xs text-text-muted hover:text-accent-red transition-colors cursor-pointer">Cancel subscription</button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success banner */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.97 }}
              className="mb-8 p-4 rounded-2xl border border-accent-green/30 bg-accent-green/5 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-accent-green/15 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-accent-green" />
              </div>
              <div>
                <p className="text-sm font-bold text-accent-green">🎉 Payment Verified & Subscription Activated!</p>
                <p className="text-xs text-text-muted mt-0.5">{PLANS[success].name} plan is now active. Enjoy all premium features!</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
          {(['free', 'pro_15', 'pro_30'] as PlanId[]).map((planId, idx) => {
            const plan = PLANS[planId];
            const isActive = activePlan === planId;
            const isCurrent = isActive && (planId === 'free' || !remaining.expired);

            return (
              <motion.div key={planId} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + idx * 0.1 }} className="relative">
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <span className="px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-bg-primary bg-accent-amber shadow-lg">Most Popular</span>
                  </div>
                )}
                <motion.div
                  whileHover={{ y: -4, scale: 1.01 }}
                  className={`relative h-full rounded-2xl border p-6 flex flex-col transition-all duration-300 ${plan.popular ? 'border-accent-amber/40 bg-bg-secondary/80' : 'border-border bg-bg-secondary/50'}`}
                  style={{ boxShadow: isCurrent ? `0 0 0 2px ${plan.color}50, 0 0 40px ${plan.color}10` : plan.popular ? `0 0 40px ${plan.color}10` : 'none' }}
                >
                  <div className="mb-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{plan.icon}</span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider" style={{ backgroundColor: `${plan.color}15`, color: plan.color }}>{plan.badge}</span>
                      </div>
                      {isCurrent && <span className="px-2 py-0.5 rounded-md bg-accent-green/15 text-accent-green text-[10px] font-bold uppercase">Current</span>}
                    </div>
                    <h3 className="text-lg font-bold text-text-primary font-[var(--font-display)]">{plan.name}</h3>
                    <div className="flex items-baseline gap-1.5 mt-2">
                      <span className="text-3xl font-bold font-[var(--font-display)]" style={{ color: plan.color }}>{plan.priceLabel}</span>
                      {plan.duration > 0 && <span className="text-sm text-text-muted">/ {plan.duration} days</span>}
                    </div>
                    {plan.duration > 0 && <p className="text-xs text-text-muted mt-1">{plan.perDay}</p>}
                  </div>
                  <ul className="space-y-2.5 mb-6 flex-1">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: plan.color }} />
                        <span className="text-sm text-text-secondary">{f}</span>
                      </li>
                    ))}
                  </ul>
                  {planId === 'free' ? (
                    <div className="w-full py-3 rounded-xl text-center text-sm font-semibold border border-border text-text-muted bg-bg-card">
                      {isCurrent ? 'Current Plan' : 'Free Forever'}
                    </div>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowPayment(planId)}
                      disabled={isCurrent}
                      className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all cursor-pointer disabled:opacity-50 disabled:cursor-default"
                      style={{ background: isCurrent ? `${plan.color}30` : plan.gradient, color: isCurrent ? plan.color : '#fff' }}
                    >
                      {isCurrent ? '✓ Active Plan' : `Get ${plan.name}`}
                    </motion.button>
                  )}
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* Trust badges */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex flex-wrap justify-center gap-6 mb-12">
          {[
            { icon: <QrCode className="w-4 h-4" />, text: 'UPI QR Payment' },
            { icon: <Shield className="w-4 h-4" />, text: 'Verified Transactions' },
            { icon: <Clock className="w-4 h-4" />, text: 'Instant Activation' },
            { icon: <Zap className="w-4 h-4" />, text: 'Cancel Anytime' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-text-muted">
              {item.icon}
              <span className="text-xs font-medium">{item.text}</span>
            </div>
          ))}
        </motion.div>

        {/* FAQ */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="max-w-2xl mx-auto">
          <h2 className="text-lg font-bold text-text-primary font-[var(--font-display)] text-center mb-6">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {[
              { q: 'How does payment work?', a: 'Scan the UPI QR code using any UPI app (Google Pay, PhonePe, Paytm, etc.). After payment, enter the UTR/Transaction ID. We verify the payment and activate your plan instantly.' },
              { q: 'What is a UTR number?', a: 'UTR (Unique Transaction Reference) is a 12-22 digit number you get after completing a UPI payment. You can find it in your UPI app\'s transaction history.' },
              { q: 'What if my payment verification fails?', a: 'Don\'t worry! If verification fails, try re-entering the correct UTR number. If the issue persists, your payment is safe — contact support with your UTR for manual activation.' },
              { q: 'Can I extend my subscription?', a: 'Yes! If you purchase a new plan while an existing one is active, the time gets added on top. You never lose remaining days.' },
            ].map((faq, i) => (
              <div key={i} className="p-4 rounded-xl border border-border bg-bg-secondary/50">
                <p className="text-sm font-semibold text-text-primary mb-1">{faq.q}</p>
                <p className="text-xs text-text-muted leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPayment && user && (
          <QRPaymentModal
            plan={PLANS[showPayment]}
            userId={user.id}
            onSuccess={() => handlePaymentSuccess(showPayment)}
            onClose={() => setShowPayment(null)}
          />
        )}
      </AnimatePresence>

      {/* Cancel Confirmation */}
      <AnimatePresence>
        {showCancel && (
          <CancelModal onConfirm={handleCancel} onClose={() => setShowCancel(false)} />
        )}
      </AnimatePresence>

      {/* Payment History */}
      <AnimatePresence>
        {showHistory && user && (
          <PaymentHistoryModal userId={user.id} onClose={() => setShowHistory(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── QR Payment Modal (Multi-Step) ───────────────────────────

type PaymentStep = 'qr' | 'utr' | 'verifying' | 'success' | 'failed';

function QRPaymentModal({
  plan,
  userId,
  onSuccess,
  onClose,
}: {
  plan: PlanConfig;
  userId: string;
  onSuccess: () => void;
  onClose: () => void;
}) {
  const [step, setStep] = useState<PaymentStep>('qr');
  const [utr, setUtr] = useState('');
  const [utrError, setUtrError] = useState('');
  const [failMessage, setFailMessage] = useState('');
  const [copied, setCopied] = useState(false);

  const [countdown, setCountdown] = useState(10 * 60); // 10 min timer
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Countdown timer for QR step
  useEffect(() => {
    if (step === 'qr') {
      timerRef.current = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            clearInterval(timerRef.current!);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [step]);

  const copyUPI = () => {
    navigator.clipboard.writeText(UPI_ID).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleProceedToUTR = () => {
    setStep('utr');
  };

  const handleVerify = async () => {
    setUtrError('');

    const validation = validateUTR(utr);
    if (!validation.valid) {
      setUtrError(validation.error || 'Invalid UTR');
      return;
    }

    // Create payment record
    const record = createPaymentRecord(userId, plan.id, utr);

    setStep('verifying');

    // Verify
    const result = await verifyPayment(record.id, userId);
    if (result.success) {
      setStep('success');
    } else {
      setFailMessage(result.error || 'Verification failed');
      setStep('failed');
    }
  };

  const handleRetry = () => {
    setUtr('');
    setUtrError('');
    setFailMessage('');
    setStep('utr');
  };

  const canClose = step !== 'verifying';
  const formatTimer = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={canClose ? onClose : undefined} />
      <motion.div
        initial={{ scale: 0.92, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 20 }}
        className="relative w-full max-w-md rounded-2xl border border-border bg-bg-secondary overflow-hidden max-h-[90vh] overflow-y-auto"
        style={{ boxShadow: `0 0 80px ${plan.color}10` }}
      >
        {/* Close */}
        {canClose && (
          <button onClick={onClose} className="absolute top-4 right-4 z-20 p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
            <X className="w-4 h-4 text-text-muted" />
          </button>
        )}

        {/* Step indicator */}
        <div className="px-5 pt-5 pb-3">
          <div className="flex items-center gap-2">
            {['Scan QR', 'Enter UTR', 'Verify'].map((label, i) => {
              const stepIdx = ['qr', 'utr', 'verifying'].indexOf(step);
              const isActive = i <= stepIdx || step === 'success';
              const isDone = i < stepIdx || step === 'success';
              return (
                <div key={label} className="flex items-center gap-2 flex-1">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${isDone ? 'bg-accent-green text-bg-primary' : isActive ? 'text-bg-primary' : 'bg-bg-card text-text-muted'}`}
                    style={isActive && !isDone ? { background: plan.gradient } : undefined}
                  >
                    {isDone ? <Check className="w-3 h-3" /> : i + 1}
                  </div>
                  <span className={`text-[10px] font-medium hidden sm:block ${isActive ? 'text-text-primary' : 'text-text-muted'}`}>{label}</span>
                  {i < 2 && <div className={`flex-1 h-px ${isActive ? 'bg-accent-cyan/30' : 'bg-border'}`} />}
                </div>
              );
            })}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* ─── Step 1: QR Code ─── */}
          {step === 'qr' && (
            <motion.div key="qr" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="px-5 pb-5">
              {/* Plan info */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-bg-card/50 border border-border mb-4">
                <span className="text-2xl">{plan.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-bold text-text-primary">{plan.name}</p>
                  <p className="text-xs text-text-muted">{plan.duration} days access</p>
                </div>
                <span className="text-lg font-bold" style={{ color: plan.color }}>{plan.priceLabel}</span>
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center">
                <div className="relative bg-white rounded-2xl p-4 mb-4">
                  <UPIQRCode amount={plan.price} size={208} />
                  {/* Amount overlay */}
                  <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-lg text-sm font-bold text-white" style={{ background: plan.gradient }}>
                    Pay {plan.priceLabel}
                  </div>
                </div>

                {/* UPI ID */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs text-text-muted">UPI ID:</span>
                  <code className="text-sm font-mono text-accent-cyan font-semibold">{UPI_ID}</code>
                  <button onClick={copyUPI} className="p-1 rounded-md hover:bg-white/5 transition-colors cursor-pointer" title="Copy UPI ID">
                    {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-accent-green" /> : <Copy className="w-3.5 h-3.5 text-text-muted" />}
                  </button>
                </div>

                {/* Pay to name */}
                <p className="text-xs text-text-muted mb-3">Pay to: <strong className="text-text-secondary">{UPI_NAME}</strong></p>

                {/* Timer */}
                <div className="flex items-center gap-1.5 text-text-muted mb-4">
                  <Clock className="w-3 h-3" />
                  <span className="text-xs font-mono">QR expires in {formatTimer(countdown)}</span>
                </div>

                {/* Supported apps */}
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-[10px] text-text-muted">Pay using:</span>
                  {['Google Pay', 'PhonePe', 'Paytm', 'Any UPI'].map((app) => (
                    <span key={app} className="text-[10px] px-2 py-0.5 rounded-md bg-bg-card border border-border text-text-secondary">{app}</span>
                  ))}
                </div>

                {/* Instructions */}
                <div className="w-full p-3 rounded-xl bg-accent-cyan/5 border border-accent-cyan/15 mb-4">
                  <div className="flex gap-2 items-start">
                    <Smartphone className="w-4 h-4 text-accent-cyan mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-text-muted space-y-1">
                      <p><strong className="text-text-secondary">Step 1:</strong> Open any UPI app on your phone</p>
                      <p><strong className="text-text-secondary">Step 2:</strong> Scan this QR code or use UPI ID</p>
                      <p><strong className="text-text-secondary">Step 3:</strong> Pay exactly <strong className="text-accent-cyan">{plan.priceLabel}</strong></p>
                      <p><strong className="text-text-secondary">Step 4:</strong> Note the UTR / Transaction ID</p>
                    </div>
                  </div>
                </div>

                {/* Proceed button */}
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleProceedToUTR}
                  className="w-full py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 cursor-pointer"
                  style={{ background: plan.gradient }}
                >
                  I've Paid — Enter UTR
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ─── Step 2: Enter UTR ─── */}
          {step === 'utr' && (
            <motion.div key="utr" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="px-5 pb-5">
              <div className="text-center mb-5">
                <div className="w-14 h-14 rounded-2xl bg-accent-cyan/10 flex items-center justify-center mx-auto mb-3">
                  <ScanLine className="w-7 h-7 text-accent-cyan" />
                </div>
                <h3 className="text-lg font-bold text-text-primary font-[var(--font-display)]">Enter Transaction ID</h3>
                <p className="text-xs text-text-muted mt-1">Enter the UTR / Reference number from your UPI payment</p>
              </div>

              {/* Amount reminder */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-bg-card/50 border border-border mb-4">
                <div className="flex items-center gap-2">
                  <IndianRupee className="w-4 h-4 text-text-muted" />
                  <span className="text-sm text-text-muted">Amount paid</span>
                </div>
                <span className="text-sm font-bold" style={{ color: plan.color }}>{plan.priceLabel}</span>
              </div>

              {/* UTR Input */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-1.5">
                  UTR / Transaction Reference Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={utr}
                    onChange={(e) => {
                      // Only allow alphanumeric and /
                      const val = e.target.value.replace(/[^A-Za-z0-9/]/g, '');
                      setUtr(val);
                      setUtrError('');
                    }}
                    placeholder="12 digit UTR number likhein"
                    maxLength={22}
                    className={`w-full px-4 py-3 rounded-xl bg-bg-card border text-text-primary placeholder:text-text-muted/40 text-sm font-mono outline-none transition-all duration-200 focus:ring-2 focus:ring-accent-cyan/30 tracking-widest ${utrError ? 'border-accent-red/50' : 'border-border focus:border-accent-cyan/50'}`}
                    autoFocus
                  />
                  {/* Character count */}
                  <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono ${utr.length === 12 ? 'text-accent-green' : utr.length > 0 ? 'text-text-muted' : 'text-transparent'}`}>
                    {utr.length}/12
                  </span>
                </div>
                {utrError ? (
                  <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-accent-red mt-1.5 flex items-center gap-1">
                    <CircleAlert className="w-3 h-3 flex-shrink-0" /> {utrError}
                  </motion.p>
                ) : (
                  <p className="text-[10px] text-text-muted mt-1.5">
                    {utr.length === 0 ? 'Payment ke baad mila 12 digit ka number enter karein' :
                     utr.length < 12 ? `${12 - utr.length} digits aur likhein...` :
                     utr.length === 12 && /^[0-9]{12}$/.test(utr) ? '✅ Valid UTR format' :
                     'UPI Reference format detected'}
                  </p>
                )}
              </div>

              {/* Where to find UTR */}
              <div className="p-3 rounded-xl bg-accent-amber/5 border border-accent-amber/15 mb-5">
                <p className="text-[11px] text-accent-amber font-semibold mb-1">📍 Where to find your UTR?</p>
                <ul className="text-[10px] text-text-muted space-y-0.5">
                  <li>• <strong>Google Pay:</strong> Tap payment → "UPI transaction ID"</li>
                  <li>• <strong>PhonePe:</strong> Transaction details → "UTR"</li>
                  <li>• <strong>Paytm:</strong> Passbook → Transaction → "Reference ID"</li>
                  <li>• <strong>Bank SMS:</strong> Check for 12-22 digit reference number</li>
                </ul>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button onClick={() => setStep('qr')} className="flex-1 py-3 rounded-xl border border-border text-sm font-semibold text-text-secondary hover:bg-bg-card transition-colors cursor-pointer">
                  Back
                </button>
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleVerify}
                  className="flex-[2] py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 cursor-pointer"
                  style={{ background: plan.gradient }}
                >
                  <Shield className="w-4 h-4" />
                  Verify Payment
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ─── Step 3: Verifying ─── */}
          {step === 'verifying' && (
            <motion.div key="verifying" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="px-5 pb-8 pt-4">
              <div className="flex flex-col items-center text-center">
                {/* Animated verification */}
                <div className="relative w-24 h-24 mb-6">
                  <motion.div
                    className="absolute inset-0 rounded-full border-3 border-transparent"
                    style={{ borderTopColor: plan.color, borderRightColor: `${plan.color}60` }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                  />
                  <motion.div
                    className="absolute inset-2 rounded-full border-3 border-transparent"
                    style={{ borderBottomColor: 'var(--color-accent-purple)', borderLeftColor: 'var(--color-accent-purple)' }}
                    animate={{ rotate: -360 }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                      <Shield className="w-8 h-8" style={{ color: plan.color }} />
                    </motion.div>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-text-primary font-[var(--font-display)] mb-2">Verifying Payment</h3>
                <motion.p className="text-sm text-text-muted mb-4" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}>
                  Checking transaction with UPI network...
                </motion.p>

                <div className="w-full p-3 rounded-xl bg-bg-card/50 border border-border">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-text-muted">UTR Number</span>
                    <code className="text-text-secondary font-mono">{utr}</code>
                  </div>
                  <div className="flex items-center justify-between text-xs mt-2">
                    <span className="text-text-muted">Amount</span>
                    <span className="text-text-secondary font-semibold">{plan.priceLabel}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs mt-2">
                    <span className="text-text-muted">Status</span>
                    <span className="text-accent-amber font-semibold flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" /> Verifying
                    </span>
                  </div>
                </div>

                <p className="text-[10px] text-text-muted mt-4">Please do not close this window</p>
              </div>
            </motion.div>
          )}

          {/* ─── Step 4: Success ─── */}
          {step === 'success' && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="px-5 pb-6 pt-4">
              <div className="flex flex-col items-center text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.1 }}
                  className="w-20 h-20 rounded-full bg-accent-green/15 flex items-center justify-center mb-4"
                >
                  <CheckCircle2 className="w-10 h-10 text-accent-green" />
                </motion.div>

                <motion.h3 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-xl font-bold text-accent-green font-[var(--font-display)] mb-1">
                  Payment Verified! ✓
                </motion.h3>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-sm text-text-muted mb-5">
                  {plan.name} has been activated successfully
                </motion.p>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="w-full p-4 rounded-xl bg-accent-green/5 border border-accent-green/20 mb-5">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-text-muted">Plan</span>
                    <span className="font-semibold text-text-primary">{plan.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-text-muted">Amount</span>
                    <span className="font-semibold text-accent-green">{plan.priceLabel}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-text-muted">Duration</span>
                    <span className="font-semibold text-text-primary">{plan.duration} days</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-muted">UTR</span>
                    <code className="font-mono text-text-secondary text-xs">{utr}</code>
                  </div>
                </motion.div>

                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { onSuccess(); }}
                  className="w-full py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 cursor-pointer"
                  style={{ background: plan.gradient }}
                >
                  <Sparkles className="w-4 h-4" />
                  Start Using Pro Features
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ─── Step 5: Failed ─── */}
          {step === 'failed' && (
            <motion.div key="failed" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="px-5 pb-6 pt-4">
              <div className="flex flex-col items-center text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                  className="w-20 h-20 rounded-full bg-accent-red/15 flex items-center justify-center mb-4"
                >
                  <XCircle className="w-10 h-10 text-accent-red" />
                </motion.div>

                <h3 className="text-xl font-bold text-accent-red font-[var(--font-display)] mb-1">Verification Failed</h3>
                <p className="text-sm text-text-muted mb-5 max-w-xs">{failMessage}</p>

                <div className="w-full p-3 rounded-xl bg-accent-red/5 border border-accent-red/15 mb-5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-text-muted">UTR Entered</span>
                    <code className="text-text-secondary font-mono">{utr}</code>
                  </div>
                  <div className="flex items-center justify-between text-xs mt-2">
                    <span className="text-text-muted">Status</span>
                    <span className="text-accent-red font-semibold">Failed</span>
                  </div>
                </div>

                <div className="w-full p-3 rounded-xl bg-accent-amber/5 border border-accent-amber/15 mb-5">
                  <p className="text-[11px] text-text-muted text-left">
                    <strong className="text-accent-amber">💡 Common issues:</strong><br />
                    • Double-check the UTR number for typos<br />
                    • Make sure the payment was for exactly {plan.priceLabel}<br />
                    • Wait 1-2 minutes if payment was just made<br />
                    • Check if the payment was successful in your UPI app
                  </p>
                </div>

                <div className="flex gap-3 w-full">
                  <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-border text-sm font-semibold text-text-secondary hover:bg-bg-card transition-colors cursor-pointer">
                    Close
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleRetry}
                    className="flex-[2] py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 cursor-pointer border"
                    style={{ borderColor: `${plan.color}40`, color: plan.color, background: `${plan.color}10` }}
                  >
                    <RefreshCw className="w-4 h-4" />
                    Try Again
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

// ─── Payment History Modal ───────────────────────────────────

function PaymentHistoryModal({ userId, onClose }: { userId: string; onClose: () => void }) {
  const payments = getUserPayments(userId);

  const statusConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
    pending: { color: '#ffb300', icon: <Clock className="w-3 h-3" />, label: 'Pending' },
    verifying: { color: '#00e5ff', icon: <Loader2 className="w-3 h-3 animate-spin" />, label: 'Verifying' },
    verified: { color: '#00e676', icon: <CheckCircle2 className="w-3 h-3" />, label: 'Verified' },
    failed: { color: '#ff1744', icon: <XCircle className="w-3 h-3" />, label: 'Failed' },
    rejected: { color: '#ff1744', icon: <AlertTriangle className="w-3 h-3" />, label: 'Rejected' },
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.92, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 20 }}
        className="relative w-full max-w-lg rounded-2xl border border-border bg-bg-secondary overflow-hidden max-h-[80vh] flex flex-col"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-accent-cyan" />
            <h3 className="text-base font-bold text-text-primary">Payment History</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
            <X className="w-4 h-4 text-text-muted" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {payments.length === 0 ? (
            <div className="text-center py-12">
              <History className="w-10 h-10 text-text-muted mx-auto mb-3 opacity-30" />
              <p className="text-sm text-text-muted">No payment history yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {payments.map((p) => {
                const sc = statusConfig[p.status] || statusConfig.pending;
                const plan = PLANS[p.planId];
                return (
                  <div key={p.id} className="p-3 rounded-xl border border-border bg-bg-card/50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{plan.icon}</span>
                        <span className="text-sm font-semibold text-text-primary">{plan.name}</span>
                      </div>
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold" style={{ backgroundColor: `${sc.color}15`, color: sc.color }}>
                        {sc.icon}
                        {sc.label}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-text-muted">Amount: </span>
                        <span className="text-text-secondary font-semibold">₹{p.amount}</span>
                      </div>
                      <div>
                        <span className="text-text-muted">UTR: </span>
                        <code className="text-text-secondary font-mono">{p.utrNumber}</code>
                      </div>
                      <div>
                        <span className="text-text-muted">Date: </span>
                        <span className="text-text-secondary">{new Date(p.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="text-text-muted">Time: </span>
                        <span className="text-text-secondary">{new Date(p.createdAt).toLocaleTimeString()}</span>
                      </div>
                    </div>
                    {p.failReason && (
                      <p className="text-[10px] text-accent-red mt-2 bg-accent-red/5 px-2 py-1 rounded-md">{p.failReason}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Trial Start Card ────────────────────────────────────────

function TrialStartCard({ onStart }: { onStart: () => void }) {
  const [starting, setStarting] = useState(false);

  const handleStart = async () => {
    setStarting(true);
    await new Promise((r) => setTimeout(r, 600));
    onStart();
    setStarting(false);
  };

  return (
    <div className="rounded-2xl border border-accent-cyan/30 bg-gradient-to-br from-accent-cyan/5 via-bg-secondary/50 to-accent-purple/5 overflow-hidden">
      <div className="p-5 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-14 h-14 rounded-2xl bg-accent-cyan/10 flex items-center justify-center text-2xl flex-shrink-0">
              🎁
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary">Try Pro Free for 24 Hours</h3>
              <p className="text-xs text-text-muted mt-0.5">
                Unlock all 20 presets, anime character voices, unlimited recording & more — no payment needed!
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: starting ? 1 : 1.03 }}
            whileTap={{ scale: starting ? 1 : 0.97 }}
            onClick={handleStart}
            disabled={starting}
            className="px-6 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-accent-cyan to-accent-purple flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-wait whitespace-nowrap flex-shrink-0"
          >
            {starting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Starting...</>
            ) : (
              <><Sparkles className="w-4 h-4" /> Start Free Trial</>
            )}
          </motion.button>
        </div>
        <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-border">
          {['All 20 voice presets', '13 Anime characters', 'Unlimited recording', 'Live monitor', 'One-time only'].map((f) => (
            <span key={f} className="text-[10px] px-2 py-0.5 rounded-md bg-accent-cyan/8 text-accent-cyan border border-accent-cyan/15">
              ✓ {f}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Cancel Modal ────────────────────────────────────────────

function CancelModal({ onConfirm, onClose }: { onConfirm: () => void; onClose: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="relative w-full max-w-sm rounded-2xl border border-accent-red/30 bg-bg-secondary p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-accent-red/15 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-accent-red" />
          </div>
          <div>
            <h3 className="text-base font-bold text-text-primary">Cancel Subscription?</h3>
            <p className="text-xs text-text-muted">This action cannot be undone</p>
          </div>
        </div>
        <p className="text-sm text-text-secondary mb-5">Your premium features will be removed immediately. You'll be switched back to the Free plan.</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold text-text-secondary hover:bg-bg-card transition-colors cursor-pointer">Keep Plan</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl bg-accent-red/15 text-accent-red border border-accent-red/30 text-sm font-semibold hover:bg-accent-red/25 transition-colors cursor-pointer">Cancel Plan</button>
        </div>
      </motion.div>
    </motion.div>
  );
}
