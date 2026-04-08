import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, ExternalLink, Chrome, Smartphone, Globe, RefreshCw, Mic, X, AlertTriangle } from 'lucide-react';

interface MicPermissionGuideProps {
  errorCode: string | null;
  errorMessage: string | null;
  onRetry: () => void;
  onDismiss: () => void;
  isVisible: boolean;
}

export default function MicPermissionGuide({
  errorCode,
  errorMessage,
  onRetry,
  onDismiss,
  isVisible,
}: MicPermissionGuideProps) {
  const isIframeBlocked = errorCode === 'iframe-blocked' || errorCode === 'security' || errorCode === 'insecure-context';
  const isDenied = errorCode === 'denied';
  const isNotFound = errorCode === 'not-found';
  const isInUse = errorCode === 'in-use';
  const currentUrl = window.location.href;

  const openInNewTab = () => {
    window.open(currentUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="w-full rounded-2xl border border-accent-red/30 bg-gradient-to-b from-accent-red/5 to-bg-secondary/80 backdrop-blur-xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-accent-red/15">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent-red/15 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-accent-red" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-text-primary">Microphone Access Required</h3>
                <p className="text-xs text-text-muted mt-0.5">
                  {isIframeBlocked ? 'Blocked by browser security policy' : isDenied ? 'Permission denied' : isNotFound ? 'No microphone found' : isInUse ? 'Microphone in use' : 'Unable to access microphone'}
                </p>
              </div>
            </div>
            <button
              onClick={onDismiss}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <X className="w-4 h-4 text-text-muted" />
            </button>
          </div>

          {/* Error message */}
          <div className="px-5 py-3 bg-accent-red/5 border-b border-accent-red/10">
            <div className="flex gap-2 items-start">
              <AlertTriangle className="w-4 h-4 text-accent-amber mt-0.5 flex-shrink-0" />
              <p className="text-xs text-text-secondary leading-relaxed">{errorMessage}</p>
            </div>
          </div>

          {/* Solution steps */}
          <div className="px-5 py-4 space-y-4">
            {isIframeBlocked && (
              <>
                <p className="text-xs font-semibold text-accent-cyan uppercase tracking-wider">Quick Fix</p>
                <button
                  onClick={openInNewTab}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-accent-cyan/10 border border-accent-cyan/25 hover:bg-accent-cyan/15 transition-all cursor-pointer group"
                >
                  <div className="w-9 h-9 rounded-lg bg-accent-cyan/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ExternalLink className="w-4 h-4 text-accent-cyan" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-sm font-semibold text-accent-cyan">Open in New Tab</p>
                    <p className="text-xs text-text-muted mt-0.5">Opens this app directly where mic access works</p>
                  </div>
                </button>

                <div className="space-y-2.5">
                  <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Why does this happen?</p>
                  <p className="text-xs text-text-muted leading-relaxed">
                    Browsers block microphone access in embedded iframes for security. Opening the site directly in a new tab resolves this.
                  </p>
                </div>
              </>
            )}

            {isDenied && (
              <>
                <p className="text-xs font-semibold text-accent-cyan uppercase tracking-wider">How to allow microphone</p>
                <div className="space-y-3">
                  {/* Chrome */}
                  <div className="flex gap-3 items-start p-3 rounded-xl bg-bg-card/50">
                    <Chrome className="w-5 h-5 text-accent-cyan flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-text-primary">Chrome / Edge</p>
                      <ol className="text-xs text-text-muted mt-1 space-y-0.5 list-decimal list-inside">
                        <li>Click the <strong>lock icon 🔒</strong> in the address bar</li>
                        <li>Find <strong>Microphone</strong> → set to <strong>Allow</strong></li>
                        <li>Reload the page</li>
                      </ol>
                    </div>
                  </div>

                  {/* Safari / Mobile */}
                  <div className="flex gap-3 items-start p-3 rounded-xl bg-bg-card/50">
                    <Globe className="w-5 h-5 text-accent-cyan flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-text-primary">Safari</p>
                      <ol className="text-xs text-text-muted mt-1 space-y-0.5 list-decimal list-inside">
                        <li>Go to <strong>Safari → Settings → Websites → Microphone</strong></li>
                        <li>Find this site → set to <strong>Allow</strong></li>
                        <li>Reload the page</li>
                      </ol>
                    </div>
                  </div>

                  {/* Mobile */}
                  <div className="flex gap-3 items-start p-3 rounded-xl bg-bg-card/50">
                    <Smartphone className="w-5 h-5 text-accent-cyan flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-text-primary">Mobile Browser</p>
                      <ol className="text-xs text-text-muted mt-1 space-y-0.5 list-decimal list-inside">
                        <li>Tap the <strong>lock/info icon</strong> in the address bar</li>
                        <li>Tap <strong>Permissions</strong> or <strong>Site settings</strong></li>
                        <li>Enable <strong>Microphone</strong></li>
                        <li>Reload the page</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </>
            )}

            {isNotFound && (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-accent-cyan uppercase tracking-wider">Troubleshooting</p>
                <div className="flex gap-3 items-start p-3 rounded-xl bg-bg-card/50">
                  <Mic className="w-5 h-5 text-accent-cyan flex-shrink-0 mt-0.5" />
                  <div>
                    <ul className="text-xs text-text-muted space-y-1">
                      <li>• Make sure a microphone is connected to your device</li>
                      <li>• Check if your headset/earbuds mic is working</li>
                      <li>• On mobile, make sure no other app is using the mic</li>
                      <li>• Try plugging in / reconnecting your mic</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {isInUse && (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-accent-cyan uppercase tracking-wider">Troubleshooting</p>
                <div className="flex gap-3 items-start p-3 rounded-xl bg-bg-card/50">
                  <Mic className="w-5 h-5 text-accent-cyan flex-shrink-0 mt-0.5" />
                  <div>
                    <ul className="text-xs text-text-muted space-y-1">
                      <li>• Close other apps that might be using the microphone (Zoom, Discord, etc.)</li>
                      <li>• Close other browser tabs that use the mic</li>
                      <li>• Try restarting your browser</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2 pt-2">
              <button
                onClick={onRetry}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/25 text-sm font-semibold hover:bg-accent-cyan/20 transition-all cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
              {isIframeBlocked && (
                <button
                  onClick={openInNewTab}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent-magenta/10 text-accent-magenta border border-accent-magenta/25 text-sm font-semibold hover:bg-accent-magenta/20 transition-all cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open in New Tab
                </button>
              )}
            </div>
          </div>

          {/* Fallback hint */}
          <div className="px-5 py-3 border-t border-border bg-bg-card/30">
            <p className="text-xs text-text-muted">
              💡 <strong>Alternative:</strong> You can still use the <strong>Upload File</strong> tab to process audio files without microphone access.
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
