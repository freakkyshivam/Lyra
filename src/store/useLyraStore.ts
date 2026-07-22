import { create } from 'zustand';
import { extractDominantColors } from '../hooks/useColorExtractor';

export interface LyricLine {
  text: string;
  start: number; // in seconds
  duration: number; // in seconds
}

export type ThemeName = 'spotify' | 'apple' | 'amoled' | 'cyberpunk' | 'synthwave' | 'ocean' | 'sunset';

export interface LyraSettings {
  subtitleSize: number; // rem sizing factor (e.g. 1 to 3)
  fontFamily: 'sans' | 'mono' | 'serif' | 'outfit' | 'inter';
  animationSpeed: number; // 0.5 to 2
  glowIntensity: number; // 0 to 10
  blurAmount: number; // 0 to 12
  backgroundBrightness: number; // 0 to 100
  autoScroll: boolean;
  particleDensity: number; // 0 to 100
  lyricAlignment: 'left' | 'center' | 'right';
  pitchOffset: number; // -3 to +3 semitones
  enableVinylRotation: boolean;
  vocalLeadInTime: number; // 0 to 5 seconds
  highlightColor: 'accent' | 'cyan' | 'magenta' | 'yellow' | 'white';
}

export interface DominantColors {
  primary: string; // hex or rgb
  secondary: string;
  accent: string;
  glow: string;
}

export type LoadingStep = 'idle' | 'fetching-video' | 'loading-subtitles' | 'generating-theme' | 'preparing-player';

export interface QueueItem {
  id: string;
  videoUrl: string;
  title: string;
  thumbnailUrl: string;
  lyrics: LyricLine[];
  lyricsSource: 'youtube' | 'lrclib-synced' | 'lrclib-plain' | 'lyrics-ovh' | 'lyra-ai-fallback' | 'local-fallback' | null;
  lyricAlternatives: any[];
  activeLyricTrackId: number | null;
  trackName: string;
  artistName: string;
  dominantColors: DominantColors | null;
}

export interface LyraState {
  videoUrl: string;
  videoId: string | null;
  playbackState: 'idle' | 'playing' | 'paused' | 'ended';
  currentTime: number;
  duration: number;
  lyrics: LyricLine[];
  originalLyrics: LyricLine[]; // Store original untranslated lyrics
  activeLyricIndex: number;
  theme: ThemeName;
  settings: LyraSettings;
  dominantColors: DominantColors | null;
  loadingStep: LoadingStep;
  error: 'invalid-url' | 'no-subtitles' | 'video-unavailable' | 'network-error' | null;
  player: any | null; // YouTube Player instance
  pendingAnalyzeUrl: string | null; // Set when quick-pasting a song
  lyricsSource: 'youtube' | 'lrclib-synced' | 'lrclib-plain' | 'lyrics-ovh' | 'lyra-ai-fallback' | 'local-fallback' | null;
  isAlternativeLoading: boolean;
  alternativeError: string | null;
  lyricAlternatives: any[];
  activeLyricTrackId: number | null;
  trackName: string;
  artistName: string;
  videoTitle: string;
  queue: QueueItem[];
  
  // Actions
  setVideoUrl: (url: string) => void;
  setVideoId: (id: string | null) => void;
  setPlaybackState: (state: 'idle' | 'playing' | 'paused' | 'ended') => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setLyrics: (lyrics: LyricLine[]) => void;
  setOriginalLyrics: (lyrics: LyricLine[]) => void;
  setLyricsSource: (source: LyraState['lyricsSource']) => void;
  setActiveLyricIndex: (index: number) => void;
  setTheme: (theme: ThemeName) => void;
  updateSettings: (settings: Partial<LyraSettings>) => void;
  setDominantColors: (colors: DominantColors | null) => void;
  setLoadingStep: (step: LoadingStep) => void;
  setError: (error: LyraState['error']) => void;
  setPlayer: (player: any) => void;
  setPendingAnalyzeUrl: (url: string | null) => void;
  setLyricAlternatives: (alts: any[]) => void;
  setActiveLyricTrackId: (id: number | null) => void;
  fetchLyricsAlternative: (trackId: number) => Promise<void>;
  searchLyricsAlternative: (query: string) => Promise<void>;
  addToQueue: (url: string) => Promise<void>;
  removeFromQueue: (id: string) => void;
  clearQueue: () => void;
  playQueueItemDirect: (item: QueueItem) => void;
  reset: () => void;
}

const DEFAULT_SETTINGS: LyraSettings = {
  subtitleSize: 1.8,
  fontFamily: 'outfit',
  animationSpeed: 1,
  glowIntensity: 6,
  blurAmount: 6,
  backgroundBrightness: 40,
  autoScroll: true,
  particleDensity: 40,
  lyricAlignment: 'center',
  pitchOffset: 0,
  enableVinylRotation: true,
  vocalLeadInTime: 0,
  highlightColor: 'accent',
};

