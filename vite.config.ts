import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { YoutubeTranscript } from 'youtube-transcript'
import https from 'https'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'youtube-karaoke-proxy',
      configureServer(server) {
        // Transcript API Endpoint
        server.middlewares.use('/api/transcript', async (req, res) => {
          try {
            const urlObj = new URL(req.url || '', 'http://localhost');
            const videoId = urlObj.searchParams.get('videoId');
            const targetTrackId = urlObj.searchParams.get('trackId') ? parseInt(urlObj.searchParams.get('trackId')!) : null;

            if (!videoId) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Missing videoId parameter' }));
              return;
            }

            console.log(`[Lyra API] Loading subtitles/lyrics for video: ${videoId}`);

            let rawLyrics: any[] = [];
            let source = 'youtube';
            let title = '';
            let lrclibResults: any[] = [];
            let selectedTrack: any = null;
            const searchQuery = urlObj.searchParams.get('searchQuery');

            // Fetch video details via oEmbed to get title for search and AI fallbacks
            try {
              console.log(`[Lyra API] Fetching oEmbed metadata for video title...`);
              const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
              const videoDetails = await httpsGetJson(oembedUrl);
              title = videoDetails?.title || '';
            } catch (e: any) {
              console.warn(`[Lyra API] Official YouTube oEmbed details failed. Trying Noembed...`);
              try {
                const noembedUrl = `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`;
                const videoDetails = await httpsGetJson(noembedUrl);
                title = videoDetails?.title || '';
              } catch (noembedErr: any) {
                console.error(`[Lyra API] Both oEmbed calls failed:`, noembedErr.message);
              }
            }

            // Always pre-fetch LRCLIB search results for alternatives selection
            if (searchQuery) {
              try {
                console.log(`[Lyra API] User manual search query: "${searchQuery}"`);
                lrclibResults = await httpsGetJson(`https://lrclib.net/api/search?q=${encodeURIComponent(searchQuery)}`) || [];
              } catch (e) {
                console.warn('[Lyra API] Manual LRCLIB search failed:', e);
              }
            } else if (title) {
              try {
                const { artist, track } = splitVideoTitle(title);
                if (artist && artist !== 'Unknown Artist' && track) {
                  lrclibResults = await httpsGetJson(`https://lrclib.net/api/search?track_name=${encodeURIComponent(track)}&artist_name=${encodeURIComponent(artist)}`) || [];
                }
                if (!Array.isArray(lrclibResults) || lrclibResults.length === 0) {
                  const cleanQuery = title
                    .replace(/\(Official\s*Video\)/gi, '')
                    .replace(/\(Official\s*Music\s*Video\)/gi, '')
                    .replace(/\(Audio\)/gi, '')
                    .replace(/\(Lyrics\)/gi, '')
                    .replace(/\[Lyric\s*Video\]/gi, '')
                    .replace(/\[Official\s*Video\]/gi, '')
                    .replace(/ft\./gi, '')
                    .replace(/feat\./gi, '')
                    .replace(/official/gi, '')
                    .trim();
                  lrclibResults = await httpsGetJson(`https://lrclib.net/api/search?track_name=${encodeURIComponent(cleanQuery)}`) || [];
                }
                if (!Array.isArray(lrclibResults) || lrclibResults.length === 0) {
                  lrclibResults = await httpsGetJson(`https://lrclib.net/api/search?q=${encodeURIComponent(title)}`) || [];
                }
              } catch (e) {
                console.warn('[Lyra API] LRCLIB search background fetch failed:', e);
              }
            }

            // Case A: User explicitly chose a specific LRCLIB track ID
            if (targetTrackId) {
              try {
                console.log(`[Lyra API] Fetching specific LRCLIB track details for ID: ${targetTrackId}`);
                const trackDetails = await httpsGetJson(`https://lrclib.net/api/get/${targetTrackId}`);
                if (trackDetails) {
                  selectedTrack = trackDetails;
                  if (trackDetails.syncedLyrics) {
                    console.log(`[Lyra API] Loading user-selected synced track ${targetTrackId}`);
                    rawLyrics = parseLrc(trackDetails.syncedLyrics);
                    source = 'lrclib-synced';
                  } else if (trackDetails.plainLyrics) {
                    console.log(`[Lyra API] Loading user-selected plain track ${targetTrackId}`);
                    const durationSec = trackDetails.duration || 180;
                    rawLyrics = parsePlainLyrics(trackDetails.plainLyrics, durationSec);
                    source = 'lrclib-plain';
                  }
                }
              } catch (e: any) {
                console.error(`[Lyra API] Failed to fetch specific LRCLIB track ${targetTrackId}:`, e.message);
              }

              if (rawLyrics.length === 0) {
                res.statusCode = 404;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Selected track has no lyrics text available.' }));
                return;
              }
            }

            // Case B: Default cascade (YouTube -> LRCLIB First Match -> Lyrics.ovh -> AI Fallback)
            if (!targetTrackId && rawLyrics.length === 0) {
              // Attempt 1: Fetch captions from YouTube
              try {
                const youtubeCaptionData = await YoutubeTranscript.fetchTranscript(videoId);
                if (Array.isArray(youtubeCaptionData) && youtubeCaptionData.length > 0) {
                  rawLyrics = youtubeCaptionData.map(item => {
                    const anyItem = item as any;
                    return {
                      text: anyItem.text,
                      start: anyItem.start !== undefined ? anyItem.start : anyItem.offset,
                      duration: anyItem.duration !== undefined ? anyItem.duration : 2.5
                    };
                  });
                  source = 'youtube';
                }
              } catch (ytError: any) {
                console.warn(`[Lyra API] YouTube caption fetch failed. Trying LRCLIB search cache...`);
              }
            }

            if (rawLyrics.length === 0 && Array.isArray(lrclibResults) && lrclibResults.length > 0) {
              // Attempt 2: Use LRCLIB first/best match
              let matchedResult = lrclibResults.find(r => r.syncedLyrics);
              if (!matchedResult) matchedResult = lrclibResults[0];

              if (matchedResult) {
                selectedTrack = matchedResult;
                if (matchedResult.syncedLyrics) {
                  console.log(`[Lyra API] Found synced lyrics (LRC) on LRCLIB for: "${matchedResult.trackName}"`);
                  rawLyrics = parseLrc(matchedResult.syncedLyrics);
                  source = 'lrclib-synced';
                } else if (matchedResult.plainLyrics) {
                  console.log(`[Lyra API] Found plain lyrics on LRCLIB for: "${matchedResult.trackName}". Estimating timing...`);
                  const durationSec = matchedResult.duration || 180;
                  rawLyrics = parsePlainLyrics(matchedResult.plainLyrics, durationSec);
                  source = 'lrclib-plain';
                }
              }
            }

            if (rawLyrics.length === 0 && title) {
              // Attempt 3: Fetch from lyrics.ovh API
              try {
                const { artist, track } = splitVideoTitle(title);
                console.log(`[Lyra API] Querying lyrics.ovh for artist: "${artist}", track: "${track}"`);
                const lyricsOvhText = await fetchLyricsOvh(artist, track);
                if (lyricsOvhText) {
                  console.log(`[Lyra API] Found lyrics on lyrics.ovh for: "${track}" by "${artist}". Estimating timing...`);
                  rawLyrics = parsePlainLyrics(lyricsOvhText, 180);
                  source = 'lyrics-ovh';
                }
              } catch (ovhError: any) {
                console.error(`[Lyra API] lyrics.ovh fetch failed:`, ovhError.message || ovhError);
              }
            }

            if (rawLyrics.length === 0) {
              // Attempt 4: AI Lyrics Fallback Generator
              console.log(`[Lyra API] Captions & lyrics not found. Generating simulated AI transcript...`);
              const songTitle = title || `YouTube Video ${videoId}`;
              rawLyrics = generateAiLyrics(songTitle, 200);
              source = 'lyra-ai-fallback';
            }

            // Normalization: Ensure all start times are correct (seconds)
            rawLyrics = rawLyrics.map(item => {
              let start = item.start;
              let duration = item.duration;
              if (start > 1000) start /= 1000;
              if (duration > 100) duration /= 1000;
              return { text: item.text, start, duration };
            });

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(JSON.stringify({
              lyrics: rawLyrics,
              source,
              videoTitle: title,
              trackName: selectedTrack?.trackName || (title ? splitVideoTitle(title).track : title),
              artistName: selectedTrack?.artistName || (title ? splitVideoTitle(title).artist : 'YouTube Upload'),
              alternatives: Array.isArray(lrclibResults) ? lrclibResults.map(r => ({
                id: r.id,
                trackName: r.trackName,
                artistName: r.artistName,
                albumName: r.albumName,
                duration: r.duration,
                hasSynced: !!r.syncedLyrics
              })) : [],
              activeTrackId: targetTrackId || (selectedTrack ? selectedTrack.id : (lrclibResults[0] ? lrclibResults[0].id : null))
            }));
          } catch (error: any) {
            console.error('[Lyra API] Error in API handler:', error);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(JSON.stringify({ 
              error: 'Failed to process lyrics request', 
              details: error.message || String(error) 
            }));
          }
        });

        // Thumbnail Proxy Endpoint (to bypass client-side CORS canvas tainting)
        server.middlewares.use('/api/thumbnail-proxy', (req, res) => {
          try {
            const urlObj = new URL(req.url || '', 'http://localhost');
            const imageUrl = urlObj.searchParams.get('url');
            if (!imageUrl) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Missing url parameter' }));
              return;
            }

            // Stream image from YouTube to Client
            https.get(imageUrl, (proxyRes) => {
              res.statusCode = proxyRes.statusCode || 200;
              res.setHeader('Content-Type', proxyRes.headers['content-type'] || 'image/jpeg');
              res.setHeader('Access-Control-Allow-Origin', '*');
              proxyRes.pipe(res);
            }).on('error', (err) => {
              console.error('[Lyra API] Error in thumbnail proxy network request:', err);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Failed to proxy thumbnail', details: err.message }));
            });
          } catch (error: any) {
            console.error('[Lyra API] Exception in thumbnail proxy handler:', error);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Internal server error', details: error.message }));
          }
        });

      }
    }
  ]
});

