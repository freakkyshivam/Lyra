import { useCallback } from 'react';
import { useLyraStore } from '../store/useLyraStore';
import { useColorExtractor } from './useColorExtractor';
import { mockLyricsDB } from '../store/mockLyrics';

export function getYouTubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export const useAnalyzeSong = () => {
  const { extractColors } = useColorExtractor();
  
  const setVideoUrl = useLyraStore((state) => state.setVideoUrl);
  const setVideoId = useLyraStore((state) => state.setVideoId);
  const setLyrics = useLyraStore((state) => state.setLyrics);
  const setOriginalLyrics = useLyraStore((state) => state.setOriginalLyrics);
  const setLyricsSource = useLyraStore((state) => state.setLyricsSource);
  const setLyricAlternatives = useLyraStore((state) => state.setLyricAlternatives);
  const setActiveLyricTrackId = useLyraStore((state) => state.setActiveLyricTrackId);
  const setLoadingStep = useLyraStore((state) => state.setLoadingStep);
  const setError = useLyraStore((state) => state.setError);
  const resetStore = useLyraStore((state) => state.reset);

  const analyzeSong = useCallback(async (url: string) => {
    const trimmedUrl = url.trim();
    if (!trimmedUrl) return;

    const videoId = getYouTubeId(trimmedUrl);
    if (!videoId) {
      setError('invalid-url');
      return;
    }

    resetStore();
    setVideoUrl(trimmedUrl);
    setLoadingStep('fetching-video');

    try {
      // Step 1: Simulate video details fetching (feels premium and stable)
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      // Step 2: Load or Fetch Subtitles
      setLoadingStep('loading-subtitles');
      await new Promise((resolve) => setTimeout(resolve, 600));

      let lyricLines: any[] = [];
      let lyricsSourceValue: any = 'youtube';
      let lyricAlts: any[] = [];
      let activeTrackId: number | null = null;
      let trackNameValue = '';
      let artistNameValue = '';
      let videoTitleValue = '';

      // Check if it is a preloaded mock song
      if (mockLyricsDB[videoId]) {
        console.log('[Lyra] Loading lyrics from local mock DB for video:', videoId);
        lyricLines = mockLyricsDB[videoId];
        lyricsSourceValue = 'youtube';
        trackNameValue = 'Mock Song';
        artistNameValue = 'Demo Artist';
        videoTitleValue = 'Mock Video Title';
      } else {
        // Fetch from API with a 4.5-second timeout safeguard to prevent hanging the UI
        console.log('[Lyra] Querying server API for subtitles for video:', videoId);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4500);
        
        const res = await fetch(`/api/transcript?videoId=${videoId}`, {
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        if (!res.ok) {
          throw new Error('No transcripts returned by server');
        }

        const data = await res.json();
        if (data.error) {
          throw new Error(data.details || 'Subtitle query failed');
        }

        const lyricArray = Array.isArray(data) ? data : (data.lyrics || []);
        lyricsSourceValue = data.source || 'youtube';
        lyricAlts = data.alternatives || [];
        activeTrackId = data.activeTrackId || null;
        
        trackNameValue = data.trackName || '';
        artistNameValue = data.artistName || '';
        videoTitleValue = data.videoTitle || '';

        if (!Array.isArray(lyricArray) || lyricArray.length === 0) {
          throw new Error('Subtitles format is not an array or is empty');
        }

        // Parse and clean subtitles
        lyricLines = lyricArray.map((item: any) => {
          const decodeHtml = (str: string) => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(str, 'text/html');
            return doc.documentElement.textContent || str;
          };
          const text = decodeHtml(item.text || '');
          let start = item.start !== undefined ? item.start : item.offset;
          let duration = item.duration !== undefined ? item.duration : 2.5;

          // Normalize milliseconds to seconds
          if (start > 1000) start /= 1000;
          if (duration > 100) duration /= 1000;

          return { text, start, duration };
        });
      }

      useLyraStore.setState({ 
        trackName: trackNameValue, 
        artistName: artistNameValue,
        videoTitle: videoTitleValue
      });

      setLyrics(lyricLines);
      setOriginalLyrics(lyricLines);
      setLyricsSource(lyricsSourceValue);
      setLyricAlternatives(lyricAlts);
      setActiveLyricTrackId(activeTrackId);

      // Step 3: Color Extraction and Theme Generation
      setLoadingStep('generating-theme');
      try {
        await extractColors(videoId);
      } catch (colorError) {
        console.warn('[Lyra] Color extraction failed (using theme fallback):', colorError);
      }
      await new Promise((resolve) => setTimeout(resolve, 600));

      // Step 4: Finalizing
      setLoadingStep('preparing-player');
      await new Promise((resolve) => setTimeout(resolve, 400));

      // Done! Mount video player
      setVideoId(videoId);
      setLoadingStep('idle');
    } catch (err: any) {
      console.warn('[Lyra] Lyrics acquisition failed, launching player with fallback subtitles:', err);
      const fallbackLyrics = [
        { text: "🎵 [Enjoy the music! Synced lyrics not found, but player loaded successfully]", start: 0, duration: 8 },
        { text: "🎹 [Instrumental Playback]", start: 8, duration: 240 }
      ];
      setLyrics(fallbackLyrics);
      setOriginalLyrics(fallbackLyrics);
      setLyricsSource('local-fallback');
      
      const defaultTitle = videoId ? `YouTube Track (${videoId})` : 'YouTube Video';
      useLyraStore.setState({ 
        trackName: defaultTitle, 
        artistName: 'YouTube Upload',
        videoTitle: defaultTitle
      });

      try {
        await extractColors(videoId);
      } catch (colorError) {
        // Muted color extraction fallback
      }
      
      setVideoId(videoId);
      setLoadingStep('idle');
    }
  }, [extractColors, setVideoUrl, setVideoId, setLyrics, setOriginalLyrics, setLyricsSource, setLyricAlternatives, setActiveLyricTrackId, setLoadingStep, setError, resetStore]);

  return { analyzeSong };
};
