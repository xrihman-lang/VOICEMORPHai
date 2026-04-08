import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, LogOut, Users, CreditCard, CheckCircle2, XCircle, Clock, AlertTriangle,
  IndianRupee, Crown, Trash2, Eye, EyeOff, Lock, ChevronDown, ChevronUp,
  RefreshCw, Search, Gift, Ban, Loader2, ArrowLeft,
} from 'lucide-react';
import { adminLogin, adminLogout, isAdminLoggedIn, getAllUsers, type User } from '../lib/auth';
import {
  getAllPayments, getPaymentStats, adminApprovePayment,
  adminRejectPayment, adminDeletePayment, adminRevokeSubscription, adminGrantSubscription,
  PLANS, type PaymentRecord, type PlanId, getActivePlan, getRemainingTime,
  getUserSubscription,
  getVoiceTuningOverrides, setVoiceTuningOverride, removeVoiceTuningOverride, clearAllVoiceTuningOverrides,
  type VoiceTuningOverride,
} from '../lib/subscription';
import { PRESETS, PRESET_CATEGORIES, type VoicePreset, type PresetCategory } from '../lib/audioEngine';

interface AdminPanelProps {
  onExit: () => void;
}

export default function AdminPanel({ onExit }: AdminPanelProps) {
  const [loggedIn, setLoggedIn] = useState(isAdminLoggedIn());

  if (!loggedIn) {
    return <AdminLogin onSuccess={() => setLoggedIn(true)} onExit={onExit} />;
  }

  return <AdminDashboard onLogout={() => { adminLogout(); setLoggedIn(false); }} onExit={onExit} />;
}

// ─── Admin Login ─────────────────────────────────────────────

