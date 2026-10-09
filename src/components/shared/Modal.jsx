import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useEffect } from 'react';

export default function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-md' }) {
  const { isDark } = useTheme();

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`relative w-full ${maxWidth} rounded-2xl shadow-2xl overflow-hidden ${
              isDark ? 'bg-[#202720] border border-[#394239]' : 'bg-white border border-[#DDE1D8]'
            }`}
          >
            {/* Header */}
            <div className={`flex items-center justify-between px-6 py-4 border-b ${
              isDark ? 'border-[#394239]' : 'border-[#DDE1D8]'
            }`}>
              <h2 className={`text-lg font-bold tracking-tight ${isDark ? 'text-[#F0F1E9]' : 'text-[#202720]'}`}>
                {title}
              </h2>
              <button
                onClick={onClose}
                className={`p-2 rounded-xl transition-colors ${
                  isDark ? 'text-[#B1B8AC] hover:text-[#F0F1E9] hover:bg-[#292F29]' : 'text-[#687168] hover:text-[#202720] hover:bg-[#ECECE4]'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className={`p-6 max-h-[calc(100vh-10rem)] overflow-y-auto ${isDark ? 'text-[#F0F1E9]' : 'text-[#202720]'}`}>
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
