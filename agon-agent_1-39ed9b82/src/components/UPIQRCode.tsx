import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, QrCode, RefreshCw } from 'lucide-react';
import { UPI_ID, UPI_NAME } from '../lib/subscription';

interface UPIQRCodeProps {
  amount: number;
  size?: number;
}

/**
 * Generates a real scannable UPI QR code using the QR Server API.
 * Encodes: upi://pay?pa=<UPI_ID>&pn=<NAME>&am=<AMOUNT>&cu=INR
 */
export default function UPIQRCode({ amount, size = 220 }: UPIQRCodeProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  const upiLink = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${amount}&cu=INR`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(upiLink)}&margin=8&format=png&ecc=H`;

  const handleLoad = () => {
    setLoading(false);
    setError(false);
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
  };

  const handleRetry = () => {
    setLoading(true);
    setError(false);
    setRetryKey((k) => k + 1);
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Loading state */}
      {loading && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white rounded-xl z-10">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
          >
            <Loader2 className="w-8 h-8 text-gray-400" />
          </motion.div>
          <p className="text-[10px] text-gray-400 mt-2 font-medium">Loading QR Code...</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white rounded-xl z-10 gap-2">
          <QrCode className="w-10 h-10 text-gray-300" />
          <p className="text-[11px] text-gray-500 font-medium">QR failed to load</p>
          <button
            onClick={handleRetry}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 text-[10px] font-semibold transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            Retry
          </button>
        </div>
      )}

      {/* QR Code Image */}
      <img
        key={retryKey}
        src={qrUrl}
        alt={`UPI QR Code - Pay ₹${amount}`}
        width={size}
        height={size}
        onLoad={handleLoad}
        onError={handleError}
        className={`rounded-xl transition-opacity duration-300 ${loading || error ? 'opacity-0' : 'opacity-100'}`}
        style={{ width: size, height: size }}
      />
    </div>
  );
}
