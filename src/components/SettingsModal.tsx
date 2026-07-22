import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Sliders, 
  Type, 
  Sparkles, 
  Eye, 
  Activity, 
  Layers,
  Palette
} from 'lucide-react';
import { useLyraStore } from '../store/useLyraStore';
import type { ThemeName } from '../store/useLyraStore';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const settings = useLyraStore((state) => state.settings);
  const updateSettings = useLyraStore((state) => state.updateSettings);
  const theme = useLyraStore((state) => state.theme);
  const setTheme = useLyraStore((state) => state.setTheme);
  const videoId = useLyraStore((state) => state.videoId);
  const isAlternativeLoading = useLyraStore((state) => state.isAlternativeLoading);
  const alternativeError = useLyraStore((state) => state.alternativeError);
  const lyricAlternatives = useLyraStore((state) => state.lyricAlternatives);
  const activeLyricTrackId = useLyraStore((state) => state.activeLyricTrackId);
  const fetchLyricsAlternative = useLyraStore((state) => state.fetchLyricsAlternative);

  if (!isOpen) return null;

  const fontFamilies: { key: typeof settings.fontFamily; label: string }[] = [
    { key: 'outfit', label: 'Outfit (Futuristic)' },
    { key: 'sans', label: 'Inter (Modern)' },
    { key: 'serif', label: 'Playfair (Elegant)' },
    { key: 'mono', label: 'Fira Code (Minimal)' }
  ];

  const themes: { key: ThemeName; label: string; color: string }[] = [
    { key: 'spotify', label: 'Spotify', color: '#1db954' },
    { key: 'apple', label: 'Apple Music', color: '#fc3c44' },
    { key: 'cyberpunk', label: 'Cyberpunk', color: '#00f0ff' },
    { key: 'synthwave', label: 'Synthwave', color: '#ff7b00' },
    { key: 'sunset', label: 'Sunset', color: '#ff3366' },
    { key: 'ocean', label: 'Ocean Blue', color: '#0088ff' },
    { key: 'amoled', label: 'AMOLED Black', color: '#ffffff' }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Overlay Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg rounded-3xl glass-card border border-white/10 shadow-2xl p-6 overflow-hidden z-10 max-h-[85vh] overflow-y-auto no-scrollbar font-sans"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
            <div className="flex items-center space-x-2.5">
              <Sliders className="w-5 h-5 text-gray-400" />
              <h3 className="text-lg font-bold font-outfit text-white">Playback Settings</h3>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Theme Selector inside settings */}
            <div>
              <label className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2.5 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5" />
                <span>Visual Theme</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {themes.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setTheme(t.key)}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold text-left flex items-center space-x-2 transition-all cursor-pointer ${
                      theme === t.key
                        ? 'bg-white/10 border-white/20 text-white shadow-lg'
                        : 'bg-white/[0.02] border-white/5 text-gray-400 hover:bg-white/5 hover:border-white/10'
                    }`}
                  >
                    <span 
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: t.color }}
                    />
                    <span className="truncate">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Alternative Lyrics Search Results Selector */}
            {videoId && lyricAlternatives.length > 0 && (
              <div>
                <label className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5" />
                    <span>Choose Lyrics Source ({lyricAlternatives.length} matches)</span>
                  </span>
                  {isAlternativeLoading && (
                    <span className="text-[10px] text-purple-400 animate-pulse font-mono font-bold">
                      LOADING LYRICS...
                    </span>
                  )}
                </label>
                <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1 no-scrollbar">
                  {lyricAlternatives.map((track) => {
                    const isSelected = activeLyricTrackId === track.id;
                    const durationMinSec = track.duration 
                      ? `${Math.floor(track.duration / 60)}:${String(Math.floor(track.duration % 60)).padStart(2, '0')}`
                      : '';
                    
                    return (
                      <button
                        key={track.id}
                        onClick={() => !isSelected && fetchLyricsAlternative(track.id)}
                        disabled={isAlternativeLoading}
                        className={`w-full py-2 px-3 rounded-xl border text-left flex items-center justify-between text-xs transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-purple-600/20 border-purple-500 text-purple-200 shadow-md font-semibold'
                            : 'bg-white/[0.02] border-white/5 text-gray-400 hover:bg-white/5 hover:border-white/10 disabled:opacity-50'
                        }`}
                      >
                        <div className="flex-grow min-w-0 pr-2">
                          <p className={`truncate ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                            {track.trackName}
                          </p>
                          <p className="text-[10px] text-gray-500 truncate mt-0.5">
                            by {track.artistName} {track.albumName ? `• ${track.albumName}` : ''}
                          </p>
                        </div>
                        <div className="flex items-center space-x-1.5 flex-shrink-0 text-[10px]">
                          <span className={`px-1.5 py-0.5 rounded font-mono ${
                            track.hasSynced ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
                          }`}>
                            {track.hasSynced ? 'Synced' : 'Plain'}
                          </span>
                          {durationMinSec && (
                            <span className="text-gray-500 font-mono">{durationMinSec}</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
                {alternativeError && (
                  <p className="text-[10px] text-red-400 mt-1.5">{alternativeError}</p>
                )}
              </div>
            )}

            {/* Font Family Selection */}
            <div>
              <label className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2.5 flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5" />
                <span>Lyric Typography</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {fontFamilies.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => updateSettings({ fontFamily: f.key })}
                    className={`py-2 px-4 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                      settings.fontFamily === f.key
                        ? 'bg-white text-black border-white shadow-lg'
                        : 'bg-white/[0.02] border-white/5 text-gray-300 hover:bg-white/5 hover:border-white/10'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Subtitle Size Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold flex items-center gap-1.5">
                  <Type className="w-3.5 h-3.5" />
                  <span>Lyric Size</span>
                </span>
                <span className="text-sm font-medium text-white">{settings.subtitleSize}rem</span>
              </div>
              <input
                type="range"
                min="1.2"
                max="3.0"
                step="0.1"
                value={settings.subtitleSize}
                onChange={(e) => updateSettings({ subtitleSize: parseFloat(e.target.value) })}
                className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-white"
              />
            </div>

            {/* Glow Intensity Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Neon Glow Intensity</span>
                </span>
                <span className="text-sm font-medium text-white">{settings.glowIntensity}</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="1"
                value={settings.glowIntensity}
                onChange={(e) => updateSettings({ glowIntensity: parseInt(e.target.value) })}
                className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-white"
              />
            </div>

            {/* Upcoming Blur Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Lyric Blur Amount</span>
                </span>
                <span className="text-sm font-medium text-white">{settings.blurAmount}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="12"
                step="1"
                value={settings.blurAmount}
                onChange={(e) => updateSettings({ blurAmount: parseInt(e.target.value) })}
                className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-white"
              />
            </div>

            {/* Particle Density Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Particle Field Density</span>
                </span>
                <span className="text-sm font-medium text-white">{settings.particleDensity}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={settings.particleDensity}
                onChange={(e) => updateSettings({ particleDensity: parseInt(e.target.value) })}
                className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-white"
              />
            </div>

            {/* Background Brightness Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Ambient Light Brightness</span>
                </span>
                <span className="text-sm font-medium text-white">{settings.backgroundBrightness}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={settings.backgroundBrightness}
                onChange={(e) => updateSettings({ backgroundBrightness: parseInt(e.target.value) })}
                className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-white"
              />
            </div>

            {/* Animation Speed Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  <span>Transition Duration</span>
                </span>
                <span className="text-sm font-medium text-white">{settings.animationSpeed}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={settings.animationSpeed}
                onChange={(e) => updateSettings({ animationSpeed: parseFloat(e.target.value) })}
                className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-white"
              />
            </div>

            {/* Auto Scroll Switch Toggle */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <span className="text-sm font-bold text-white flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-gray-400" />
                <span>Auto-Scroll Subtitles</span>
              </span>
              <button
                onClick={() => updateSettings({ autoScroll: !settings.autoScroll })}
                className={`w-12 h-6 rounded-full p-0.5 transition-colors duration-300 focus:outline-none cursor-pointer ${
                  settings.autoScroll ? 'bg-white' : 'bg-white/10'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full shadow-md transform duration-300 ${
                    settings.autoScroll ? 'translate-x-6 bg-black' : 'translate-x-0 bg-gray-400'
                  }`}
                />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
