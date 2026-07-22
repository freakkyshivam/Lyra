import React from 'react';
import { motion } from 'framer-motion';
import { 
  Youtube, 
  AlertTriangle, 
  MessageSquareOff, 
  VideoOff, 
  WifiOff, 
  Music,
  ArrowRight,
  Sparkles,
  Zap,
  Palette,
  ListMusic,
  Sliders,
  Play
} from 'lucide-react';
import { useLyraStore } from '../store/useLyraStore';

interface EmptyStateProps {
  onPasteExample: (url: string) => void;
  children?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onPasteExample, children }) => {
  const popularTracks = [
    { name: 'Featured Popular Track', url: 'https://www.youtube.com/watch?v=LUgpPmj6nR8&list=RDMM&start_radio=1&rv=kPa7bsKwL-c' }
  ];

  const features = [
    {
      icon: <Zap className="w-5 h-5 text-yellow-400" />,
      title: 'Real-Time Karaoke Sync',
      desc: 'Scrapes YouTube captions & LRCLIB synced .lrc tracks for smooth auto-scrolling lyrics.'
    },
    {
      icon: <Palette className="w-5 h-5 text-purple-400" />,
      title: 'Canvas Color Extraction',
      desc: 'Dynamically extracts artwork color palettes to illuminate your screen with ambient glow.'
    },
    {
      icon: <ListMusic className="w-5 h-5 text-emerald-400" />,
      title: 'Smart Queue & Auto-Next',
      desc: 'Pre-buffers up to 10 songs in the background and auto-advances when a track ends.'
    },
    {
      icon: <Sliders className="w-5 h-5 text-cyan-400" />,
      title: '7 Themes & Keyboard HUD',
      desc: 'Customize fonts, particles, and control playback with intuitive global hotkeys.'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="flex flex-col items-center justify-center text-center p-4 sm:p-8 max-w-4xl mx-auto my-4 sm:my-6 select-none"
    >
      {/* Super-Badge Header */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-gray-300 mb-6 font-mono tracking-wide shadow-lg"
      >
        <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
        <span className="bg-gradient-to-r from-purple-300 via-white to-pink-300 bg-clip-text text-transparent uppercase">
          KARAOKE PLAYER FOR YOUTUBE
        </span>
      </motion.div>

      {/* Decorative Animated Floating Icon */}
      <div className="relative mb-6 w-24 h-24 flex items-center justify-center">
        <motion.div 
          className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-cyan-500/20 blur-2xl"
          animate={{ scale: [1, 1.25, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
        <motion.div 
          className="w-20 h-20 rounded-3xl glass-card flex items-center justify-center border border-white/15 relative z-10 shadow-2xl"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <Youtube className="w-10 h-10 text-red-500" />
        </motion.div>
        <motion.div 
          className="absolute -right-2 -top-2 w-9 h-9 rounded-full glass-card flex items-center justify-center border border-white/20 z-20 shadow-lg"
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        >
          <Music className="w-4 h-4 text-emerald-400" />
        </motion.div>
      </div>

      {/* Main Hero Headline */}
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight font-outfit text-white mb-4 leading-tight">
        Sing Any Song <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">Synchronized</span>.
      </h1>

      {/* Requested Instruction Text */}
      <div className="max-w-xl mx-auto mb-6">
        <h2 className="text-xl sm:text-2xl font-bold font-outfit text-gray-200 mb-2">
          Paste a YouTube link to begin.
        </h2>
        <p className="text-gray-400 text-sm sm:text-base font-sans leading-relaxed">
          Enter any public music or video URL. Lyra will load the video, fetch subtitles, extract artwork colors, and generate an interactive karaoke experience.
        </p>
      </div>

      {/* Input element placed directly below text */}
      {children && (
        <div className="w-full max-w-2xl mb-8">
          {children}
        </div>
      )}

      {/* Featured Track Bar */}
      <div className="w-full max-w-lg mb-12">
        <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-3 font-mono">
          Featured Recommendation
        </p>
        {popularTracks.map((track) => (
          <button
            key={track.url}
            onClick={() => onPasteExample(track.url)}
            className="w-full flex items-center justify-between p-4 rounded-2xl glass-panel hover:bg-white/10 border border-white/10 hover:border-purple-500/30 text-left transition-all duration-300 group shadow-xl active:scale-[0.99] cursor-pointer"
          >
            <div className="flex items-center min-w-0 pr-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mr-3.5 flex-shrink-0 group-hover:scale-105 transition-transform">
                <Play className="w-4 h-4 text-purple-300 fill-purple-300 ml-0.5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-200 group-hover:text-white truncate">
                  {track.name}
                </p>
                <p className="text-xs text-gray-400 truncate mt-0.5">
                  Click to analyze & load karaoke instantly
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-white transition-transform duration-300 group-hover:translate-x-1 flex-shrink-0" />
          </button>
        ))}
      </div>

      {/* Bento Showcase Grid */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 text-left mb-10">
        {features.map((f, i) => (
          <div 
            key={i} 
            className="p-5 rounded-2xl glass-card border border-white/10 hover:border-white/20 transition-all duration-300 shadow-xl flex flex-col justify-between group"
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform">
                {f.icon}
              </div>
              <h3 className="text-base font-bold text-white font-outfit">
                {f.title}
              </h3>
            </div>
            <p className="text-xs text-gray-400 font-sans leading-relaxed">
              {f.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Made by Shivam Chaudhary for fun Tag */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="inline-flex items-center space-x-2 px-5 py-2 rounded-full glass-panel border border-white/10 hover:border-purple-500/30 text-xs font-semibold text-gray-300 hover:text-white transition-all shadow-xl select-none group"
      >
        <Sparkles className="w-4 h-4 text-purple-400 group-hover:rotate-12 transition-transform" />
        <span className="bg-gradient-to-r from-purple-300 via-pink-300 to-cyan-300 bg-clip-text text-transparent font-semibold tracking-wide">
          Made by Shivam Chaudhary for fun
        </span>
      </motion.div>
    </motion.div>
  );
};

export const ErrorState: React.FC = () => {
  const error = useLyraStore((state) => state.error);
  const reset = useLyraStore((state) => state.reset);
  const setVideoUrl = useLyraStore((state) => state.setVideoUrl);

  if (!error) return null;

  const errorConfigs = {
    'invalid-url': {
      icon: <AlertTriangle className="w-10 h-10 text-yellow-500" />,
      title: 'Invalid YouTube URL',
      desc: 'The link you entered is not recognized. Please make sure it is a valid YouTube video or watch link (e.g., https://youtube.com/watch?v=...).',
    },
    'no-subtitles': {
      icon: <MessageSquareOff className="w-10 h-10 text-purple-500" />,
      title: 'No Subtitles Available',
      desc: 'This video does not have any public subtitles or transcripts. Try another song, or paste a lyric file if available.',
    },
    'video-unavailable': {
      icon: <VideoOff className="w-10 h-10 text-red-500" />,
      title: 'Video Unavailable',
      desc: 'The YouTube video could not be loaded. It might be private, deleted, or restricted from embedding.',
    },
    'network-error': {
      icon: <WifiOff className="w-10 h-10 text-blue-500" />,
      title: 'Network Error',
      desc: 'Could not connect to YouTube or our caption servers. Please check your internet connection and try again.',
    },
  };

  const config = errorConfigs[error] || {
    icon: <AlertTriangle className="w-10 h-10 text-red-500" />,
    title: 'Unexpected Error',
    desc: 'An unknown error occurred while loading this video. Please try again.',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center text-center p-8 max-w-md mx-auto my-16 glass-card rounded-3xl border border-white/10 relative overflow-hidden"
    >
      {/* Decorative Glow */}
      <div className="absolute -top-12 -left-12 w-24 h-24 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="mb-6 w-16 h-16 rounded-2xl glass-panel-light flex items-center justify-center border border-white/10 shadow-inner">
        {config.icon}
      </div>

      <h2 className="text-xl sm:text-2xl font-bold font-outfit text-white mb-2">
        {config.title}
      </h2>
      <p className="text-gray-400 text-sm leading-relaxed mb-8">
        {config.desc}
      </p>

      <button
        onClick={() => {
          setVideoUrl('');
          reset();
        }}
        className="w-full py-3 px-5 text-sm font-medium text-white bg-white/10 hover:bg-white/15 rounded-xl border border-white/10 hover:border-white/15 transition-all duration-300 shadow-lg cursor-pointer"
      >
        Go Back
      </button>
    </motion.div>
  );
};