function AdminLogin({ onSuccess, onExit }: { onSuccess: () => void; onExit: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password) {
      setError('Username aur Password dono required hain');
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    const ok = adminLogin(username, password);
    setLoading(false);
    if (ok) {
      onSuccess();
    } else {
      setError('Galat Username ya Password!');
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[50%] -translate-x-1/2 w-[400px] h-[400px] rounded-full opacity-[0.06] blur-3xl bg-[radial-gradient(circle,#ff1744,transparent_70%)]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="relative z-10 w-full max-w-sm"
      >
        <button onClick={onExit} className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors mb-6 cursor-pointer text-sm">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-accent-red/10 border border-accent-red/20 flex items-center justify-center mx-auto mb-3">
            <Shield className="w-8 h-8 text-accent-red" />
          </div>
          <h1 className="text-2xl font-bold font-[var(--font-display)] text-text-primary">Admin Panel</h1>
          <p className="text-xs text-text-muted mt-1">🔐 Authorized access only</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-bg-secondary/70 backdrop-blur-xl p-6 space-y-4">
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-accent-red/10 border border-accent-red/25">
                  <AlertTriangle className="w-4 h-4 text-accent-red flex-shrink-0" />
                  <p className="text-sm text-accent-red">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-1.5">Username</label>
            <div className="relative">
              <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Admin username"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-bg-card border border-border text-text-primary placeholder:text-text-muted/40 text-sm outline-none focus:border-accent-red/50 focus:ring-2 focus:ring-accent-red/20 transition-all" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input type={showPass ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Admin password"
                className="w-full pl-10 pr-12 py-3 rounded-xl bg-bg-card border border-border text-text-primary placeholder:text-text-muted/40 text-sm outline-none focus:border-accent-red/50 focus:ring-2 focus:ring-accent-red/20 transition-all" />
              <button type="button" onClick={() => setShowPass((s) => !s)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary cursor-pointer" tabIndex={-1}>
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <motion.button type="submit" disabled={loading} whileHover={{ scale: loading ? 1 : 1.01 }} whileTap={{ scale: loading ? 1 : 0.98 }}
            className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-accent-red to-accent-magenta flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-wait">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
            {loading ? 'Authenticating...' : 'Login to Admin'}
          </motion.button>
        </form>

        <p className="text-center text-[10px] text-text-muted/40 mt-4">Ye panel sirf admin ke liye hai</p>
      </motion.div>
    </div>
  );
}

// ─── Admin Dashboard ─────────────────────────────────────────

type AdminTab = 'payments' | 'users' | 'voicetune';

function AdminDashboard({ onLogout, onExit }: { onLogout: () => void; onExit: () => void }) {
  const [tab, setTab] = useState<AdminTab>('payments');
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState(getPaymentStats());
  const [search, setSearch] = useState('');


  const refresh = useCallback(() => {
    setPayments(getAllPayments());
    setUsers(getAllUsers());
    setStats(getPaymentStats());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const filteredPayments = payments.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return p.utrNumber.toLowerCase().includes(q) || p.userId.toLowerCase().includes(q) || p.status.includes(q) || PLANS[p.planId].name.toLowerCase().includes(q);
  });

  const filteredUsers = users.filter((u) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return u.email.toLowerCase().includes(q) || u.displayName.toLowerCase().includes(q) || u.id.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full opacity-[0.04] blur-3xl bg-[radial-gradient(circle,#ff1744,transparent_70%)]" />
      </div>

      <div className="relative z-10">
        {/* Top bar */}
        <div className="border-b border-border bg-bg-secondary/80 backdrop-blur-xl sticky top-0 z-30">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={onExit} className="p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                <ArrowLeft className="w-4 h-4 text-text-muted" />
              </button>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-accent-red" />
                <h1 className="text-lg font-bold font-[var(--font-display)] text-text-primary">Admin <span className="text-accent-red">Panel</span></h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={refresh} className="p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer" title="Refresh">
                <RefreshCw className="w-4 h-4 text-text-muted" />
              </button>
              <button onClick={onLogout} className="flex items-center gap-2 px-3 py-2 rounded-lg text-accent-red hover:bg-accent-red/10 transition-colors cursor-pointer text-sm font-medium">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* Stats cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Total Revenue', value: `₹${stats.totalRevenue}`, icon: <IndianRupee className="w-5 h-5" />, color: '#00e676' },
              { label: 'Pending', value: stats.pending.toString(), icon: <Clock className="w-5 h-5" />, color: '#ffb300' },
              { label: 'Verified', value: stats.verified.toString(), icon: <CheckCircle2 className="w-5 h-5" />, color: '#00e5ff' },
              { label: 'Total Users', value: users.length.toString(), icon: <Users className="w-5 h-5" />, color: '#8b5cf6' },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="p-4 rounded-xl border border-border bg-bg-secondary/50">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>{stat.icon}</div>
                </div>
                <p className="text-2xl font-bold font-[var(--font-display)]" style={{ color: stat.color }}>{stat.value}</p>
                <p className="text-[10px] text-text-muted uppercase tracking-wider mt-0.5">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Tab + Search */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <div className="flex bg-bg-secondary rounded-xl p-1 border border-border">
              {([['payments', 'Payments', <CreditCard key="p" className="w-3.5 h-3.5" />], ['users', 'Users', <Users key="u" className="w-3.5 h-3.5" />], ['voicetune', 'Voice Tuning', <span key="v" className="text-sm">🎛️</span>]] as [AdminTab, string, React.ReactNode][]).map(([t, label, icon]) => (
                <button key={t} onClick={() => { setTab(t); setSearch(''); }}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${tab === t ? 'bg-bg-card text-text-primary border border-border' : 'text-text-muted hover:text-text-secondary'}`}>
                  {icon} {label}
                  {t === 'payments' && stats.pending > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 rounded-full bg-accent-amber/20 text-accent-amber text-[9px] font-bold">{stats.pending}</span>
                  )}
                </button>
              ))}
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={tab === 'payments' ? 'Search UTR, user, status...' : 'Search email, name...'}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-bg-card border border-border text-text-primary placeholder:text-text-muted/40 text-sm outline-none focus:border-accent-cyan/50 transition-all" />
            </div>
          </div>

          {/* Content */}
          <AnimatePresence mode="wait">
            {tab === 'payments' ? (
              <motion.div key="payments" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <PaymentsTable payments={filteredPayments} users={users} onRefresh={refresh} />
              </motion.div>
            ) : tab === 'users' ? (
              <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <UsersTable users={filteredUsers} onRefresh={refresh} />
              </motion.div>
            ) : (
              <motion.div key="voicetune" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <VoiceTuningPanel />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ─── Payments Table ──────────────────────────────────────────

function PaymentsTable({ payments, users, onRefresh }: { payments: PaymentRecord[]; users: User[]; onRefresh: () => void }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const getUserName = (userId: string) => {
    const u = users.find((u) => u.id === userId);
    return u ? u.displayName : userId.slice(0, 12) + '...';
  };

  const getUserEmail = (userId: string) => {
    const u = users.find((u) => u.id === userId);
    return u?.email || 'Unknown';
  };

  const handleApprove = async (paymentId: string) => {
    setActionLoading(paymentId);
    await new Promise((r) => setTimeout(r, 500));
    adminApprovePayment(paymentId);
    setActionLoading(null);
    onRefresh();
  };

  const handleReject = async (paymentId: string) => {
    setActionLoading(paymentId);
    await new Promise((r) => setTimeout(r, 500));
    adminRejectPayment(paymentId, rejectReason || 'Payment not verified');
    setActionLoading(null);
    setRejectId(null);
    setRejectReason('');
    onRefresh();
  };

  const handleDelete = (paymentId: string) => {
    if (confirm('Delete this payment record permanently?')) {
      adminDeletePayment(paymentId);
      onRefresh();
    }
  };

  const statusConfig: Record<string, { color: string; icon: React.ReactNode; label: string; bg: string }> = {
    pending: { color: '#ffb300', icon: <Clock className="w-3 h-3" />, label: 'Pending', bg: '#ffb30015' },
    verifying: { color: '#00e5ff', icon: <Loader2 className="w-3 h-3 animate-spin" />, label: 'Verifying', bg: '#00e5ff15' },
    verified: { color: '#00e676', icon: <CheckCircle2 className="w-3 h-3" />, label: 'Verified', bg: '#00e67615' },
    failed: { color: '#ff1744', icon: <XCircle className="w-3 h-3" />, label: 'Failed', bg: '#ff174415' },
    rejected: { color: '#ff1744', icon: <Ban className="w-3 h-3" />, label: 'Rejected', bg: '#ff174415' },
  };

  if (payments.length === 0) {
    return (
      <div className="text-center py-16 rounded-2xl border border-border bg-bg-secondary/30">
        <CreditCard className="w-10 h-10 text-text-muted mx-auto mb-3 opacity-30" />
        <p className="text-sm text-text-muted">No payments found</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {payments.map((p) => {
        const sc = statusConfig[p.status] || statusConfig.pending;
        const plan = PLANS[p.planId];
        const isExpanded = expandedId === p.id;
        const isPending = p.status === 'pending' || p.status === 'verifying';
        const isLoading = actionLoading === p.id;

        return (
          <motion.div key={p.id} layout className="rounded-xl border border-border bg-bg-secondary/50 overflow-hidden">
            {/* Row */}
            <div className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-white/[0.02] transition-colors" onClick={() => setExpandedId(isExpanded ? null : p.id)}>
              <span className="text-lg">{plan.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-text-primary truncate">{getUserName(p.userId)}</p>
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-bold flex items-center gap-1" style={{ backgroundColor: sc.bg, color: sc.color }}>
                    {sc.icon} {sc.label}
                  </span>
                </div>
                <p className="text-xs text-text-muted truncate">UTR: {p.utrNumber} • {plan.name}</p>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold" style={{ color: plan.color }}>₹{p.amount}</p>
                <p className="text-[10px] text-text-muted">{new Date(p.createdAt).toLocaleDateString()}</p>
              </div>
              {isExpanded ? <ChevronUp className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4 text-text-muted" />}
            </div>

            {/* Expanded */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="px-4 pb-4 border-t border-border pt-3">
                    <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                      <div><span className="text-text-muted">Payment ID:</span><br /><code className="text-text-secondary font-mono text-[10px]">{p.id}</code></div>
                      <div><span className="text-text-muted">User ID:</span><br /><code className="text-text-secondary font-mono text-[10px]">{p.userId}</code></div>
                      <div><span className="text-text-muted">Email:</span><br /><span className="text-text-secondary">{getUserEmail(p.userId)}</span></div>
                      <div><span className="text-text-muted">UTR Number:</span><br /><code className="text-accent-cyan font-mono font-bold">{p.utrNumber}</code></div>
                      <div><span className="text-text-muted">Plan:</span><br /><span className="text-text-secondary">{plan.name} ({plan.priceLabel})</span></div>
                      <div><span className="text-text-muted">Date & Time:</span><br /><span className="text-text-secondary">{new Date(p.createdAt).toLocaleString()}</span></div>
                      {p.verifiedAt && <div><span className="text-text-muted">Verified At:</span><br /><span className="text-accent-green">{new Date(p.verifiedAt).toLocaleString()}</span></div>}
                      {p.failReason && <div className="col-span-2"><span className="text-text-muted">Reason:</span><br /><span className="text-accent-red">{p.failReason}</span></div>}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                      {isPending && (
                        <>
                          <button onClick={(e) => { e.stopPropagation(); handleApprove(p.id); }} disabled={isLoading}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-green/10 text-accent-green border border-accent-green/25 text-xs font-semibold hover:bg-accent-green/20 transition-colors cursor-pointer disabled:opacity-50">
                            {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                            Approve & Activate
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); setRejectId(p.id); }} disabled={isLoading}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-red/10 text-accent-red border border-accent-red/25 text-xs font-semibold hover:bg-accent-red/20 transition-colors cursor-pointer disabled:opacity-50">
                            <XCircle className="w-3 h-3" /> Reject
                          </button>
                        </>
                      )}
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-card text-text-muted border border-border text-xs font-semibold hover:text-accent-red hover:border-accent-red/25 transition-colors cursor-pointer">
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                    </div>

                    {/* Reject reason input */}
                    <AnimatePresence>
                      {rejectId === p.id && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mt-3">
                          <div className="p-3 rounded-xl bg-accent-red/5 border border-accent-red/15">
                            <p className="text-xs text-accent-red font-semibold mb-2">Rejection Reason:</p>
                            <input type="text" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="e.g. Payment not received, wrong amount..."
                              className="w-full px-3 py-2 rounded-lg bg-bg-card border border-border text-text-primary text-xs outline-none focus:border-accent-red/50 mb-2" />
                            <div className="flex gap-2">
                              <button onClick={() => setRejectId(null)} className="px-3 py-1.5 rounded-lg border border-border text-xs text-text-muted cursor-pointer hover:bg-bg-card transition-colors">Cancel</button>
                              <button onClick={() => handleReject(p.id)} disabled={isLoading}
                                className="px-3 py-1.5 rounded-lg bg-accent-red/15 text-accent-red border border-accent-red/25 text-xs font-semibold cursor-pointer hover:bg-accent-red/25 transition-colors disabled:opacity-50">
                                {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Confirm Reject'}
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Users Table ─────────────────────────────────────────────

function UsersTable({ users, onRefresh }: { users: User[]; onRefresh: () => void }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [grantPlan, setGrantPlan] = useState<{ userId: string; planId: PlanId } | null>(null);

  const handleRevoke = (userId: string) => {
    if (confirm('Revoke this user\'s subscription?')) {
      adminRevokeSubscription(userId);
      onRefresh();
    }
  };

  const handleGrant = (userId: string, planId: PlanId) => {
    adminGrantSubscription(userId, planId);
    setGrantPlan(null);
    onRefresh();
  };

  if (users.length === 0) {
    return (
      <div className="text-center py-16 rounded-2xl border border-border bg-bg-secondary/30">
        <Users className="w-10 h-10 text-text-muted mx-auto mb-3 opacity-30" />
        <p className="text-sm text-text-muted">No users found</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {users.map((u) => {
        const activePlan = getActivePlan(u.id);
        const sub = getUserSubscription(u.id);
        const remaining = getRemainingTime(sub);
        const plan = PLANS[activePlan];
        const isPro = activePlan !== 'free';
        const isExpanded = expandedId === u.id;

        const initials = u.displayName.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

        return (
          <motion.div key={u.id} layout className="rounded-xl border border-border bg-bg-secondary/50 overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-white/[0.02] transition-colors" onClick={() => setExpandedId(isExpanded ? null : u.id)}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold text-bg-primary flex-shrink-0" style={{ backgroundColor: u.avatar }}>
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-text-primary truncate">{u.displayName}</p>
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-bold" style={{ backgroundColor: `${plan.color}15`, color: plan.color }}>
                    {plan.badge}
                  </span>

                </div>
                <p className="text-xs text-text-muted truncate">{u.email}</p>
              </div>
              <div className="text-right hidden sm:block">
                {isPro && !remaining.expired ? (
                  <p className="text-xs font-semibold" style={{ color: plan.color }}>{remaining.days}d {remaining.hours}h left</p>
                ) : (
                  <p className="text-xs text-text-muted">Free plan</p>
                )}
                <p className="text-[10px] text-text-muted">Joined {new Date(u.createdAt).toLocaleDateString()}</p>
              </div>
              {isExpanded ? <ChevronUp className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4 text-text-muted" />}
            </div>

            <AnimatePresence>
              {isExpanded && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="px-4 pb-4 border-t border-border pt-3">
                    <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                      <div><span className="text-text-muted">User ID:</span><br /><code className="text-text-secondary font-mono text-[10px]">{u.id}</code></div>
                      <div><span className="text-text-muted">Email:</span><br /><span className="text-text-secondary">{u.email}</span></div>
                      <div><span className="text-text-muted">Current Plan:</span><br /><span style={{ color: plan.color }}>{plan.icon} {plan.name}</span></div>
                      <div><span className="text-text-muted">Joined:</span><br /><span className="text-text-secondary">{new Date(u.createdAt).toLocaleString()}</span></div>
                      {sub && isPro && !remaining.expired && (
                        <>
                          <div><span className="text-text-muted">Expires:</span><br /><span className="text-text-secondary">{new Date(sub.expiresAt).toLocaleString()}</span></div>
                          <div><span className="text-text-muted">Remaining:</span><br /><span style={{ color: plan.color }}>{remaining.days}d {remaining.hours}h {remaining.minutes}m</span></div>
                        </>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                      {/* Grant subscription */}
                      <button onClick={() => setGrantPlan({ userId: u.id, planId: 'pro_15' })}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/25 text-xs font-semibold hover:bg-accent-cyan/20 transition-colors cursor-pointer">
                        <Gift className="w-3 h-3" /> Grant Pro 15
                      </button>
                      <button onClick={() => setGrantPlan({ userId: u.id, planId: 'pro_30' })}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-amber/10 text-accent-amber border border-accent-amber/25 text-xs font-semibold hover:bg-accent-amber/20 transition-colors cursor-pointer">
                        <Crown className="w-3 h-3" /> Grant Pro 30
                      </button>
                      {isPro && (
                        <button onClick={() => handleRevoke(u.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-red/10 text-accent-red border border-accent-red/25 text-xs font-semibold hover:bg-accent-red/20 transition-colors cursor-pointer">
                          <Ban className="w-3 h-3" /> Revoke Sub
                        </button>
                      )}
                    </div>

                    {/* Grant confirmation */}
                    <AnimatePresence>
                      {grantPlan && grantPlan.userId === u.id && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mt-3">
                          <div className="p-3 rounded-xl bg-accent-green/5 border border-accent-green/15">
                            <p className="text-xs text-text-secondary mb-2">
                              Grant <strong style={{ color: PLANS[grantPlan.planId].color }}>{PLANS[grantPlan.planId].name}</strong> to <strong>{u.displayName}</strong>?
                            </p>
                            <div className="flex gap-2">
                              <button onClick={() => setGrantPlan(null)} className="px-3 py-1.5 rounded-lg border border-border text-xs text-text-muted cursor-pointer hover:bg-bg-card transition-colors">Cancel</button>
                              <button onClick={() => handleGrant(grantPlan.userId, grantPlan.planId)}
                                className="px-3 py-1.5 rounded-lg bg-accent-green/15 text-accent-green border border-accent-green/25 text-xs font-semibold cursor-pointer hover:bg-accent-green/25 transition-colors">
                                Confirm Grant
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Voice Tuning Panel ──────────────────────────────────────

function VoiceTuningPanel() {
  const [selectedPreset, setSelectedPreset] = useState<VoicePreset | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<PresetCategory | 'all'>('all');
  const [overrides, setOverrides] = useState(getVoiceTuningOverrides());
  const [saved, setSaved] = useState<string | null>(null);

  const allPresets = Object.entries(PRESETS) as [VoicePreset, typeof PRESETS[VoicePreset]][];
  const filteredPresets = categoryFilter === 'all' ? allPresets : allPresets.filter(([, c]) => c.category === categoryFilter);

  const preset = selectedPreset ? PRESETS[selectedPreset] : null;
  const currentOverride = selectedPreset ? overrides[selectedPreset] : null;

  // Effective values (override > preset default)
  const effectivePitch = currentOverride?.pitch ?? preset?.pitch ?? 1.0;
  const effectiveSpeed = currentOverride?.speed ?? preset?.speed ?? 1.0;
  const effectiveReverb = currentOverride?.reverb ?? preset?.effects.reverb ?? 0;

  const handleSliderChange = (key: 'pitch' | 'speed' | 'reverb', value: number) => {
    if (!selectedPreset || !preset) return;
    const newOverride: VoiceTuningOverride = {
      ...currentOverride,
      [key]: value,
    };
    setVoiceTuningOverride(selectedPreset, newOverride);
    setOverrides(getVoiceTuningOverrides());
  };

  const handleReset = (presetKey: string) => {
    removeVoiceTuningOverride(presetKey);
    setOverrides(getVoiceTuningOverrides());
    setSaved(null);
  };

  const handleResetAll = () => {
    if (confirm('Reset ALL voice tuning overrides to defaults?')) {
      clearAllVoiceTuningOverrides();
      setOverrides({});
      setSaved(null);
    }
  };

  const handleSave = () => {
    if (selectedPreset) {
      setSaved(selectedPreset);
      setTimeout(() => setSaved(null), 2000);
    }
  };

  const hasOverride = (key: string) => !!overrides[key];
  const overrideCount = Object.keys(overrides).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-text-primary font-[var(--font-display)]">🎛️ Advanced Voice Tuning</h2>
          <p className="text-xs text-text-muted mt-0.5">Select a voice preset and fine-tune Pitch, Speed & Reverb. Changes apply in real-time for all users.</p>
        </div>
        {overrideCount > 0 && (
          <button onClick={handleResetAll} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-red/10 text-accent-red border border-accent-red/20 text-xs font-semibold hover:bg-accent-red/20 transition-colors cursor-pointer">
            <RefreshCw className="w-3 h-3" /> Reset All ({overrideCount})
          </button>
        )}
      </div>

      {/* Category filter */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        <button onClick={() => setCategoryFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-all flex-shrink-0 ${categoryFilter === 'all' ? 'bg-bg-card text-text-primary border border-border' : 'text-text-muted hover:text-text-secondary bg-bg-secondary/50 border border-transparent'}`}>
          All
        </button>
        {PRESET_CATEGORIES.map((cat) => (
          <button key={cat.id} onClick={() => setCategoryFilter(cat.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-all flex-shrink-0 ${categoryFilter === cat.id ? 'text-text-primary border' : 'text-text-muted hover:text-text-secondary bg-bg-secondary/50 border border-transparent'}`}
            style={categoryFilter === cat.id ? { backgroundColor: `${cat.color}12`, borderColor: `${cat.color}30`, color: cat.color } : undefined}>
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Preset selector */}
        <div className="lg:col-span-1 rounded-xl border border-border bg-bg-secondary/50 overflow-hidden">
          <div className="px-3 py-2 border-b border-border bg-bg-card/30">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Select Voice</p>
          </div>
          <div className="max-h-[400px] overflow-y-auto p-1.5 space-y-0.5">
            {filteredPresets.map(([key, config]) => {
              const isSelected = selectedPreset === key;
              const hasOvr = hasOverride(key);
              return (
                <button key={key} onClick={() => setSelectedPreset(key)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all cursor-pointer ${isSelected ? 'bg-bg-card border border-border-active' : 'hover:bg-bg-card/50 border border-transparent'}`}>
                  <span className="text-lg">{config.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-text-primary truncate">{config.name}</span>
                      {hasOvr && <span className="w-1.5 h-1.5 rounded-full bg-accent-amber flex-shrink-0" title="Has custom tuning" />}
                    </div>
                    <span className="text-[10px] text-text-muted truncate block">{config.character || config.description}</span>
                  </div>
                  <span className="text-[9px] font-mono text-text-muted">{config.pitch.toFixed(1)}x</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tuning sliders */}
        <div className="lg:col-span-2">
          {selectedPreset && preset ? (
            <div className="rounded-xl border border-border bg-bg-secondary/50 overflow-hidden">
              {/* Selected preset header */}
              <div className="px-5 py-4 border-b border-border" style={{ background: `linear-gradient(135deg, ${preset.color}08, transparent)` }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{preset.icon}</span>
                    <div>
                      <h3 className="text-base font-bold text-text-primary font-[var(--font-display)]">{preset.name}</h3>
                      <p className="text-xs text-text-muted">{preset.character || preset.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {currentOverride && (
                      <button onClick={() => handleReset(selectedPreset)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-bg-card text-text-muted border border-border text-[10px] font-semibold hover:text-accent-red hover:border-accent-red/25 transition-colors cursor-pointer">
                        <RefreshCw className="w-3 h-3" /> Reset
                      </button>
                    )}
                    <button onClick={handleSave} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold cursor-pointer transition-all"
                      style={{ backgroundColor: `${preset.color}15`, color: preset.color, borderColor: `${preset.color}30`, borderWidth: 1, borderStyle: 'solid' }}>
                      {saved === selectedPreset ? <><CheckCircle2 className="w-3 h-3" /> Saved!</> : <><span>💾</span> Save</>}
                    </button>
                  </div>
                </div>
              </div>

              {/* Sliders */}
              <div className="p-5 space-y-6">
                {/* Pitch Shift */}
                <TuningSlider
                  label="Pitch Shift"
                  description="Voice frequency — lower = deeper, higher = squeaky"
                  value={effectivePitch}
                  defaultValue={preset.pitch}
                  min={0.5}
                  max={2.5}
                  step={0.1}
                  unit="x"
                  color={preset.color}
                  onChange={(v) => handleSliderChange('pitch', v)}
                />

                {/* Playback Rate (Speed) */}
                <TuningSlider
                  label="Playback Rate (Speed)"
                  description="How fast the voice plays — slower = dramatic, faster = energetic"
                  value={effectiveSpeed}
                  defaultValue={preset.speed}
                  min={0.5}
                  max={2.0}
                  step={0.05}
                  unit="x"
                  color="#00e5ff"
                  onChange={(v) => handleSliderChange('speed', v)}
                />

                {/* Echo / Reverb Depth */}
                <TuningSlider
                  label="Echo / Reverb Depth"
                  description="Room echo effect — 0 = dry, 1 = full cathedral reverb"
                  value={effectiveReverb}
                  defaultValue={preset.effects.reverb ?? 0}
                  min={0}
                  max={1}
                  step={0.05}
                  unit=""
                  color="#ff00e5"
                  onChange={(v) => handleSliderChange('reverb', v)}
                />

                {/* Current values summary */}
                <div className="p-3 rounded-xl bg-bg-card/50 border border-border">
                  <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold mb-2">Current Values</p>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <p className="text-lg font-bold font-[var(--font-display)]" style={{ color: preset.color }}>{effectivePitch.toFixed(1)}</p>
                      <p className="text-[9px] text-text-muted">Pitch</p>
                      {currentOverride?.pitch !== undefined && <p className="text-[8px] text-accent-amber">Default: {preset.pitch}</p>}
                    </div>
                    <div>
                      <p className="text-lg font-bold font-[var(--font-display)] text-accent-cyan">{effectiveSpeed.toFixed(2)}</p>
                      <p className="text-[9px] text-text-muted">Speed</p>
                      {currentOverride?.speed !== undefined && <p className="text-[8px] text-accent-amber">Default: {preset.speed}</p>}
                    </div>
                    <div>
                      <p className="text-lg font-bold font-[var(--font-display)] text-accent-magenta">{effectiveReverb.toFixed(2)}</p>
                      <p className="text-[9px] text-text-muted">Reverb</p>
                      {currentOverride?.reverb !== undefined && <p className="text-[8px] text-accent-amber">Default: {(preset.effects.reverb ?? 0).toFixed(2)}</p>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-bg-secondary/30 flex flex-col items-center justify-center py-20">
              <span className="text-4xl mb-3">🎛️</span>
              <p className="text-sm text-text-muted font-medium">Select a voice preset to tune</p>
              <p className="text-xs text-text-muted/60 mt-1">Pick from the list on the left</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Tuning Slider ───────────────────────────────────────────

function TuningSlider({
  label, description, value, defaultValue, min, max, step, unit, color, onChange,
}: {
  label: string; description: string; value: number; defaultValue: number;
  min: number; max: number; step: number; unit: string; color: string;
  onChange: (v: number) => void;
}) {
  const percentage = ((value - min) / (max - min)) * 100;
  const defaultPercentage = ((defaultValue - min) / (max - min)) * 100;
  const isModified = Math.abs(value - defaultValue) > 0.001;

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div>
          <span className="text-sm font-semibold text-text-primary">{label}</span>
          {isModified && <span className="ml-2 text-[9px] px-1.5 py-0.5 rounded bg-accent-amber/15 text-accent-amber font-bold">MODIFIED</span>}
        </div>
        <span className="text-sm font-mono font-bold" style={{ color }}>{value.toFixed(2)}{unit}</span>
      </div>
      <p className="text-[10px] text-text-muted mb-2">{description}</p>
      <div className="relative h-8">
        {/* Track background */}
        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-2 rounded-full bg-bg-card">
          {/* Filled portion */}
          <div className="h-full rounded-full transition-all duration-100" style={{ width: `${percentage}%`, background: `linear-gradient(90deg, ${color}80, ${color})` }} />
          {/* Default marker */}
          <div className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-full bg-text-muted/40" style={{ left: `${defaultPercentage}%` }} title={`Default: ${defaultValue}`} />
        </div>
        {/* Thumb */}
        <div className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white shadow-lg pointer-events-none z-10 transition-all duration-100"
          style={{ left: `calc(${percentage}% - 10px)`, boxShadow: `0 0 12px ${color}60, 0 2px 8px rgba(0,0,0,0.3)` }} />
        {/* Invisible range input */}
        <input type="range" min={min} max={max} step={step} value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[9px] text-text-muted">{min}{unit}</span>
        <span className="text-[9px] text-text-muted">{max}{unit}</span>
      </div>
    </div>
  );
}
