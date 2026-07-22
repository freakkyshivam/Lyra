import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Settings, Plus, Play, Trash2, SkipForward } from 'lucide-react';
import { useLyraStore } from './store/useLyraStore';
import { BackgroundEffects } from './components/BackgroundEffects';
import { HeroInput } from './components/HeroInput';
import { EmptyState, ErrorState } from './components/States';
import { LoadingScreen } from './components/LoadingScreen';
import { YouTubeEmbed } from './components/YouTubeEmbed';
import { KaraokeLyrics } from './components/KaraokeLyrics';
import { LyricsTimeline } from './components/LyricsTimeline';
import { ThemeSelector } from './components/ThemeSelector';
import { SettingsModal } from './components/SettingsModal';
import { KeyboardShortcuts } from './components/KeyboardShortcuts';
import { useAnalyzeSong } from './hooks/useAnalyzeSong';

function App() {
  const videoId = useLyraStore((state) => state.videoId);
  const theme = useLyraStore((state) => state.theme);
  const error = useLyraStore((state) => state.error);
  const resetStore = useLyraStore((state) => state.reset);
  const setVideoUrl = useLyraStore((state) => state.setVideoUrl);
  const lyricAlternatives = useLyraStore((state) => state.lyricAlternatives);
  const isAlternativeLoading = useLyraStore((state) => state.isAlternativeLoading);
  const activeLyricTrackId = useLyraStore((state) => state.activeLyricTrackId);
  const fetchLyricsAlternative = useLyraStore((state) => state.fetchLyricsAlternative);
  const alternativeError = useLyraStore((state) => state.alternativeError);
  const trackName = useLyraStore((state) => state.trackName);
  const artistName = useLyraStore((state) => state.artistName);

  const queue = useLyraStore((state) => state.queue);
  const addToQueue = useLyraStore((state) => state.addToQueue);
  const removeFromQueue = useLyraStore((state) => state.removeFromQueue);
  const clearQueue = useLyraStore((state) => state.clearQueue);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'lyrics' | 'sources' | 'queue'>('lyrics');
  const [queueInput, setQueueInput] = useState('');
  const [isAddingToQueue, setIsAddingToQueue] = useState(false);

  const { analyzeSong } = useAnalyzeSong();
  // Load song from query parameters on boot (runs only once on mount)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const v = params.get('v');
    if (v) {
      analyzeSong(`https://www.youtube.com/watch?v=${v}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync active videoId changes with browser URL
  useEffect(() => {
    const url = new URL(window.location.href);
    if (videoId) {
      url.searchParams.set('v', videoId);
    } else {
      url.searchParams.delete('v');
    }
    window.history.pushState({}, '', url.toString());
  }, [videoId]);

  // Triggered when user selects a preset card from the empty state
  const handleQuickPaste = (url: string) => {
    useLyraStore.getState().setPendingAnalyzeUrl(url);
  };

  return (
    <div className={`theme-${theme} ${videoId ? 'h-screen overflow-hidden' : 'min-h-screen overflow-y-auto'} text-white relative flex flex-col justify-between font-sans selection:bg-white/20`}>
      {/* Background Particles & Ambient Glow */}
      <BackgroundEffects />

      {/* Global Hotkeys & HUD Overlay */}
      <KeyboardShortcuts />

      {/* Multi-stage Loading Transition Overlay */}
      <LoadingScreen />

      {/* Top Header Navigation */}
      <header className="w-full z-40 border-b border-white/5 bg-black/10 backdrop-blur-md flex-shrink-0">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          
          {/* App Logo */}
          <div 
            onClick={() => {
              setVideoUrl('');
              resetStore();
            }}
            className="flex items-center space-x-2.5 cursor-pointer select-none group"
          >
            <div className="w-9 h-9 rounded-xl bg-white text-black flex items-center justify-center shadow-lg transition-transform duration-500 group-hover:rotate-12">
              <Music className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-xl font-extrabold tracking-tight font-outfit bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">
              Lyra
            </span>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center space-x-3">
            {/* Theme Selector */}
            <ThemeSelector />

            {/* "+ New Song" Button (Visible only when playing a song) */}
            {videoId && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => {
                  setVideoUrl('');
                  resetStore();
                }}
                className="flex items-center space-x-1.5 bg-white/5 hover:bg-white/10 hover:text-white border border-white/5 hover:border-white/10 px-3.5 py-2 rounded-xl text-sm font-semibold text-gray-300 transition-all cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New Song</span>
              </motion.button>
            )}

            {/* Settings Button */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center border border-white/5 hover:border-white/10 text-gray-300 hover:text-white transition-all cursor-pointer active:scale-95"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className={`flex-grow flex items-center justify-center w-full max-w-7xl mx-auto px-6 py-4 z-10 ${videoId ? 'overflow-hidden' : ''}`}>
        <AnimatePresence mode="wait">
          {error ? (
            <motion.div
              key="error-state"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full"
            >
              <ErrorState />
            </motion.div>
          ) : !videoId ? (
            /* Home / Search View */
            <motion.div
              key="search-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex flex-col items-center"
            >
              <div className="text-center max-w-xl mx-auto mb-2 select-none">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-gray-400 mb-6 font-mono tracking-wide">
                  <Play className="w-3.5 h-3.5 fill-gray-400 stroke-none" />
                  <span>KARAOKE PLAYER FOR YOUTUBE</span>
                </div>
                <h2 className="text-4xl sm:text-5xl md:text-6xl font-black font-outfit tracking-tight text-white mb-4 leading-tight">
                  Sing synchronized.
                </h2>
                <p className="text-gray-400 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
                  Immersive lyrics, color-extracted ambient backdrops, and precision timing controls.
                </p>
              </div>

              {/* URL input field */}
              <HeroInput />

              {/* Illustration and Quick select templates */}
              <EmptyState onPasteExample={handleQuickPaste} />
            </motion.div>
          ) : (
            /* Immersive Player View */
            <motion.div
              key="player-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="w-full h-full flex flex-col lg:flex-row items-center justify-center gap-8 xl:gap-12 overflow-hidden"
            >
              {/* Left Column: Player & Rotating Vinyl */}
              <div className="w-full lg:w-[40%] flex flex-col justify-center items-center flex-shrink-0">
                <YouTubeEmbed />
              </div>

              {/* Right Column: Dynamic Lyrics Card */}
              <div className="w-full lg:w-[60%] h-full max-h-[calc(100vh-190px)] flex flex-col justify-center overflow-hidden">
                <div className="glass-card rounded-3xl border border-white/10 shadow-2xl p-6 relative overflow-hidden h-full flex flex-col min-h-0">
                  {/* Subtle internal gradient border */}
                  <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  
                  {/* Song Title and Artist Info Display */}
                  {videoId && trackName && (
                    <div className="mb-4 border-b border-white/5 pb-3">
                      <h3 className="text-xl font-black tracking-tight text-white font-outfit truncate">
                        {trackName}
                      </h3>
                      <p className="text-xs text-purple-400 font-semibold truncate mt-0.5 uppercase tracking-wider font-mono">
                        {artistName}
                      </p>
                    </div>
                  )}

                  <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs uppercase tracking-widest text-gray-400 font-bold font-mono">
                        {activeTab === 'lyrics' ? 'Subtitles Sync' : activeTab === 'sources' ? 'Lyric Sources' : 'Playback Queue'}
                      </span>
                      {isAlternativeLoading && (
                        <span className="text-[10px] text-purple-400 animate-pulse font-mono font-bold">
                          • Loading...
                        </span>
                      )}
                    </div>

                    <span className="text-[11px] text-gray-500 font-medium hidden sm:inline">
                      Press <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-[10px] text-gray-300">Space</kbd> to Pause
                    </span>
                  </div>

                  {/* Segmented Tab Switcher */}
                  {videoId && (
                    <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1 mb-4 select-none flex-shrink-0">
                      <button
                        onClick={() => setActiveTab('lyrics')}
                        className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                          activeTab === 'lyrics'
                            ? 'bg-white text-black shadow-md'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        Lyrics
                      </button>
                      <button
                        onClick={() => setActiveTab('sources')}
                        className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                          activeTab === 'sources'
                            ? 'bg-white text-black shadow-md'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        <span>Sources</span>
                        {lyricAlternatives.length > 0 && (
                          <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold ${
                            activeTab === 'sources' ? 'bg-black/10 text-black' : 'bg-purple-500/20 text-purple-300'
                          }`}>
                            {lyricAlternatives.length}
                          </span>
                        )}
                      </button>
                      <button
                        onClick={() => setActiveTab('queue')}
                        className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                          activeTab === 'queue'
                            ? 'bg-white text-black shadow-md'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        <span>Queue</span>
                        {queue.length > 0 && (
                          <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold ${
                            activeTab === 'queue' ? 'bg-black/10 text-black' : 'bg-emerald-500/20 text-emerald-300 animate-pulse'
                          }`}>
                            {queue.length}
                          </span>
                        )}
                      </button>
                    </div>
                  )}

                  {activeTab === 'sources' && (
                    <div className="flex-grow flex flex-col overflow-hidden min-h-0 space-y-4">
                      {/* Search Bar */}
                      <div className="flex items-center space-x-2 bg-white/[0.02] p-1 rounded-2xl border border-white/5 flex-shrink-0">
                        <input
                          type="text"
                          placeholder="Search lyrics manually (e.g. Ranjheya Ve Asees Kaur)..."
                          id="manual-lyric-search"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const val = (e.target as HTMLInputElement).value.trim();
                              if (val) useLyraStore.getState().searchLyricsAlternative(val);
                            }
                          }}
                          className="flex-grow bg-transparent text-sm text-white px-3 py-2 outline-none placeholder-gray-500"
                        />
                        <button
                          onClick={() => {
                            const input = document.getElementById('manual-lyric-search') as HTMLInputElement;
                            const val = input?.value.trim();
                            if (val) useLyraStore.getState().searchLyricsAlternative(val);
                          }}
                          disabled={isAlternativeLoading}
                          className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                        >
                          Search
                        </button>
                      </div>

                      {/* Options list */}
                      <div className="flex-grow overflow-y-auto pr-1 no-scrollbar space-y-2">
                        {lyricAlternatives.length === 0 ? (
                          <div className="text-center py-8">
                            <p className="text-sm text-gray-400">No alternative lyrics found.</p>
                            <p className="text-xs text-gray-500 mt-1">Try searching by typing the song & artist name above.</p>
                          </div>
                        ) : (
                          lyricAlternatives.map((track) => {
                            const isSelected = activeLyricTrackId === track.id;
                            const durationMinSec = track.duration 
                              ? `${Math.floor(track.duration / 60)}:${String(Math.floor(track.duration % 60)).padStart(2, '0')}`
                              : '';
                            
                            return (
                              <button
                                key={track.id}
                                onClick={async () => {
                                  if (!isSelected) {
                                    await fetchLyricsAlternative(track.id);
                                    setActiveTab('lyrics');
                                  }
                                }}
                                disabled={isAlternativeLoading}
                                className={`w-full py-2.5 px-4 rounded-2xl border text-left flex items-center justify-between text-xs transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-purple-600/20 border-purple-500 text-purple-200 shadow-md font-semibold'
                                    : 'bg-white/[0.02] border-white/5 text-gray-400 hover:bg-white/5 hover:border-white/10 disabled:opacity-50'
                                }`}
                              >
                                <div className="flex-grow min-w-0 pr-2">
                                  <p className={`truncate text-sm ${isSelected ? 'text-white' : 'text-gray-200'}`}>
                                    {track.trackName}
                                  </p>
                                  <p className="text-[11px] text-gray-400 truncate mt-0.5">
                                    by {track.artistName} {track.albumName ? `• ${track.albumName}` : ''}
                                  </p>
                                </div>
                                <div className="flex items-center space-x-2 flex-shrink-0 text-xs">
                                  <span className={`px-2 py-0.5 rounded font-mono ${
                                    track.hasSynced ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
                                  }`}>
                                    {track.hasSynced ? 'Synced' : 'Plain'}
                                  </span>
                                  {durationMinSec && (
                                    <span className="text-gray-400 font-mono">{durationMinSec}</span>
                                  )}
                                </div>
                              </button>
                            );
                          })
                        )}
                      </div>

                      {alternativeError && (
                        <p className="text-xs text-red-400 text-center font-medium">{alternativeError}</p>
                      )}
                    </div>
                  )}

                  {activeTab === 'queue' && (
                    <div className="flex-grow flex flex-col min-h-0">
                      {/* Paste Input to Add to Queue */}
                      <form
                        onSubmit={async (e) => {
                          e.preventDefault();
                          const url = queueInput.trim();
                          if (!url) return;
                          setQueueInput('');
                          setIsAddingToQueue(true);
                          try {
                            await addToQueue(url);
                          } catch (err: any) {
                            alert(err.message || 'Failed to add to queue');
                          } finally {
                            setIsAddingToQueue(false);
                          }
                        }}
                        className="mb-4 flex items-center gap-2 flex-shrink-0"
                      >
                        <input
                          type="text"
                          placeholder="Paste YouTube URL to queue..."
                          value={queueInput}
                          onChange={(e) => setQueueInput(e.target.value)}
                          className="flex-grow bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 outline-none focus:border-white/20 transition-all font-sans"
                        />
                        <button
                          type="submit"
                          disabled={isAddingToQueue}
                          className="bg-white hover:bg-white/90 text-black px-4 py-2 rounded-xl text-xs font-bold cursor-pointer disabled:opacity-50 transition-all active:scale-95 flex-shrink-0 font-sans"
                        >
                          {isAddingToQueue ? 'Adding...' : 'Add'}
                        </button>
                      </form>

                      {/* Queue List */}
                      <div className="flex-grow overflow-y-auto pr-1 no-scrollbar space-y-2 mb-4">
                        {queue.length === 0 ? (
                          <div className="text-center py-12">
                            <p className="text-sm text-gray-400">Queue is empty.</p>
                            <p className="text-xs text-gray-500 mt-1">Paste a song link above to auto-play it next!</p>
                          </div>
                        ) : (
                          queue.map((item, idx) => (
                            <div
                              key={item.id}
                              className="w-full py-2 px-3 rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] flex items-center justify-between text-xs transition-all"
                            >
                              <div className="flex items-center min-w-0 flex-grow pr-2">
                                {item.thumbnailUrl && !item.thumbnailUrl.includes('placeholder') ? (
                                  <img
                                    src={item.thumbnailUrl}
                                    alt=""
                                    className="w-12 h-9 rounded-lg object-cover bg-neutral-800 flex-shrink-0 mr-3 border border-white/5"
                                  />
                                ) : (
                                  <div className="w-12 h-9 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center mr-3 flex-shrink-0 text-gray-500">
                                    <Music className="w-4 h-4" />
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <p className="text-sm text-gray-200 truncate font-medium">
                                    {item.title}
                                  </p>
                                  <p className="text-[10px] text-gray-500 font-mono mt-0.5">
                                    Position #{idx + 1}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-2 flex-shrink-0">
                                <button
                                  onClick={() => {
                                    removeFromQueue(item.id);
                                    useLyraStore.getState().playQueueItemDirect(item);
                                    setActiveTab('lyrics');
                                  }}
                                  className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-white font-medium cursor-pointer transition-all active:scale-95"
                                >
                                  Play
                                </button>
                                <button
                                  onClick={() => removeFromQueue(item.id)}
                                  className="p-1 rounded hover:bg-red-500/20 text-gray-400 hover:text-red-400 cursor-pointer transition-all active:scale-95"
                                  title="Remove"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Queue Actions Footer */}
                      {queue.length > 0 && (
                        <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-auto flex-shrink-0">
                          <button
                            onClick={clearQueue}
                            className="text-xs font-semibold text-red-400 hover:text-red-300 transition-all cursor-pointer active:scale-95"
                          >
                            Clear Queue
                          </button>
                          <button
                            onClick={() => {
                              const nextTrack = queue[0];
                              if (nextTrack) {
                                removeFromQueue(nextTrack.id);
                                useLyraStore.getState().playQueueItemDirect(nextTrack);
                                setActiveTab('lyrics');
                              }
                            }}
                            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/10 hover:border-purple-500/20 text-xs font-semibold transition-all cursor-pointer active:scale-95"
                          >
                            <span>Skip to Next</span>
                            <SkipForward className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'lyrics' && (
                    <div className="flex-grow flex-1 min-h-0 flex flex-col overflow-hidden">
                      <KaraokeLyrics />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Timeline (Visible only when player is active) */}
      <AnimatePresence>
        {videoId && !error && (
          <motion.footer
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="w-full z-40 border-t border-white/5 bg-black/25 backdrop-blur-md flex-shrink-0"
          >
            <div className="max-w-7xl mx-auto px-6 py-3">
              <LyricsTimeline />
            </div>
          </motion.footer>
        )}
      </AnimatePresence>

      {/* Settings Panel Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </div>
  );
}

export default App;
