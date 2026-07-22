import React, { useEffect, useState, useRef } from 'react';
import { useLyraStore } from '../store/useLyraStore';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

export const BackgroundEffects: React.FC = () => {
  const theme = useLyraStore((state) => state.theme);
  const dominantColors = useLyraStore((state) => state.dominantColors);
  const settings = useLyraStore((state) => state.settings);
  const playbackState = useLyraStore((state) => state.playbackState);

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState<Particle[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse parallax movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const { clientWidth, clientHeight } = containerRef.current;
      // Calculate position relative to center (-0.5 to 0.5)
      const x = (e.clientX / clientWidth) - 0.5;
      const y = (e.clientY / clientHeight) - 0.5;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Generate particles based on settings.particleDensity
  useEffect(() => {
    const count = Math.floor((settings.particleDensity / 100) * 80);
    const newParticles: Particle[] = Array.from({ length: count }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // percentage
      y: Math.random() * 100, // percentage
      size: Math.random() * 4 + 2, // 2px to 6px
      duration: Math.random() * 20 + 15, // 15s to 35s
      delay: Math.random() * -20, // Negative delay to prevent all starting at once
      opacity: Math.random() * 0.4 + 0.1,
    }));
    setParticles(newParticles);
  }, [settings.particleDensity]);

  // Determine colors based on active state:
  // If dominant colors are extracted, we use them. Otherwise we fall back to preset themes.
  const getBackgroundStyles = () => {
    const brightness = settings.backgroundBrightness / 100;
    const opacityStyle = { opacity: brightness };

    if (dominantColors) {
      const { primary, secondary, accent } = dominantColors;
      return {
        bg: { backgroundColor: primary },
        glows: (
          <div className="absolute inset-0 overflow-hidden pointer-events-none" style={opacityStyle}>
            <div
              className="absolute w-[60vw] h-[60vw] rounded-full filter blur-[120px] mix-blend-screen transition-transform duration-1000 ease-out"
              style={{
                background: `radial-gradient(circle, ${accent} 0%, rgba(0,0,0,0) 70%)`,
                left: '10%',
                top: '-10%',
                transform: `translate(${mousePosition.x * 50}px, ${mousePosition.y * 50}px)`,
                opacity: 0.18 * (settings.glowIntensity / 5),
              }}
            />
            <div
              className="absolute w-[50vw] h-[50vw] rounded-full filter blur-[100px] mix-blend-screen transition-transform duration-1000 ease-out"
              style={{
                background: `radial-gradient(circle, ${secondary} 0%, rgba(0,0,0,0) 70%)`,
                right: '15%',
                bottom: '-10%',
                transform: `translate(${mousePosition.x * -40}px, ${mousePosition.y * -40}px)`,
                opacity: 0.22 * (settings.glowIntensity / 5),
              }}
            />
          </div>
        ),
        accentColor: accent,
      };
    }

    // Default themes
    let bgStyle: React.CSSProperties = { backgroundColor: '#050507' };
    let glows: React.ReactNode = null;

    const intensityFactor = settings.glowIntensity / 5;

    switch (theme) {
      case 'spotify':
        bgStyle = { backgroundColor: '#08080a' };
        glows = (
          <div className="absolute inset-0 overflow-hidden pointer-events-none" style={opacityStyle}>
            <div
              className="absolute w-[45vw] h-[45vw] rounded-full filter blur-[120px] mix-blend-screen transition-transform duration-700 ease-out"
              style={{
                background: 'radial-gradient(circle, rgba(29, 185, 84, 0.15) 0%, rgba(0,0,0,0) 70%)',
                left: '20%',
                top: '-10%',
                transform: `translate(${mousePosition.x * 30}px, ${mousePosition.y * 30}px)`,
                opacity: intensityFactor,
              }}
            />
          </div>
        );
        break;
      case 'apple':
        bgStyle = { backgroundColor: '#0a050d' };
        glows = (
          <div className="absolute inset-0 overflow-hidden pointer-events-none" style={opacityStyle}>
            <div
              className="absolute w-[55vw] h-[55vw] rounded-full filter blur-[120px] mix-blend-screen transition-transform duration-700 ease-out"
              style={{
                background: 'radial-gradient(circle, rgba(252, 60, 68, 0.1) 0%, rgba(0,0,0,0) 75%)',
                right: '10%',
                top: '-10%',
                transform: `translate(${mousePosition.x * 40}px, ${mousePosition.y * 40}px)`,
                opacity: intensityFactor,
              }}
            />
            <div
              className="absolute w-[45vw] h-[45vw] rounded-full filter blur-[100px] mix-blend-screen transition-transform duration-700 ease-out"
              style={{
                background: 'radial-gradient(circle, rgba(155, 0, 232, 0.12) 0%, rgba(0,0,0,0) 70%)',
                left: '10%',
                bottom: '0%',
                transform: `translate(${mousePosition.x * -20}px, ${mousePosition.y * -20}px)`,
                opacity: intensityFactor,
              }}
            />
          </div>
        );
        break;
      case 'amoled':
        bgStyle = { backgroundColor: '#000000' };
        glows = null;
        break;
      case 'cyberpunk':
        bgStyle = { backgroundColor: '#07020d' };
        glows = (
          <div className="absolute inset-0 overflow-hidden pointer-events-none" style={opacityStyle}>
            <div
              className="absolute w-[50vw] h-[50vw] rounded-full filter blur-[120px] mix-blend-screen transition-transform duration-700 ease-out"
              style={{
                background: 'radial-gradient(circle, rgba(0, 240, 255, 0.14) 0%, rgba(0,0,0,0) 70%)',
                left: '5%',
                top: '-5%',
                transform: `translate(${mousePosition.x * 40}px, ${mousePosition.y * 40}px)`,
                opacity: intensityFactor,
              }}
            />
            <div
              className="absolute w-[45vw] h-[45vw] rounded-full filter blur-[110px] mix-blend-screen transition-transform duration-700 ease-out"
              style={{
                background: 'radial-gradient(circle, rgba(255, 0, 127, 0.12) 0%, rgba(0,0,0,0) 70%)',
                right: '10%',
                bottom: '-5%',
                transform: `translate(${mousePosition.x * -40}px, ${mousePosition.y * -40}px)`,
                opacity: intensityFactor,
              }}
            />
          </div>
        );
        break;
      case 'synthwave':
        bgStyle = { backgroundColor: '#0c0414' };
        glows = (
          <div className="absolute inset-0 overflow-hidden pointer-events-none" style={opacityStyle}>
            <div
              className="absolute w-[60vw] h-[60vw] rounded-full filter blur-[140px] mix-blend-screen transition-transform duration-700 ease-out"
              style={{
                background: 'radial-gradient(circle, rgba(255, 123, 0, 0.1) 0%, rgba(0,0,0,0) 70%)',
                left: '15%',
                top: '-15%',
                transform: `translate(${mousePosition.x * 35}px, ${mousePosition.y * 35}px)`,
                opacity: intensityFactor,
              }}
            />
            <div
              className="absolute w-[50vw] h-[50vw] rounded-full filter blur-[100px] mix-blend-screen transition-transform duration-700 ease-out"
              style={{
                background: 'radial-gradient(circle, rgba(255, 0, 127, 0.1) 0%, rgba(0,0,0,0) 70%)',
                right: '15%',
                bottom: '10%',
                transform: `translate(${mousePosition.x * -35}px, ${mousePosition.y * -35}px)`,
                opacity: intensityFactor,
              }}
            />
          </div>
        );
        break;
      case 'ocean':
        bgStyle = { backgroundColor: '#020612' };
        glows = (
          <div className="absolute inset-0 overflow-hidden pointer-events-none" style={opacityStyle}>
            <div
              className="absolute w-[50vw] h-[50vw] rounded-full filter blur-[120px] mix-blend-screen transition-transform duration-700 ease-out"
              style={{
                background: 'radial-gradient(circle, rgba(0, 136, 255, 0.15) 0%, rgba(0,0,0,0) 70%)',
                left: '30%',
                top: '-10%',
                transform: `translate(${mousePosition.x * 30}px, ${mousePosition.y * 30}px)`,
                opacity: intensityFactor,
              }}
            />
            <div
              className="absolute w-[40vw] h-[40vw] rounded-full filter blur-[100px] mix-blend-screen transition-transform duration-700 ease-out"
              style={{
                background: 'radial-gradient(circle, rgba(0, 242, 254, 0.1) 0%, rgba(0,0,0,0) 70%)',
                right: '20%',
                bottom: '-10%',
                transform: `translate(${mousePosition.x * -30}px, ${mousePosition.y * -30}px)`,
                opacity: intensityFactor,
              }}
            />
          </div>
        );
        break;
      case 'sunset':
        bgStyle = { backgroundColor: '#0f050b' };
        glows = (
          <div className="absolute inset-0 overflow-hidden pointer-events-none" style={opacityStyle}>
            <div
              className="absolute w-[50vw] h-[50vw] rounded-full filter blur-[120px] mix-blend-screen transition-transform duration-700 ease-out"
              style={{
                background: 'radial-gradient(circle, rgba(255, 51, 102, 0.12) 0%, rgba(0,0,0,0) 70%)',
                left: '10%',
                top: '-10%',
                transform: `translate(${mousePosition.x * 45}px, ${mousePosition.y * 45}px)`,
                opacity: intensityFactor,
              }}
            />
            <div
              className="absolute w-[55vw] h-[55vw] rounded-full filter blur-[110px] mix-blend-screen transition-transform duration-700 ease-out"
              style={{
                background: 'radial-gradient(circle, rgba(255, 153, 0, 0.08) 0%, rgba(0,0,0,0) 70%)',
                right: '10%',
                bottom: '-5%',
                transform: `translate(${mousePosition.x * -45}px, ${mousePosition.y * -45}px)`,
                opacity: intensityFactor,
              }}
            />
          </div>
        );
        break;
    }

    return { bg: bgStyle, glows };
  };

  const styleConfig = getBackgroundStyles();

  // Floating particles animations via standard CSS keyframes
  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-full h-full -z-50 overflow-hidden transition-colors duration-1000 ease-in-out"
      style={styleConfig.bg}
    >
      {/* Dynamic theme/color glows */}
      {styleConfig.glows}

      {/* Grid Pattern overlay (Linear / Arc / Vercel style) */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Floating particles */}
      {settings.particleDensity > 0 && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {particles.map((p) => (
            <div
              key={p.id}
              className="absolute rounded-full bg-white transition-opacity duration-500"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                opacity: playbackState === 'playing' ? p.opacity : p.opacity * 0.5,
                animation: `floatUp ${p.duration}s linear infinite`,
                animationDelay: `${p.delay}s`,
                background: dominantColors ? dominantColors.accent : 'var(--color-accent, #ffffff)',
                boxShadow: `0 0 10px ${dominantColors ? dominantColors.accent : 'var(--color-accent, rgba(255,255,255,0.3))'}`,
              }}
            />
          ))}
        </div>
      )}

      {/* Inject floating keyframe style once */}
      <style>{`
        @keyframes floatUp {
          0% {
            transform: translateY(100vh) translateX(0);
          }
          50% {
            transform: translateY(50vh) translateX(15px);
          }
          100% {
            transform: translateY(-10vh) translateX(-10px);
          }
        }
      `}</style>
    </div>
  );
};
