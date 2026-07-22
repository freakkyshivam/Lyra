import React, { useEffect, useRef } from 'react';
import YouTube from 'react-youtube';
import type { YouTubeProps } from 'react-youtube';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { useLyraStore } from '../store/useLyraStore';

export const YouTubeEmbed: React.FC = () => {
  const videoId = useLyraStore((state) => state.videoId);
  const playbackState = useLyraStore((state) => state.playbackState);
  const dominantColors = useLyraStore((state) => state.dominantColors);
  const player = useLyraStore((state) => state.player);
  const videoTitle = useLyraStore((state) => state.videoTitle);

  const setPlayer = useLyraStore((state) => state.setPlayer);
  const setPlaybackState = useLyraStore((state) => state.setPlaybackState);
  const setCurrentTime = useLyraStore((state) => state.setCurrentTime);
  const setDuration = useLyraStore((state) => state.setDuration);

  const timerRef = useRef<number | null>(null);

  // Synchronize playback current time when playing
  useEffect(() => {
    if (playbackState === 'playing' && player) {
      if (timerRef.current) window.clearInterval(timerRef.current);

      timerRef.current = window.setInterval(() => {
        try {
          const time = player.getCurrentTime();
          setCurrentTime(time);
        } catch (e) {
          // Ignore if player is unmounting
        }
      }, 150);
    } else {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [playbackState, player, setCurrentTime]);

  if (!videoId) return null;

  const onReady = (event: any) => {
    const playerInstance = event.target;
    setPlayer(playerInstance);
    setDuration(playerInstance.getDuration() || 0);
  };

  const onStateChange = async (event: any) => {
    const state = event.data;
    if (state === 1) {
      setPlaybackState('playing');
      setDuration(event.target.getDuration() || 0);
    } else if (state === 2) {
      setPlaybackState('paused');
    } else if (state === 0) {
      setPlaybackState('ended');

      // Play next song in the queue automatically
      const nextSong = useLyraStore.getState().queue[0];
      if (nextSong) {
        useLyraStore.getState().removeFromQueue(nextSong.id);
        useLyraStore.getState().playQueueItemDirect(nextSong);
      }
    }
  };

  const handlePlayToggle = () => {
    if (!player) return;
    if (playbackState === 'playing') {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
  };

  const isMuted = player ? player.isMuted() : false;
  const handleMuteToggle = () => {
    if (!player) return;
    if (isMuted) {
      player.unMute();
    } else {
      player.mute();
    }
    // Toggle state change to force icon render updates
    setPlaybackState(playbackState);
  };

  const opts: YouTubeProps['opts'] = {
    height: '1px',
    width: '1px',
    playerVars: {
      autoplay: 1,
      controls: 0,
      disablekb: 1,
      modestbranding: 1,
      rel: 0,
      showinfo: 0,
      iv_load_policy: 3,
    },
  };

  const glowAccent = dominantColors?.accent || 'var(--color-accent, #a855f7)';
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  return (
    <div className="flex flex-col items-center justify-center relative w-full h-full select-none">
      {/* Invisible YouTube video element (moved offscreen and sized 1x1) */}
      <div className="absolute left-[-9999px] w-px h-px opacity-0 pointer-events-none">
        <YouTube
          videoId={videoId}
          opts={opts}
          onReady={onReady}
          onStateChange={onStateChange}
        />
      </div>

      {/* Centered Rotating Vinyl Disc */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, type: 'spring' }}
          className="relative w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-60 lg:h-60 xl:w-68 xl:h-68 flex-shrink-0 z-10"
        >
          {/* Vinyl Record */}
          <div
            className="w-full h-full rounded-full bg-black relative flex items-center justify-center transition-all duration-[3000ms] shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
            style={{
              backgroundImage: `repeating-radial-gradient(
                circle,
                #121212 0px,
                #121212 2px,
                #1d1d1d 3px,
                #2a2a2a 5px,
                #121212 6px
              )`,
              animation: 'spin 12s linear infinite',
              animationPlayState: playbackState === 'playing' ? 'running' : 'paused',
              border: '2px solid rgba(255,255,255,0.06)',
            }}
          >
            {/* Vinyl Gloss glare overlay */}
            <div 
              className="absolute inset-0 rounded-full opacity-10 pointer-events-none"
              style={{
                background: 'linear-gradient(45deg, transparent 40%, rgba(255, 255, 255, 0.4) 50%, transparent 60%)',
              }}
            />

            {/* Song cover sticker in the center */}
            <div className="w-[32%] h-[32%] rounded-full bg-neutral-800 border-4 border-black overflow-hidden relative shadow-inner">
              <img
                src={thumbnailUrl}
                alt="Track Cover"
                className="w-full h-full object-cover rounded-full"
              />
              {/* Spindle center hole */}
              <div className="absolute inset-0 m-auto w-3.5 h-3.5 rounded-full bg-zinc-900 border border-zinc-700 shadow-md" />
            </div>
          </div>

          {/* Ambient Glow Aura around the vinyl disk */}
          <div
            className="absolute -inset-4 rounded-full -z-10 filter blur-[40px] transition-all duration-1000"
            style={{
              background: `radial-gradient(circle, ${glowAccent} 0%, transparent 70%)`,
              opacity: playbackState === 'playing' ? 0.6 : 0.3,
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Original Video Title banner */}
      <div className="mt-6 text-center max-w-xs px-4">
        <h2 className="text-sm sm:text-base font-bold text-white/90 truncate" title={videoTitle}>
          {videoTitle || 'Loading Track...'}
        </h2>
        <p className="text-[10px] text-gray-500 font-mono mt-1 uppercase tracking-wider">
          YouTube Audio Source
        </p>
      </div>

      {/* Floating control pills below vinyl disk */}
      <div className="mt-6 flex items-center gap-4 z-20">
        <button
          onClick={handlePlayToggle}
          className="w-12 h-12 rounded-full glass-panel hover:bg-white/10 flex items-center justify-center border border-white/10 text-white cursor-pointer active:scale-95 transition-all shadow-xl"
          title={playbackState === 'playing' ? 'Pause' : 'Play'}
        >
          {playbackState === 'playing' ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
        </button>
        <button
          onClick={handleMuteToggle}
          className="w-12 h-12 rounded-full glass-panel hover:bg-white/10 flex items-center justify-center border border-white/10 text-white cursor-pointer active:scale-95 transition-all shadow-xl"
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
};