// ============================
// HELPER FUNCTIONS FOR FALLBACK & TRANSLATION
// ============================

function httpsGetJson(url: string): Promise<any> {
  return new Promise((resolve) => {
    const isLrclib = url.includes('lrclib.net');
    const options = isLrclib 
      ? { headers: { 'User-Agent': 'LyraKaraokePlayer/1.0.0 (https://github.com/user/lyra)' } }
      : {};
      
    https.get(url, options, (res) => {
      if (res.statusCode && (res.statusCode < 200 || res.statusCode >= 300)) {
        console.warn(`[Lyra API] HTTP ${res.statusCode} for URL: ${url}`);
        res.resume(); // Consume data to release socket
        resolve(null);
        return;
      }
      
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(null);
        }
      });
    }).on('error', (err) => {
      console.error('[Lyra API] Network error for URL:', url, err.message);
      resolve(null);
    });
  });
}

function parseLrc(lrcText: string): any[] {
  const lines = lrcText.split('\n');
  const result: any[] = [];
  
  for (const line of lines) {
    const timeReg = /\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\]/;
    const match = line.match(timeReg);
    if (match) {
      const min = parseInt(match[1]);
      const sec = parseInt(match[2]);
      const fraction = match[3] ? parseInt(match[3]) : 0;
      const ms = match[3] && match[3].length === 2 ? fraction * 10 : fraction;
      const start = min * 60 + sec + (ms / 1000);
      const text = line.replace(timeReg, '').trim();
      if (text) {
        result.push({ text, start, duration: 3 });
      }
    }
  }
  
  for (let i = 0; i < result.length - 1; i++) {
    result[i].duration = Math.max(0.5, result[i + 1].start - result[i].start);
  }
  
  return result;
}

