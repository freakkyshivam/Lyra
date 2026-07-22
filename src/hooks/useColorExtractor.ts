import { useCallback } from 'react';
import { useLyraStore } from '../store/useLyraStore';
import type { DominantColors } from '../store/useLyraStore';

// Color space conversion helper functions
function rgbToHsl(r: number, g: number, b: number) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToHex(h: number, s: number, l: number) {
  h /= 360;
  s /= 100;
  l /= 100;
  let r = l;
  let g = l;
  let b = l;

  if (s !== 0) {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Pure JS function for color extraction (usable outside React context)
export function extractDominantColors(videoId: string): Promise<DominantColors> {
  return new Promise((resolve) => {
    // 1.5-second timeout safeguard to prevent the loader screen from hanging
    const timeoutTimer = setTimeout(() => {
      console.warn('[Lyra Color Extractor] Timeout reached. Resolving default cinema colors.');
      resolve({
        primary: '#0a0a0e',
        secondary: '#1d1135',
        accent: '#a855f7',
        glow: 'rgba(168, 85, 247, 0.5)'
      });
    }, 1500);

    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    const proxyUrl = `/api/thumbnail-proxy?url=${encodeURIComponent(thumbnailUrl)}`;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = proxyUrl;

    img.onload = () => {
      clearTimeout(timeoutTimer);
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Could not get canvas context');
        }

        const width = 64;
        const height = 48;
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        const imgData = ctx.getImageData(0, 0, width, height);
        const data = imgData.data;

        const colorMap: { [key: string]: number } = {};
        let totalR = 0, totalG = 0, totalB = 0;
        let validPixelCount = 0;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];

          if (a < 128) continue;

          totalR += r;
          totalG += g;
          totalB += b;
          validPixelCount++;

          const rBin = Math.round(r / 24) * 24;
          const gBin = Math.round(g / 24) * 24;
          const bBin = Math.round(b / 24) * 24;
          const binKey = `${rBin},${gBin},${bBin}`;
          colorMap[binKey] = (colorMap[binKey] || 0) + 1;
        }

        if (validPixelCount === 0) {
          throw new Error('No valid pixels found in image');
        }

        const sortedColors = Object.entries(colorMap)
          .sort((a, b) => b[1] - a[1])
          .map(([key]) => key.split(',').map(Number));

        const avgR = Math.floor(totalR / validPixelCount);
        const avgG = Math.floor(totalG / validPixelCount);
        const avgB = Math.floor(totalB / validPixelCount);

        let accent = sortedColors[0] || [avgR, avgG, avgB];
        for (const color of sortedColors) {
          const [r, g, b] = color;
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const saturation = max - min;

          if (saturation > 40 && max > 60 && max < 220) {
            accent = color;
            break;
          }
        }

        const primaryHSL = rgbToHsl(avgR, avgG, avgB);
        const primaryHex = hslToHex(primaryHSL.h, Math.max(25, primaryHSL.s * 0.7), 6);

        const accentHSL = rgbToHsl(accent[0], accent[1], accent[2]);
        const accentHex = hslToHex(accentHSL.h, Math.max(80, accentHSL.s), Math.max(50, Math.min(75, accentHSL.l)));

        const secondaryHex = hslToHex(accentHSL.h, Math.max(40, accentHSL.s * 0.5), 18);
        const glowString = `rgba(${accent[0]}, ${accent[1]}, ${accent[2]}, 0.5)`;

        const result: DominantColors = {
          primary: primaryHex,
          secondary: secondaryHex,
          accent: accentHex,
          glow: glowString,
        };

        resolve(result);
      } catch (err) {
        // Fallback on parsing exceptions
        resolve({
          primary: '#0a0a0e',
          secondary: '#1d1135',
          accent: '#a855f7',
          glow: 'rgba(168, 85, 247, 0.5)'
        });
      }
    };

    img.onerror = () => {
      clearTimeout(timeoutTimer);
      resolve({
        primary: '#0a0a0e',
        secondary: '#1d1135',
        accent: '#a855f7',
        glow: 'rgba(168, 85, 247, 0.5)'
      });
    };
  });
}

export const useColorExtractor = () => {
  const setDominantColors = useLyraStore((state) => state.setDominantColors);

  const extractColors = useCallback(async (videoId: string): Promise<DominantColors> => {
    try {
      const colors = await extractDominantColors(videoId);
      setDominantColors(colors);
      return colors;
    } catch (err) {
      throw err;
    }
  }, [setDominantColors]);

  return { extractColors };
};
