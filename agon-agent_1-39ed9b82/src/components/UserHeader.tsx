import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, User, ChevronDown, Crown, Zap } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { getActivePlan, PLANS, getUserSubscription, getRemainingTime } from '../lib/subscription';

interface UserHeaderProps {
  onOpenSubscription?: () => void;
}

export default function UserHeader({ onOpenSubscription }: UserHeaderProps) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (!user) return null;

  const activePlan = getActivePlan(user.id);
  const plan = PLANS[activePlan];
  const isPro = activePlan !== 'free';
  const sub = getUserSubscription(user.id);
  const remaining = getRemainingTime(sub);

  const initials = user.displayName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="relative" ref={menuRef}>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-bg-card/60 border border-border hover:border-border-active transition-all cursor-pointer"
      >
        <div className="relative">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-bg-primary"
            style={{ backgroundColor: user.avatar }}
          >
            {initials}
          </div>
          {isPro && (
            <div
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px]"
              style={{ backgroundColor: plan.color, color: '#0a0a12' }}
            >
              <Crown className="w-2.5 h-2.5" />
            </div>
          )}
        </div>
        <div className="hidden sm:block text-left">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-medium text-text-primary leading-tight">{user.displayName}</p>
            {isPro && (
              <span
                className="px-1.5 py-0 rounded text-[9px] font-bold uppercase"
                style={{ backgroundColor: `${plan.color}20`, color: plan.color }}
              >
                {plan.badge}
              </span>
            )}
          </div>
          <p className="text-[10px] text-text-muted leading-tight">{user.email}</p>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-text-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-border bg-bg-secondary/95 backdrop-blur-xl shadow-2xl overflow-hidden z-50"
          >
            {/* User info */}
            <div className="px-4 py-3 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-bg-primary"
                    style={{ backgroundColor: user.avatar }}
                  >
                    {initials}
                  </div>
                  {isPro && (
                    <div
                      className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: plan.color, color: '#0a0a12' }}
                    >
                      <Crown className="w-2.5 h-2.5" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-text-primary truncate">{user.displayName}</p>
                  <p className="text-xs text-text-muted truncate">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Subscription status */}
            <div className="px-4 py-3 border-b border-border">
              {isPro && !remaining.expired ? (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">{plan.icon}</span>
                      <span className="text-xs font-semibold" style={{ color: plan.color }}>{plan.name}</span>
                    </div>
                    <span className="text-[10px] text-text-muted">{remaining.days}d {remaining.hours}h left</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-bg-card overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ width: `${remaining.percentage}%`, backgroundColor: plan.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${remaining.percentage}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setOpen(false);
                    onOpenSubscription?.();
                  }}
                  className="w-full flex items-center gap-2.5 p-2 rounded-lg bg-accent-amber/5 border border-accent-amber/20 hover:bg-accent-amber/10 transition-colors cursor-pointer"
                >
                  <Zap className="w-4 h-4 text-accent-amber" />
                  <div className="text-left">
                    <p className="text-xs font-semibold text-accent-amber">Upgrade to Pro</p>
                    <p className="text-[10px] text-text-muted">Unlock all features</p>
                  </div>
                </button>
              )}
            </div>

            {/* Menu items */}
            <div className="p-1.5">
              <div className="px-3 py-2 rounded-lg flex items-center gap-2.5 text-text-muted">
                <User className="w-4 h-4" />
                <span className="text-sm">Member since {new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
              {onOpenSubscription && (
                <button
                  onClick={() => {
                    setOpen(false);
                    onOpenSubscription();
                  }}
                  className="w-full px-3 py-2 rounded-lg flex items-center gap-2.5 text-text-secondary hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <Crown className="w-4 h-4" />
                  <span className="text-sm font-medium">Manage Subscription</span>
                </button>
              )}
              <button
                onClick={() => {
                  setOpen(false);
                  logout();
                }}
                className="w-full px-3 py-2 rounded-lg flex items-center gap-2.5 text-accent-red hover:bg-accent-red/10 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Sign Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