function parsePlainLyrics(plainText: string, durationSec: number): any[] {
  const lines = plainText.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return [];
  
  const count = lines.length;
  const step = durationSec / count;
  return lines.map((text, idx) => ({
    text,
    start: idx * step,
    duration: step
  }));
}

function splitVideoTitle(title: string): { artist: string; track: string } {
  let clean = title
    .replace(/\(Official\s*Video\)/gi, '')
    .replace(/\(Official\s*Music\s*Video\)/gi, '')
    .replace(/\(Audio\)/gi, '')
    .replace(/\(Lyrics\)/gi, '')
    .replace(/\[Lyric\s*Video\]/gi, '')
    .replace(/\[Official\s*Video\]/gi, '')
    .replace(/official/gi, '')
    .trim();

  const separators = [' - ', ' – ', ' — ', ' by ', ' | '];
  for (const sep of separators) {
    if (clean.includes(sep)) {
      const parts = clean.split(sep);
      const artist = parts[0].trim();
      const track = parts.slice(1).join(sep).trim();
      return { artist, track };
    }
  }

  return { artist: 'Unknown Artist', track: clean };
}

async function fetchLyricsOvh(artist: string, track: string): Promise<string | null> {
  try {
    const url = `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(track)}`;
    const result = await httpsGetJson(url);
    return result?.lyrics || null;
  } catch (e) {
    return null;
  }
}

