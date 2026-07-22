import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Check } from 'lucide-react';
import { useLyraStore } from '../store/useLyraStore';

export const LoadingScreen: React.FC = () => {
  const loadingStep = useLyraStore((state) => state.loadingStep);

  if (loadingStep === 'idle') return null;

  const steps = [
    { key: 'fetching-video', label: 'Fetching video details...' },
    { key: 'loading-subtitles', label: 'Loading subtitles & sync transcripts...' },
    { key: 'generating-theme', label: 'Extracting colors & generating theme...' },
    { key: 'preparing-player', label: 'Preparing interactive player...' },
  ];

  // Get index of the current active step
  const activeIndex = steps.findIndex((step) => step.key === loadingStep);

  // Map steps to approximate percentage
  const percentages = {
    'fetching-video': 25,
    'loading-subtitles': 50,
    'generating-theme': 75,
    'preparing-player': 95,
  };
  const percentage = percentages[loadingStep] || 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050507]/90 backdrop-blur-md p-6 text-center"
      >
        <div className="max-w-md w-full relative p-8 rounded-3xl glass-card border border-white/10 shadow-2xl overflow-hidden">
          {/* Ambient Glow behind card */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />

          {/* Loader Icon */}
          <div className="relative mb-8 flex justify-center">
            <div className="w-16 h-16 rounded-2xl glass-panel-light flex items-center justify-center border border-white/10 relative">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          </div>

          <h2 className="text-2xl font-bold font-outfit text-white mb-2">Analyzing Song</h2>
          <p className="text-gray-400 text-sm mb-6">Tuning frequencies and synchronizing lyrics...</p>

          {/* Progress Bar */}
          <div className="w-full bg-white/5 rounded-full h-1.5 mb-8 relative overflow-hidden">
            <motion.div
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-emerald-400 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              style={{
                boxShadow: '0 0 10px rgba(168, 85, 247, 0.5)',
              }}
            />
          </div>

          {/* Steps List */}
          <div className="space-y-4 text-left">
            {steps.map((step, idx) => {
              const isCompleted = idx < activeIndex;
              const isActive = idx === activeIndex;
              const isPending = idx > activeIndex;

              return (
                <div
                  key={step.key}
                  className={`flex items-center space-x-3 transition-opacity duration-300 ${
                    isPending ? 'opacity-30' : 'opacity-100'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 border ${
                      isCompleted
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                        : isActive
                        ? 'border-purple-500 text-purple-400 animate-pulse'
                        : 'border-white/10 text-transparent'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-3 h-3 stroke-[3]" />
                    ) : isActive ? (
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                    ) : null}
                  </div>
                  <span
                    className={`text-sm transition-colors duration-300 ${
                      isActive ? 'text-white font-medium' : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
