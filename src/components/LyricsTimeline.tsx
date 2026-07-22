import React, { useState, useRef } from 'react';
import { useLyraStore } from '../store/useLyraStore';
import type { LyricLine } from '../store/useLyraStore';

export const LyricsTimeline: React.FC = () => {
  const currentTime = useLyraStore((state) => state.currentTime);
  const duration = useLyraStore((state) => state.duration);
  const lyrics = useLyraStore((state) => state.lyrics);
  const player = useLyraStore((state) => state.player);
  const dominantColors = useLyraStore((state) => state.dominantColors);

  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverLyric, setHoverLyric] = useState<string | null>(null);
  const [hoverX, setHoverX] = useState<number>(0);
  const [isHovering, setIsHovering] = useState<boolean>(false);

  const progressBarRef = useRef<HTMLDivElement>(null);

  // Time formatter
  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Handle clicking on progress bar to seek
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || duration === 0 || !player) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const seekRatio = Math.max(0, Math.min(1, clickX / width));
    const seekTime = seekRatio * duration;
    
    player.seekTo(seekTime, true);
    useLyraStore.getState().setCurrentTime(seekTime);
  };

  // Handle hovering over progress bar to show lyric/time tooltip
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || duration === 0) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    const hoverRatio = Math.max(0, Math.min(1, x / width));
    const time = hoverRatio * duration;

    // Save horizontal position for tooltip placement
    setHoverX(x);
    setHoverTime(time);

    // Find the lyric at this hovered time
    let matchedLyric: LyricLine | null = null;
    for (let i = 0; i < lyrics.length; i++) {
      const line = lyrics[i];
      if (time >= line.start && (i === lyrics.length - 1 || time < lyrics[i + 1].start)) {
        matchedLyric = line;
        break;
      }
    }
    setHoverLyric(matchedLyric ? matchedLyric.text : null);
  };

  // Accent color overrides
  const accentColor = dominantColors?.accent || 'var(--color-accent, #a855f7)';

  return (
    <div className="w-full font-sans select-none px-4 py-3">
      <div className="flex items-center space-x-4 max-w-5xl mx-auto">
        {/* Current Time Display */}
        <span className="text-xs font-semibold text-gray-400 w-10 text-right tabular-nums">
          {formatTime(currentTime)}
        </span>

        {/* Progress Bar Container */}
        <div className="relative flex-grow py-3">
          <div
            ref={progressBarRef}
            onClick={handleSeek}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => {
              setIsHovering(false);
              setHoverTime(null);
              setHoverLyric(null);
            }}
            className="w-full h-1.5 bg-white/5 hover:bg-white/10 rounded-full cursor-pointer relative transition-colors duration-300"
          >
            {/* Timeline markers (dot indicators for each subtitle segment) */}
            {duration > 0 &&
              lyrics.map((line, idx) => {
                const markerPercent = (line.start / duration) * 100;
                // Don't render if out of bounds
                if (markerPercent < 0 || markerPercent > 100) return null;
                return (
                  <div
                    key={idx}
                    className="absolute w-1 h-1 rounded-full -translate-y-1/2 top-1/2 pointer-events-none opacity-20 bg-white"
                    style={{ left: `${markerPercent}%` }}
                  />
                );
              })}

            {/* Filled Track Progress */}
            <div
              className="h-full rounded-full transition-all duration-100 ease-out"
              style={{
                width: `${progressPercent}%`,
                backgroundColor: accentColor,
                boxShadow: `0 0 8px ${accentColor}dd`,
              }}
            />

            {/* Tooltip Popup (Lyric Preview) */}
            {isHovering && hoverTime !== null && (
              <div
                className="absolute bottom-6 -translate-x-1/2 pointer-events-none z-30 transition-all duration-150 ease-out"
                style={{ left: `${hoverX}px` }}
              >
                <div className="glass-card border border-white/15 px-3 py-2 rounded-xl text-center shadow-2xl min-w-[120px] max-w-[280px]">
                  {/* Lyric preview */}
                  {hoverLyric && (
                    <p className="text-white text-xs font-semibold leading-snug mb-1 italic truncate">
                      "{hoverLyric}"
                    </p>
                  )}
                  {/* Time preview */}
                  <span className="text-[10px] text-gray-400 font-bold tracking-wider">
                    {formatTime(hoverTime)}
                  </span>
                </div>
                {/* Tooltip stem indicator */}
                <div className="w-2.5 h-2.5 bg-neutral-900 border-r border-b border-white/10 rotate-45 mx-auto -mt-1.5" />
              </div>
            )}
          </div>
        </div>

        {/* Total Time Display */}
        <span className="text-xs font-semibold text-gray-400 w-10 text-left tabular-nums">
          {formatTime(duration)}
        </span>
      </div>
    </div>
  );
};
