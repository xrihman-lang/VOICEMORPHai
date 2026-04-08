export type PlanId = 'free' | 'pro_15' | 'pro_30';

export interface PlanConfig {
  id: PlanId;
  name: string;
  duration: number; // days
  price: number;
  priceLabel: string;
  perDay: string;
  icon: string;
  color: string;
  gradient: string;
  features: string[];
  badge: string;
  popular?: boolean;
}

export const PLANS: Record<PlanId, PlanConfig> = {
  free: {
    id: 'free',
    name: 'Free',
    duration: 0,
    price: 0,
    priceLabel: '₹0',
    perDay: 'Forever',
    icon: '🎤',
    color: '#8888a8',
    gradient: 'linear-gradient(135deg, #2a2a45, #1a1a2e)',
    badge: 'FREE',
    features: [
      'All 7 classic voice presets',
      'Upload & process files',
      'Basic pitch & speed control',
      'Download as WAV',
      'Max 60s recording',
    ],
  },
  pro_15: {
    id: 'pro_15',
    name: 'Pro 15 Days',
    duration: 15,
    price: 99,
    priceLabel: '₹99',
    perDay: '₹6.6/day',
    icon: '⚡',
    color: '#00e5ff',
    gradient: 'linear-gradient(135deg, #00e5ff, #8b5cf6)',
    badge: 'PRO',
    features: [
      'All 28 voice presets unlocked',
      '13 Anime + 8 Cartoon voices',
      'Gojo, Sukuna, Mickey, Minion & more',
      'Unlimited recording time',
      'Live monitor mode',
      'HD audio export',
    ],
  },
  pro_30: {
    id: 'pro_30',
    name: 'Pro 30 Days',
    duration: 30,
    price: 149,
    priceLabel: '₹149',
    perDay: '₹4.9/day',
    icon: '👑',
    color: '#ffb300',
    gradient: 'linear-gradient(135deg, #ffb300, #ff00e5)',
    badge: 'PRO+',
    popular: true,
    features: [
      'Everything in Pro 15 Days',
      'All 28 presets + 21 character voices',
      'Anime, Cartoon, Villains & more',
      'Unlimited recording time',
      'Live monitor + HD export',
      'Save 33% vs 15-day plan',
    ],
  },
};

// ─── Subscription ────────────────────────────────────────────

export interface Subscription {
  planId: PlanId;
  activatedAt: number;
  expiresAt: number;
  transactionId: string;
}

const SUBS_KEY = 'voicemorph_subscriptions';

