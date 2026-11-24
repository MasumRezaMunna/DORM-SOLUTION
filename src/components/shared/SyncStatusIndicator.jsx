import { useState, useEffect } from 'react';
import { useIsFetching } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, WifiOff, CheckCircle2 } from 'lucide-react';

/**
 * Non-intrusive status pill indicating background synchronization and offline state.
 * Never blocks user interaction; provides transparent feedback that cached data is in use
 * while fresh data is actively being fetched.
 */
export default function SyncStatusIndicator() {
  const [isOnline, setIsOnline] = useState(() => (typeof navigator !== 'undefined' ? navigator.onLine : true));
  const [showSyncedBriefly, setShowSyncedBriefly] = useState(false);
  const isFetching = useIsFetching();

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Show a brief "Updated" confirmation when background sync finishes
  useEffect(() => {
    if (isFetching === 0 && isOnline) {
      setShowSyncedBriefly(true);
      const timer = setTimeout(() => setShowSyncedBriefly(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isFetching, isOnline]);

  return (
    <div className="flex items-center text-xs font-semibold select-none">
      <AnimatePresence mode="wait">
        {!isOnline ? (
          <motion.div
            key="offline"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30"
            title="You are currently offline. Displaying saved data from your device."
          >
            <WifiOff className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Offline (Cached)</span>
          </motion.div>
        ) : isFetching > 0 ? (
          <motion.div
            key="syncing"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#526B52]/20 text-[#A3B18A] border border-[#526B52]/30"
            title="Displaying cached data. Background refresh in progress..."
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#A3B18A] animate-spin" />
            <span className="hidden sm:inline">Syncing...</span>
          </motion.div>
        ) : showSyncedBriefly ? (
          <motion.div
            key="synced"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-emerald-400/80 text-[11px]"
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span className="hidden sm:inline">Up to date</span>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
