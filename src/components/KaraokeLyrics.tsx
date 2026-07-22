import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useLyraStore } from '../store/useLyraStore';
import type { LyricLine } from '../store/useLyraStore';

export const KaraokeLyrics: React.FC = () => {
  const lyrics = useLyraStore((state) => state.lyrics);
  const activeLyricIndex = useLyraStore((state) => state.activeLyricIndex);
  const playbackState = useLyraStore((state) => state.playbackState);
  const player = useLyraStore((state) => state.player);
  const settings = useLyraStore((state) => state.settings);
  const dominantColors = useLyraStore((state) => state.dominantColors);

  const containerRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLDivElement>(null);

  // Smooth scroll active lyric to center of the scrollbox
  useEffect(() => {
    if (settings.autoScroll && activeLineRef.current && containerRef.current) {
      const activeElement = activeLineRef.current;
      const container = containerRef.current;
      
      const scrollTimer = setTimeout(() => {
        const rect = activeElement.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const relativeTop = rect.top - containerRect.top + container.scrollTop;
        const targetScroll = relativeTop - (containerRect.height / 2) + (rect.height / 2);
        
        container.scrollTo({
          top: targetScroll,
          behavior: 'smooth',
        });
      }, 50); // 50ms delay to let fonts and transforms settle
      
      return () => clearTimeout(scrollTimer);
    }
  }, [activeLyricIndex, settings.autoScroll, lyrics.length]);

  // Click-to-seek action
  const handleLineClick = (line: LyricLine) => {
    if (player) {
      player.seekTo(line.start, true);
      // If player was paused or ended, play it
      if (playbackState !== 'playing') {
        player.playVideo();
      }
    }
  };

  // Font family mappings
  const fontClassMap = {
    sans: 'font-sans',
    mono: 'font-mono',
    serif: 'font-serif',
    outfit: 'font-outfit',
    inter: 'font-sans',
  };

  // Text alignment mappings
  const alignClassMap = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };

  const selectedFont = fontClassMap[settings.fontFamily] || 'font-sans';
  const selectedAlign = alignClassMap[settings.lyricAlignment] || 'text-center';

  if (!lyrics || lyrics.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 text-gray-500 font-sans glass-card rounded-3xl border border-white/5">
        <p className="text-lg">No synchronized lyrics loaded.</p>
        <p className="text-sm mt-2 max-w-xs">Transcripts are fetched automatically from public subtitles if available.</p>
      </div>
    );
  }

  // Accent color for active glowing effect
  const highlightColorMap = {
    accent: dominantColors?.accent || '#a855f7',
    cyan: '#06b6d4',
    magenta: '#ec4899',
    yellow: '#eab308',
    white: '#ffffff'
  };
  const glowAccent = highlightColorMap[settings.highlightColor] || dominantColors?.accent || '#a855f7';

  return (
    <div className="w-full h-full flex-grow relative overflow-hidden flex flex-col">
      {/* Top and Bottom Fading Gradient Mask */}
      <div 
        ref={containerRef}
        className="w-full h-full overflow-y-auto no-scrollbar py-[120px] px-6 space-y-5"
        style={{
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
        }}
      >
        {lyrics.map((line, idx) => {
          const isActive = idx === activeLyricIndex;
          const isPast = idx < activeLyricIndex;
          const isFuture = idx > activeLyricIndex;

          let lineClass = `${selectedAlign} text-gray-500 opacity-30 blur-[1px] transition-all duration-700 cursor-pointer`;
          let style: React.CSSProperties = {};

          if (isActive) {
            lineClass = `${selectedAlign} text-white scale-105 opacity-100 font-bold transition-all duration-300 cursor-pointer`;
            style = {
              fontSize: `${settings.subtitleSize}rem`,
              lineHeight: '1.25',
              transformOrigin: 'center center',
              '--glow-color': glowAccent,
              filter: `drop-shadow(0 0 ${settings.glowIntensity * 1.5}px ${glowAccent}77)`,
            } as React.CSSProperties;
          } else if (isPast) {
            lineClass = `${selectedAlign} text-white/50 opacity-40 blur-none transition-all duration-700 cursor-pointer hover:opacity-75`;
            style = {
              fontSize: `${settings.subtitleSize * 0.85}rem`,
              lineHeight: '1.3',
            };
          } else if (isFuture) {
            // Apply blur amount if configured
            const blurPx = settings.blurAmount > 0 ? `${settings.blurAmount / 2}px` : '1px';
            lineClass = `${selectedAlign} text-gray-500/30 opacity-25 cursor-pointer hover:opacity-50 transition-all duration-700`;
            style = {
              fontSize: `${settings.subtitleSize * 0.85}rem`,
              lineHeight: '1.3',
              filter: `blur(${blurPx})`,
            };
          }

          return (
            <motion.div
              key={idx}
              ref={isActive ? activeLineRef : null}
              onClick={() => handleLineClick(line)}
              className={`${selectedFont} ${lineClass} py-2.5 px-4 rounded-2xl hover:bg-white/[0.02] active:scale-[0.99] select-none`}
              style={style}
            >
              {isActive ? (
                <motion.span
                  initial={{ opacity: 0.8, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 * settings.animationSpeed }}
                  className="inline-block relative text-glow"
                >
                  {line.text}
                </motion.span>
              ) : (
                <span>{line.text}</span>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Auto Scroll Indicator Dot (Subtle bottom badge) */}
      {settings.autoScroll && playbackState === 'playing' && (
        <div className="absolute bottom-4 right-6 flex items-center space-x-1.5 glass-panel-light px-2.5 py-1 rounded-full border border-white/5 text-[10px] text-gray-400 font-sans tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          <span>SYNCED</span>
        </div>
      )}
    </div>
  );
};