export const useLyraStore = create<LyraState>((set) => ({
  videoUrl: '',
  videoId: null,
  playbackState: 'idle',
  currentTime: 0,
  duration: 0,
  lyrics: [],
  originalLyrics: [],
  lyricsSource: null,
  activeLyricIndex: -1,
  theme: 'spotify',
  settings: DEFAULT_SETTINGS,
  dominantColors: null,
  loadingStep: 'idle',
  error: null,
  player: null,
  pendingAnalyzeUrl: null,
  isAlternativeLoading: false,
  alternativeError: null,
  lyricAlternatives: [],
  activeLyricTrackId: null,
  trackName: '',
  artistName: '',
  videoTitle: '',
  queue: [],

  setVideoUrl: (url) => set({ videoUrl: url }),
  setVideoId: (id) => set({ videoId: id }),
  setPlaybackState: (state) => set({ playbackState: state }),
  setCurrentTime: (time) => set((state) => {
    // Find the current lyric line index based on time
    let activeLyricIndex = -1;
    for (let i = 0; i < state.lyrics.length; i++) {
      const line = state.lyrics[i];
      if (time >= line.start && (i === state.lyrics.length - 1 || time < state.lyrics[i + 1].start)) {
        activeLyricIndex = i;
        break;
      }
    }
    return { currentTime: time, activeLyricIndex };
  }),
  setDuration: (duration) => set({ duration }),
  setLyrics: (lyrics) => set({ lyrics, activeLyricIndex: -1 }),
  setOriginalLyrics: (originalLyrics) => set({ originalLyrics }),
  setLyricsSource: (lyricsSource) => set({ lyricsSource }),
  setActiveLyricIndex: (activeLyricIndex) => set({ activeLyricIndex }),
  setTheme: (theme) => set({ theme }),
  updateSettings: (settings) => set((state) => ({ settings: { ...state.settings, ...settings } })),
  setDominantColors: (dominantColors) => set({ dominantColors }),
  setLoadingStep: (step) => set({ loadingStep: step }),
  setError: (error) => set({ error }),
  setPlayer: (player) => set({ player }),
  setPendingAnalyzeUrl: (pendingAnalyzeUrl) => set({ pendingAnalyzeUrl }),
  setLyricAlternatives: (lyricAlternatives) => set({ lyricAlternatives }),
  setActiveLyricTrackId: (activeLyricTrackId) => set({ activeLyricTrackId }),
  fetchLyricsAlternative: async (trackId: number) => {
    const { videoId, setLyrics, setActiveLyricTrackId } = useLyraStore.getState();
    if (!videoId) return;

    set({ isAlternativeLoading: true, alternativeError: null });
    try {
      const res = await fetch(`/api/transcript?videoId=${videoId}&trackId=${trackId}`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch alternative lyrics');
      }
      const data = await res.json();
      if (data.error) {
        throw new Error(data.details || 'Failed to fetch alternative lyrics');
      }
      
      const lyricArray = Array.isArray(data) ? data : (data.lyrics || []);
      if (Array.isArray(lyricArray)) {
        setLyrics(lyricArray);
        set({ 
          originalLyrics: lyricArray,
          trackName: data.trackName || '',
          artistName: data.artistName || '',
          videoTitle: data.videoTitle || ''
        });
        setActiveLyricTrackId(trackId);
      }
    } catch (err: any) {
      console.error('[Lyra Alternatives] Error:', err);
      set({ alternativeError: err.message || 'Failed to load alternative track.' });
    } finally {
      set({ isAlternativeLoading: false });
    }
  },
  searchLyricsAlternative: async (query: string) => {
    const { videoId, setLyrics, setLyricAlternatives, setActiveLyricTrackId } = useLyraStore.getState();
    if (!videoId) return;

    set({ isAlternativeLoading: true, alternativeError: null });
    try {
      const res = await fetch(`/api/transcript?videoId=${videoId}&searchQuery=${encodeURIComponent(query)}`);
      if (!res.ok) {
        throw new Error('Failed to search lyrics');
      }
      const data = await res.json();
      if (data.error) {
        throw new Error(data.details || 'Failed to search lyrics');
      }
      
      const alts = data.alternatives || [];
      setLyricAlternatives(alts);
      
      if (alts.length > 0) {
        const firstMatchId = alts[0].id;
        const lyricsRes = await fetch(`/api/transcript?videoId=${videoId}&trackId=${firstMatchId}`);
        if (lyricsRes.ok) {
          const lyricsData = await lyricsRes.json();
          const lyricArray = Array.isArray(lyricsData) ? lyricsData : (lyricsData.lyrics || []);
          if (Array.isArray(lyricArray)) {
            setLyrics(lyricArray);
            set({ originalLyrics: lyricArray });
            setActiveLyricTrackId(firstMatchId);
          }
        }
      } else {
        set({ alternativeError: 'No matching lyrics found on LRCLIB.' });
      }
    } catch (err: any) {
      console.error('[Lyra Alternatives Search] Error:', err);
      set({ alternativeError: err.message || 'Failed to search alternative track.' });
    } finally {
      set({ isAlternativeLoading: false });
    }
  },
  addToQueue: async (url: string) => {
    const queue = useLyraStore.getState().queue;
    if (queue.length >= 10) {
      throw new Error('Queue is full (maximum 10 songs)');
    }

    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    const videoId = (match && match[2].length === 11) ? match[2] : null;
    if (!videoId) throw new Error('Invalid YouTube URL');

    let lyrics: LyricLine[] = [];
    let lyricsSource: LyraState['lyricsSource'] = null;
    let lyricAlternatives: any[] = [];
    let activeLyricTrackId: number | null = null;
    let trackName = '';
    let artistName = '';
    let title = '';
    let dominantColors: DominantColors | null = null;

    try {
      // 1. Fetch transcript & metadata from server API
      const res = await fetch(`/api/transcript?videoId=${videoId}`);
      const data = await res.json().catch(() => ({}));

      title = data.videoTitle || '';
      trackName = data.trackName || '';
      artistName = data.artistName || '';
      lyricAlternatives = data.alternatives || [];
      activeLyricTrackId = data.activeTrackId || null;
      lyricsSource = data.source || 'youtube';

      const lyricArray = Array.isArray(data) ? data : (data.lyrics || []);

      // If videoTitle was missing, fetch oEmbed directly for exact song name
      if (!title) {
        try {
          const noembedRes = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`);
          if (noembedRes.ok) {
            const noembedData = await noembedRes.json();
            title = noembedData.title || `YouTube Track (${videoId})`;
          }
        } catch (e) {
          title = `YouTube Track (${videoId})`;
        }
      }

      if (Array.isArray(lyricArray) && lyricArray.length > 0) {
        lyrics = lyricArray.map((item: any) => {
          const decodeHtml = (str: string) => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(str, 'text/html');
            return doc.documentElement.textContent || str;
          };
          const text = decodeHtml(item.text || '');
          let start = item.start !== undefined ? item.start : item.offset;
          let duration = item.duration !== undefined ? item.duration : 2.5;
          if (start > 1000) start /= 1000;
          if (duration > 100) duration /= 1000;
          return { text, start, duration };
        });
      } else {
        // If lyrics not found, set instrumental fallback lines
        lyrics = [
          { text: "🎵 [Enjoy the music! Synced lyrics not found, but player loaded successfully]", start: 0, duration: 8 },
          { text: "🎹 [Instrumental Playback]", start: 8, duration: 240 }
        ];
        lyricsSource = 'local-fallback';
      }

      // 2. Pre-extract color theme in the background
      try {
        dominantColors = await extractDominantColors(videoId);
      } catch (colorErr) {
        console.warn('[Lyra Store Queue] Background color extraction failed:', colorErr);
      }
    } catch (e) {
      lyrics = [
        { text: "🎵 [Enjoy the music! Synced lyrics not found, but player loaded successfully]", start: 0, duration: 8 },
        { text: "🎹 [Instrumental Playback]", start: 8, duration: 240 }
      ];
      lyricsSource = 'local-fallback';
      if (!title) title = `YouTube Track (${videoId})`;
      if (!trackName) trackName = title;
      if (!artistName) artistName = 'YouTube Upload';
    }

    const newItem: QueueItem = {
      id: Math.random().toString(36).substring(2, 9),
      videoUrl: url,
      title,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      lyrics,
      lyricsSource,
      lyricAlternatives,
      activeLyricTrackId,
      trackName,
      artistName,
      dominantColors
    };

    set((state) => ({
      queue: [...state.queue, newItem],
    }));
  },
  removeFromQueue: (id) => set((state) => ({
    queue: state.queue.filter(item => item.id !== id),
  })),
  clearQueue: () => set({ queue: [] }),
  playQueueItemDirect: (item: QueueItem) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = item.videoUrl.match(regExp);
    const videoId = (match && match[2].length === 11) ? match[2] : null;
    if (!videoId) return;

    set({
      videoUrl: item.videoUrl,
      lyrics: item.lyrics,
      originalLyrics: item.lyrics,
      lyricsSource: item.lyricsSource,
      lyricAlternatives: item.lyricAlternatives,
      activeLyricTrackId: item.activeLyricTrackId,
      dominantColors: item.dominantColors,
      trackName: item.trackName,
      artistName: item.artistName,
      videoTitle: item.title,
      activeLyricIndex: -1,
      currentTime: 0,
      videoId // Mounts player instantly!
    });
  },
  reset: () => set({
    videoUrl: '',
    videoId: null,
    playbackState: 'idle',
    currentTime: 0,
    duration: 0,
    lyrics: [],
    originalLyrics: [],
    lyricsSource: null,
    activeLyricIndex: -1,
    dominantColors: null,
    loadingStep: 'idle',
    error: null,
    player: null,
    pendingAnalyzeUrl: null,
    isAlternativeLoading: false,
    alternativeError: null,
    lyricAlternatives: [],
    activeLyricTrackId: null,
    trackName: '',
    artistName: '',
    videoTitle: '',
    queue: [],
  }),
}));
