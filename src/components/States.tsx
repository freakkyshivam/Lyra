import React from 'react';
import { motion } from 'framer-motion';
import { 
  Youtube, 
  AlertTriangle, 
  MessageSquareOff, 
  VideoOff, 
  WifiOff, 
  Music,
  ArrowRight
} from 'lucide-react';
import { useLyraStore } from '../store/useLyraStore';

interface EmptyStateProps {
  onPasteExample: (url: string) => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onPasteExample }) => {
  const popularTracks = [
    { name: 'Featured Popular Track', url: 'https://www.youtube.com/watch?v=LUgpPmj6nR8&list=RDMM&start_radio=1&rv=kPa7bsKwL-c' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="flex flex-col items-center justify-center text-center p-8 max-w-2xl mx-auto my-12"
    >
      {/* Decorative Floating Illustration */}
      <div className="relative mb-8 w-24 h-24 flex items-center justify-center">
        <motion.div 
          className="absolute inset-0 rounded-3xl bg-radial from-white/10 to-transparent blur-xl"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div 
          className="w-20 h-20 rounded-2xl glass-card flex items-center justify-center border border-white/10 relative z-10 shadow-2xl"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          <Youtube className="w-10 h-10 text-red-500" />
        </motion.div>
        <motion.div 
          className="absolute -right-2 -top-2 w-8 h-8 rounded-full glass-card flex items-center justify-center border border-white/15 z-20"
          animate={{ y: [0, 4, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        >
          <Music className="w-4 h-4 text-emerald-400" />
        </motion.div>
      </div>

      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-outfit text-white mb-3">
        Paste a YouTube link to begin.
      </h1>
      <p className="text-gray-400 text-base sm:text-lg mb-8 max-w-md font-sans">
        Enter any public music or video URL. Lyra will load the video, fetch subtitles, and generate a custom theme.
      </p>

      {/* Suggested tracks for quick testing */}
      <div className="w-full">
        <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-3">Try a popular track</p>
        <div className="grid grid-cols-1 gap-3 w-full max-w-md mx-auto">
          {popularTracks.map((track) => (
            <button
              key={track.url}
              onClick={() => onPasteExample(track.url)}
              className="flex items-center justify-between p-3.5 rounded-xl glass-panel-light hover:bg-white/5 border border-white/5 hover:border-white/10 text-left transition-all duration-300 group"
            >
              <span className="text-sm font-medium text-gray-300 group-hover:text-white truncate pr-2">
                {track.name}
              </span>
              <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-transform duration-300 group-hover:translate-x-1 flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>
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
