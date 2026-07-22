import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  Maximize, 
  Minimize,
  Volume2, 
  VolumeX 
} from 'lucide-react';
import { useLyraStore } from '../store/useLyraStore';

interface HUDAction {
  id: number;
  label: string;
  icon: React.ReactNode;
}

export const KeyboardShortcuts: React.FC = () => {
  const player = useLyraStore((state) => state.player);
  const playbackState = useLyraStore((state) => state.playbackState);
  const setPlaybackState = useLyraStore((state) => state.setPlaybackState);
  const currentTime = useLyraStore((state) => state.currentTime);
  const duration = useLyraStore((state) => state.duration);

  const [hudAction, setHudAction] = useState<HUDAction | null>(null);
  const [hudCounter, setHudCounter] = useState(0);

  const triggerHUD = (label: string, icon: React.ReactNode) => {
    setHudAction({
      id: hudCounter,
      label,
      icon
    });
    setHudCounter(prev => prev + 1);
  };

  // Automatically clear HUD after 800ms
  useEffect(() => {
    if (hudAction) {
      const timer = setTimeout(() => {
        setHudAction(null);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [hudAction]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore shortcut if user is typing in an input field
      const activeEl = document.activeElement;
      if (
        activeEl && 
        (activeEl.tagName === 'INPUT' || 
         activeEl.tagName === 'TEXTAREA' || 
         activeEl.getAttribute('contenteditable') === 'true')
      ) {
        return;
      }

      if (!player) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          if (playbackState === 'playing') {
            player.pauseVideo();
            triggerHUD('Paused', <Pause className="w-8 h-8 text-white fill-white" />);
          } else {
            player.playVideo();
            triggerHUD('Playing', <Play className="w-8 h-8 text-white fill-white" />);
          }
          break;

        case 'ArrowLeft':
          e.preventDefault();
          const backTime = Math.max(0, currentTime - 5);
          player.seekTo(backTime, true);
          useLyraStore.getState().setCurrentTime(backTime);
          triggerHUD('-5 Seconds', <RotateCcw className="w-8 h-8 text-white" />);
          break;

        case 'ArrowRight':
          e.preventDefault();
          const forwardTime = Math.min(duration, currentTime + 5);
          player.seekTo(forwardTime, true);
          useLyraStore.getState().setCurrentTime(forwardTime);
          triggerHUD('+5 Seconds', <RotateCw className="w-8 h-8 text-white" />);
          break;

        case 'KeyM':
          e.preventDefault();
          const isMuted = player.isMuted();
          if (isMuted) {
            player.unMute();
            triggerHUD('Volume On', <Volume2 className="w-8 h-8 text-white" />);
          } else {
            player.mute();
            triggerHUD('Muted', <VolumeX className="w-8 h-8 text-white" />);
          }
          // Force store updates for volume states
          setPlaybackState(useLyraStore.getState().playbackState);
          break;

        case 'KeyF':
          e.preventDefault();
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen()
              .then(() => {
                triggerHUD('Fullscreen', <Maximize className="w-8 h-8 text-white" />);
              })
              .catch(err => {
                console.warn('Error enabling fullscreen:', err);
              });
          } else {
            document.exitFullscreen();
            triggerHUD('Exit Fullscreen', <Minimize className="w-8 h-8 text-white" />);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [player, playbackState, currentTime, duration, hudCounter]);

  return (
    <AnimatePresence mode="wait">
      {hudAction && (
        <motion.div
          key={hudAction.id}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.7 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 m-auto w-32 h-32 flex flex-col items-center justify-center rounded-3xl glass-card border border-white/10 shadow-2xl z-50 pointer-events-none"
        >
          <div className="mb-2.5">
            {hudAction.icon}
          </div>
          <span className="text-xs font-extrabold font-outfit uppercase tracking-widest text-white/90">
            {hudAction.label}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
