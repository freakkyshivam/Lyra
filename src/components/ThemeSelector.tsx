import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, ChevronDown, Check } from 'lucide-react';
import { useLyraStore } from '../store/useLyraStore';
import type { ThemeName } from '../store/useLyraStore';

export const ThemeSelector: React.FC = () => {
  const activeTheme = useLyraStore((state) => state.theme);
  const setTheme = useLyraStore((state) => state.setTheme);
  const setDominantColors = useLyraStore((state) => state.setDominantColors);
  const dominantColors = useLyraStore((state) => state.dominantColors);

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const themes: { id: ThemeName; name: string; color: string }[] = [
    { id: 'spotify', name: 'Spotify Green', color: '#1db954' },
    { id: 'apple', name: 'Apple Music', color: '#fc3c44' },
    { id: 'cyberpunk', name: 'Cyberpunk Neon', color: '#00f0ff' },
    { id: 'synthwave', name: 'Synthwave Orange', color: '#ff7b00' },
    { id: 'sunset', name: 'Sunset Pink', color: '#ff3366' },
    { id: 'ocean', name: 'Ocean Blue', color: '#0088ff' },
    { id: 'amoled', name: 'AMOLED Black', color: '#ffffff' },
  ];

  const handleThemeSelect = (themeId: ThemeName) => {
    setTheme(themeId);
    // Clear dominant colors when user manually picks a preset theme
    setDominantColors(null);
    setIsOpen(false);
  };

  const getActiveThemeName = () => {
    if (dominantColors) return 'AI Color Extraction';
    const found = themes.find((t) => t.id === activeTheme);
    return found ? found.name : 'Spotify Green';
  };

  const getActiveThemeColor = () => {
    if (dominantColors) return dominantColors.accent;
    const found = themes.find((t) => t.id === activeTheme);
    return found ? found.color : '#1db954';
  };

  return (
    <div ref={dropdownRef} className="relative z-30 font-sans">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 px-3.5 py-2 rounded-xl text-sm font-semibold text-gray-300 hover:text-white transition-all cursor-pointer select-none"
      >
        <Palette className="w-4 h-4" style={{ color: getActiveThemeColor() }} />
        <span>{getActiveThemeName()}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-52 rounded-2xl glass-card border border-white/10 shadow-2xl p-2 z-50 overflow-hidden"
          >
            {/* AI Active Indicator if dominant colors exist */}
            {dominantColors && (
              <div className="px-3 py-2 text-[10px] uppercase tracking-wider text-gray-500 font-bold border-b border-white/5 mb-1.5 flex items-center justify-between">
                <span>Dynamic Palette</span>
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: dominantColors.accent }} />
              </div>
            )}

            <div className="space-y-1">
              {themes.map((t) => {
                const isSelected = activeTheme === t.id && !dominantColors;
                return (
                  <button
                    key={t.id}
                    onClick={() => handleThemeSelect(t.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-semibold transition-all cursor-pointer hover:bg-white/5 hover:text-white ${
                      isSelected ? 'bg-white/10 text-white' : 'text-gray-400'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <span
                        className="w-3 h-3 rounded-full flex-shrink-0 border border-white/10"
                        style={{ backgroundColor: t.color }}
                      />
                      <span className="truncate">{t.name}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-white flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
