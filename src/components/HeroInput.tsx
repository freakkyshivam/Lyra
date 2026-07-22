import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Youtube, Sparkles, ArrowRight } from 'lucide-react';
import { useLyraStore } from '../store/useLyraStore';
import { useAnalyzeSong } from '../hooks/useAnalyzeSong';

export const HeroInput: React.FC = () => {
  const [urlInput, setUrlInput] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  const pendingAnalyzeUrl = useLyraStore((state) => state.pendingAnalyzeUrl);
  const setPendingAnalyzeUrl = useLyraStore((state) => state.setPendingAnalyzeUrl);
  const { analyzeSong } = useAnalyzeSong();

  // Listen to quick-pasted URLs from the home screen
  useEffect(() => {
    if (pendingAnalyzeUrl) {
      setUrlInput(pendingAnalyzeUrl);
      setPendingAnalyzeUrl(null);
      analyzeSong(pendingAnalyzeUrl);
    }
  }, [pendingAnalyzeUrl, analyzeSong, setPendingAnalyzeUrl]);

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const trimmedUrl = urlInput.trim();
    if (!trimmedUrl) {
      triggerShake();
      return;
    }

    await analyzeSong(trimmedUrl);
  };

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 mt-8 sm:mt-16 mb-6">
      <motion.form
        onSubmit={handleAnalyze}
        animate={isShaking ? { x: [-10, 10, -10, 10, -5, 5, 0] } : {}}
        transition={{ duration: 0.5 }}
        className="w-full relative"
      >
        {/* Glow behind input on hover/focus */}
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-purple-600/30 to-emerald-500/30 opacity-40 blur-xl transition-all group-hover:opacity-70" />

        <div className="relative flex items-center glass-panel rounded-2xl border border-white/10 p-2 pl-4 focus-within:border-white/20 transition-all duration-300 shadow-2xl">
          <Youtube className="w-6 h-6 text-white/50 mr-3 flex-shrink-0" />
          
          <input
            type="text"
            placeholder="Paste any YouTube video URL..."
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-white text-base placeholder-white/30 py-3 pr-2 font-sans"
          />

          <button
            type="submit"
            className="flex items-center space-x-2 bg-white text-black hover:bg-white/90 active:scale-95 px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-300 shadow-lg cursor-pointer flex-shrink-0 group"
          >
            <Sparkles className="w-4 h-4 text-purple-600 animate-pulse" />
            <span>Analyze</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>
      </motion.form>
    </div>
  );
};