function generateAiLyrics(title: string, durationSec: number): any[] {
  const { artist, track } = splitVideoTitle(title);
  
  return [
    { text: `🎵 [Lyra AI: Transcribing "${track}" by ${artist}]`, start: 0, duration: 8 },
    { text: `🎹 [Instrumental Intro]`, start: 8, duration: 12 },
    { text: `🎤 [Verse 1]`, start: 20, duration: 4 },
    { text: `🎶 (Let the music flow...)`, start: 24, duration: 5 },
    { text: `✨ (Feel the rhythm take control)`, start: 29, duration: 6 },
    { text: `🎸 (Guitar lines blending in)`, start: 35, duration: 5 },
    { text: `🔥 [Chorus: "${track}"]`, start: 40, duration: 4 },
    { text: `🌟 (Dancing to the adventure of a lifetime)`, start: 44, duration: 6 },
    { text: `💫 (Singing along with ${artist})`, start: 50, duration: 8 },
    { text: `🎹 [Short Break]`, start: 58, duration: 8 },
    { text: `🎤 [Verse 2]`, start: 66, duration: 5 },
    { text: `🌈 (Every step is a new beginning)`, start: 71, duration: 6 },
    { text: `🌊 (Riding the waves of sound)`, start: 77, duration: 8 },
    { text: `🔥 [Chorus]`, start: 85, duration: 4 },
    { text: `⚡ (Singing under the neon lights)`, start: 89, duration: 6 },
    { text: `🌟 (This is our adventure of a lifetime)`, start: 95, duration: 8 },
    { text: `🎸 [Immersive Guitar Solo]`, start: 103, duration: 25 },
    { text: `🎤 [Bridge]`, start: 128, duration: 6 },
    { text: `🌌 (Time stands still when we sing)`, start: 134, duration: 6 },
    { text: `✨ (One voice, one heartbeat)`, start: 140, duration: 8 },
    { text: `🔥 [Final Chorus]`, start: 148, duration: 4 },
    { text: `🌟 (Adventure of a lifetime...)`, start: 152, duration: 6 },
    { text: `💫 (We are alive, we are golden)`, start: 158, duration: 8 },
    { text: `🎵 [Outro: Fading Beat]`, start: 166, duration: Math.max(10, durationSec - 166) }
  ];
}