function getSubsStore(): Record<string, Subscription> {
  try {
    const raw = localStorage.getItem(SUBS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveSubsStore(store: Record<string, Subscription>): void {
  localStorage.setItem(SUBS_KEY, JSON.stringify(store));
}

export function getUserSubscription(userId: string): Subscription | null {
  const store = getSubsStore();
  const sub = store[userId];
  if (!sub) return null;
  return sub;
}

export function isSubscriptionActive(sub: Subscription | null): boolean {
  if (!sub) return false;
  if (sub.planId === 'free') return true;
  return Date.now() < sub.expiresAt;
}

export function getActivePlan(userId: string): PlanId {
  const sub = getUserSubscription(userId);
  if (!sub) return 'free';
  if (sub.planId === 'free') return 'free';
  if (Date.now() >= sub.expiresAt) return 'free';
  return sub.planId;
}

export function getRemainingTime(sub: Subscription | null): {
  days: number;
  hours: number;
  minutes: number;
  totalMs: number;
  expired: boolean;
  percentage: number;
} {
  if (!sub || sub.planId === 'free') {
    return { days: 0, hours: 0, minutes: 0, totalMs: 0, expired: true, percentage: 0 };
  }

  const now = Date.now();
  const remaining = sub.expiresAt - now;
  const total = sub.expiresAt - sub.activatedAt;

  if (remaining <= 0) {
    return { days: 0, hours: 0, minutes: 0, totalMs: 0, expired: true, percentage: 0 };
  }

  const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  const percentage = Math.max(0, Math.min(100, (remaining / total) * 100));

  return { days, hours, minutes, totalMs: remaining, expired: false, percentage };
}

export function activateSubscription(userId: string, planId: PlanId, txnId: string): Subscription {
  const plan = PLANS[planId];
  const now = Date.now();

  const existing = getUserSubscription(userId);
  let startFrom = now;
  if (existing && isSubscriptionActive(existing) && existing.planId !== 'free') {
    startFrom = existing.expiresAt;
  }

  const sub: Subscription = {
    planId,
    activatedAt: now,
    expiresAt: startFrom + plan.duration * 24 * 60 * 60 * 1000,
    transactionId: txnId,
  };

  const store = getSubsStore();
  store[userId] = sub;
  saveSubsStore(store);

  return sub;
}

export function cancelSubscription(userId: string): void {
  const store = getSubsStore();
  delete store[userId];
  saveSubsStore(store);
}

// ─── Payment Records ─────────────────────────────────────────

export type PaymentStatus = 'pending' | 'verifying' | 'verified' | 'failed' | 'rejected';

export interface PaymentRecord {
  id: string;
  userId: string;
  planId: PlanId;
  amount: number;
  utrNumber: string;
  status: PaymentStatus;
  createdAt: number;
  verifiedAt?: number;
  failReason?: string;
}

const PAYMENTS_KEY = 'voicemorph_payments';

function getPaymentsStore(): PaymentRecord[] {
  try {
    const raw = localStorage.getItem(PAYMENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function savePaymentsStore(records: PaymentRecord[]): void {
  localStorage.setItem(PAYMENTS_KEY, JSON.stringify(records));
}

export function getUserPayments(userId: string): PaymentRecord[] {
  return getPaymentsStore().filter((p) => p.userId === userId).sort((a, b) => b.createdAt - a.createdAt);
}

export function createPaymentRecord(userId: string, planId: PlanId, utrNumber: string): PaymentRecord {
  const plan = PLANS[planId];
  const record: PaymentRecord = {
    id: 'pay_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8),
    userId,
    planId,
    amount: plan.price,
    utrNumber: utrNumber.trim(),
    status: 'pending',
    createdAt: Date.now(),
  };

  const store = getPaymentsStore();
  store.push(record);
  savePaymentsStore(store);

  return record;
}

export function updatePaymentStatus(paymentId: string, status: PaymentStatus, failReason?: string): PaymentRecord | null {
  const store = getPaymentsStore();
  const idx = store.findIndex((p) => p.id === paymentId);
  if (idx === -1) return null;

  store[idx].status = status;
  if (status === 'verified') store[idx].verifiedAt = Date.now();
  if (failReason) store[idx].failReason = failReason;

  savePaymentsStore(store);
  return store[idx];
}

/**
 * Validate UTR (Unique Transaction Reference) number.
 * 
 * UPI UTR format: exactly 12 digits (numeric only)
 * Also accepts UPI Ref format: alphanumeric 12-22 chars (e.g. UPI/CR/...)
 * 
 * Checks:
 * 1. Not empty
 * 2. Format validation — 12 digit number OR valid UPI reference
 * 3. Duplicate check — already used UTR ko reject karo
 */
export function validateUTR(utr: string): { valid: boolean; error?: string } {
  const cleaned = utr.trim();

  // 1. Empty check
  if (!cleaned) {
    return { valid: false, error: 'UTR / Transaction ID is required' };
  }

  // 2. Format validation
  // Standard UPI UTR: exactly 12 digits
  const isStandardUTR = /^[0-9]{12}$/.test(cleaned);
  // Extended UPI Reference: alphanumeric, 12-22 characters (covers formats like 123456789012, UPI/CR/123456789, etc.)
  const isExtendedRef = /^[A-Za-z0-9/]{12,22}$/.test(cleaned);

  if (!isStandardUTR && !isExtendedRef) {
    if (/[^A-Za-z0-9/]/.test(cleaned)) {
      return { valid: false, error: 'Galat UTR! Sirf numbers aur letters allowed hain. Special characters mat likhein.' };
    }
    if (cleaned.length < 12) {
      return { valid: false, error: `Galat UTR! 12 digits ka Transaction ID sahi se likhein. Aapne sirf ${cleaned.length} digits likhe hain.` };
    }
    if (cleaned.length > 22) {
      return { valid: false, error: 'UTR bahut lamba hai. 12-digit UTR number check karein apni UPI app mein.' };
    }
    return { valid: false, error: 'Galat UTR format! 12 digit ka Transaction ID likhein jo payment ke baad mila tha.' };
  }

  // 3. Duplicate check — pehle se use ho chuka hai?
  const allPayments = getPaymentsStore();
  const existing = allPayments.find(
    (p) => p.utrNumber.toLowerCase() === cleaned.toLowerCase() &&
      (p.status === 'verified' || p.status === 'verifying')
  );
  if (existing) {
    return { valid: false, error: 'Ye UTR pehle hi use ho chuka hai! Fake transaction na karein. Agar aapne naya payment kiya hai toh naya UTR enter karein.' };
  }

  return { valid: true };
}

/**
 * Verify payment by UTR number.
 * 
 * Flow:
 * 1. UTR format already validated by validateUTR()
 * 2. Set status to 'verifying'
 * 3. Check UTR against database (duplicate check again for safety)
 * 4. If valid 12-digit UTR → auto-verify & activate Pro plan
 * 5. If anything wrong → mark as failed with reason
 */
export async function verifyPayment(
  paymentId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const allPayments = getPaymentsStore();
  const payment = allPayments.find((p) => p.id === paymentId);
  if (!payment) return { success: false, error: 'Payment record not found' };

  // Step 1: Set status to verifying
  updatePaymentStatus(paymentId, 'verifying');

  // Step 2: Verification delay (simulating bank API check)
  await new Promise((r) => setTimeout(r, 2000 + Math.random() * 1500));

  const utr = payment.utrNumber.trim();

  // Step 3: Double-check duplicate (safety check)
  const duplicate = allPayments.find(
    (p) => p.id !== paymentId &&
      p.utrNumber.toLowerCase() === utr.toLowerCase() &&
      p.status === 'verified'
  );
  if (duplicate) {
    updatePaymentStatus(paymentId, 'failed', 'Ye UTR pehle hi use ho chuka hai! Duplicate transaction detect hua.');
    return { success: false, error: 'Ye UTR pehle hi use ho chuka hai! Fake transaction na karein.' };
  }

  // Step 4: Validate UTR format one more time
  const isValidFormat = /^[0-9]{12}$/.test(utr) || /^[A-Za-z0-9/]{12,22}$/.test(utr);
  if (!isValidFormat) {
    updatePaymentStatus(paymentId, 'failed', 'Galat UTR format. 12 digit ka valid Transaction ID chahiye.');
    return { success: false, error: 'Galat UTR! 12 digits ka Transaction ID sahi se likhein.' };
  }

  // Step 5: All checks passed → Verify & Activate!
  updatePaymentStatus(paymentId, 'verified');
  activateSubscription(userId, payment.planId, payment.utrNumber);

  return { success: true };
}

// ─── Trial System ────────────────────────────────────────────

export const TRIAL_DURATION_MS = 3 * 60 * 60 * 1000; // 3 hours

export interface TrialStatus {
  isActive: boolean;
  isUsed: boolean;
  startedAt: number | null;
  expiresAt: number | null;
  remainingMs: number;
  remainingHours: number;
  remainingMinutes: number;
  remainingSeconds: number;
  percentage: number;
}

export function getTrialStatus(trialStartedAt: number | null, isTrialUsed: boolean): TrialStatus {
  if (!trialStartedAt || !isTrialUsed) {
    return { isActive: false, isUsed: isTrialUsed, startedAt: null, expiresAt: null, remainingMs: 0, remainingHours: 0, remainingMinutes: 0, remainingSeconds: 0, percentage: 0 };
  }

  const expiresAt = trialStartedAt + TRIAL_DURATION_MS;
  const remaining = expiresAt - Date.now();

  if (remaining <= 0) {
    return { isActive: false, isUsed: true, startedAt: trialStartedAt, expiresAt, remainingMs: 0, remainingHours: 0, remainingMinutes: 0, remainingSeconds: 0, percentage: 0 };
  }

  return {
    isActive: true,
    isUsed: true,
    startedAt: trialStartedAt,
    expiresAt,
    remainingMs: remaining,
    remainingHours: Math.floor(remaining / (1000 * 60 * 60)),
    remainingMinutes: Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60)),
    remainingSeconds: Math.floor((remaining % (1000 * 60)) / 1000),
    percentage: Math.max(0, Math.min(100, (remaining / TRIAL_DURATION_MS) * 100)),
  };
}

/**
 * Get the effective active plan considering trial status.
 * If trial is active AND no paid subscription, treat as pro_15.
 */
export function getEffectivePlan(userId: string, trialStartedAt: number | null, isTrialUsed: boolean): PlanId {
  const paidPlan = getActivePlan(userId);
  if (paidPlan !== 'free') return paidPlan;

  // Check trial
  const trial = getTrialStatus(trialStartedAt, isTrialUsed);
  if (trial.isActive) return 'pro_15'; // Trial gives Pro 15 access

  return 'free';
}

// ─── Feature Gating ──────────────────────────────────────────

export const FREE_PRESETS = ['robot', 'deep', 'female', 'anime', 'chipmunk', 'echo', 'custom'];
export const MAX_FREE_RECORDING_SECONDS = 60;

export function canUsePreset(planId: PlanId, presetKey: string): boolean {
  if (planId !== 'free') return true;
  return FREE_PRESETS.includes(presetKey);
}

export function getMaxRecordingSeconds(planId: PlanId): number {
  if (planId === 'free') return MAX_FREE_RECORDING_SECONDS;
  return Infinity;
}

// ─── Admin Functions ─────────────────────────────────────────

export function getAllPayments(): PaymentRecord[] {
  return getPaymentsStore().sort((a, b) => b.createdAt - a.createdAt);
}

export function getAllSubscriptions(): Record<string, Subscription> {
  return getSubsStore();
}

export function adminApprovePayment(paymentId: string): { success: boolean; error?: string } {
  const store = getPaymentsStore();
  const payment = store.find((p) => p.id === paymentId);
  if (!payment) return { success: false, error: 'Payment not found' };
  if (payment.status === 'verified') return { success: false, error: 'Already verified' };

  updatePaymentStatus(paymentId, 'verified');
  activateSubscription(payment.userId, payment.planId, payment.utrNumber);
  return { success: true };
}

export function adminRejectPayment(paymentId: string, reason: string): { success: boolean; error?: string } {
  const store = getPaymentsStore();
  const payment = store.find((p) => p.id === paymentId);
  if (!payment) return { success: false, error: 'Payment not found' };
  if (payment.status === 'verified') return { success: false, error: 'Cannot reject verified payment' };

  updatePaymentStatus(paymentId, 'rejected', reason || 'Rejected by admin');
  return { success: true };
}

export function adminDeletePayment(paymentId: string): void {
  const store = getPaymentsStore();
  const filtered = store.filter((p) => p.id !== paymentId);
  savePaymentsStore(filtered);
}

export function adminRevokeSubscription(userId: string): void {
  cancelSubscription(userId);
}

export function adminGrantSubscription(userId: string, planId: PlanId): void {
  activateSubscription(userId, planId, 'admin_grant_' + Date.now().toString(36));
}

export function getPaymentStats(): {
  total: number;
  pending: number;
  verified: number;
  failed: number;
  rejected: number;
  totalRevenue: number;
} {
  const payments = getPaymentsStore();
  return {
    total: payments.length,
    pending: payments.filter((p) => p.status === 'pending' || p.status === 'verifying').length,
    verified: payments.filter((p) => p.status === 'verified').length,
    failed: payments.filter((p) => p.status === 'failed').length,
    rejected: payments.filter((p) => p.status === 'rejected').length,
    totalRevenue: payments.filter((p) => p.status === 'verified').reduce((sum, p) => sum + p.amount, 0),
  };
}

// ─── Admin Voice Tuning Overrides ────────────────────────────

export interface VoiceTuningOverride {
  pitch?: number;
  speed?: number;
  reverb?: number;
}

const TUNING_KEY = 'voicemorph_voice_tuning';

export function getVoiceTuningOverrides(): Record<string, VoiceTuningOverride> {
  try {
    const raw = localStorage.getItem(TUNING_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

export function setVoiceTuningOverride(presetKey: string, override: VoiceTuningOverride): void {
  const store = getVoiceTuningOverrides();
  store[presetKey] = override;
  localStorage.setItem(TUNING_KEY, JSON.stringify(store));
}

export function removeVoiceTuningOverride(presetKey: string): void {
  const store = getVoiceTuningOverrides();
  delete store[presetKey];
  localStorage.setItem(TUNING_KEY, JSON.stringify(store));
}

export function clearAllVoiceTuningOverrides(): void {
  localStorage.removeItem(TUNING_KEY);
}

// UPI Config
export const UPI_ID = 'zz8166452@oksbi';
export const UPI_NAME = 'VoiceMorph Pro';
