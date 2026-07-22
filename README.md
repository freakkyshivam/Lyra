# 🎵 Lyra — Modern YouTube Karaoke Player

![Lyra Banner](https://img.shields.io/badge/Lyra-YouTube%20Karaoke%20Player-purple?style=for-the-badge&logo=youtube)
![React 19](https://img.shields.io/badge/React-19.2.7-61DAFB?style=for-the-badge&logo=react)
![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.3.3-38B2AC?style=for-the-badge&logo=tailwind-css)
![Vite 8](https://img.shields.io/badge/Vite-v8.1.1-646CFF?style=for-the-badge&logo=vite)
![TypeScript](https://img.shields.io/badge/TypeScript-v6.0.2-3178C6?style=for-the-badge&logo=typescript)

**Lyra** is a web-based karaoke player for YouTube. Paste any public YouTube video or music link to extract synchronized lyrics, generate color themes based on album art, and sing along with real-time scrolling subtitles.

---

## ✨ Features

### 🎤 Synchronized Subtitles & Lyrics Engine
* **Multi-Source Fallback Hierarchy:** Automatically searches for lyrics in order:
  1. **YouTube Subtitles / Captions**
  2. **LRCLIB Synced `.lrc` Timed Lyrics** (`https://lrclib.net`)
  3. **LRCLIB Plain Text Lyrics** (with automatic time distribution)
  4. **lyrics.ovh API**
  5. **Simulated Timing Generator**
  6. **Instrumental Playback Fallback**
* **Alternative Track Selector:** Search LRCLIB or select alternative lyrics matches directly from the **Sources** tab.
* **Auto-Scrolling Karaoke:** Lyrics automatically scroll and highlight as the song plays, with full manual click-to-seek support.

### 🎨 Dynamic Canvas Color Extraction
* **Real-time Color Extraction:** Extracts dominant RGB and HSL color palettes directly from video thumbnails using HTML5 Canvas (`useColorExtractor`).
* **Ambient Lighting:** Generates dynamic background radial glows, subtle borders, and color accents tailored to each track's artwork.
* **Timeout Protection:** Built-in 1.5-second timeout safeguards resolve default cinema themes if network image proxies delay.

### 🎶 Playback Queue & Auto-Advance
* **Queue Management:** Queue up to 10 songs with background pre-buffering (pre-fetches lyrics, colors, and titles).
* **Auto-Next:** When a video finishes playing (`ended` state), the player shifts the next track from the queue and starts playing instantly.
* **Missing Lyrics Handling:** If a song lacks online lyrics, Lyra fetches the YouTube title (via oEmbed fallback) and queues it seamlessly with instrumental captions.

### 🔗 Persistent URL Routing
* **Session Recovery:** Active song IDs sync with the browser address bar query parameter (`?v=videoId`).
* **Reload Safety:** Refreshing the page recovers the current video, state, and lyrics automatically.

### ⚙️ Customization & Keyboard Shortcuts
* **Theme Selector:** Choose between 7 themes: *Spotify Green*, *Apple Music Red*, *AMOLED Pure Black*, *Cyberpunk Neon*, *Synthwave Purple*, *Ocean Blue*, and *Sunset Orange*.
* **Display Controls:** Customize subtitle font sizing, typography (`sans`, `mono`, `serif`, `outfit`, `inter`), particle density, glow intensity, blur amount, and background brightness.
* **Global Hotkeys:**
  - `Space`: Play / Pause
  - `←` / `→`: Seek 5 Seconds Back / Forward
  - `↑` / `↓`: Volume Up / Down
  - `M`: Mute / Unmute
  - `F`: Fullscreen Toggle

---

## 🛠️ Tech Stack

* **Framework:** React 19 + TypeScript
* **Build Tool & Server Middleware:** Vite 8
* **Styling:** Tailwind CSS v4 (with Vanilla CSS Glassmorphism)
* **State Management:** Zustand 5
* **Animations:** Framer Motion 12
* **Icons:** Lucide React
* **Player:** `react-youtube` (YouTube IFrame Player API)
* **Caption Extractor:** `youtube-transcript`

---

## 🚀 Quick Start

### 1. Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (v18 or higher) installed on your system.

### 2. Installation
Clone the repository and install project dependencies:

```bash
# Clone the repository
git clone https://github.com/your-username/play-youtube-music.git

# Navigate into project directory
cd play-youtube-music

# Install dependencies
npm install
```

### 3. Running Locally
Start the Vite development server:

```bash
npm run dev
```

Open your browser and navigate to `http://localhost:5173`.

---

## 📁 Project Architecture

```
play-youtube-music/
├── src/
│   ├── components/
│   │   ├── BackgroundEffects.tsx  # Ambient floating particles & radial glows
│   │   ├── HeroInput.tsx          # Main YouTube URL input bar
│   │   ├── KaraokeLyrics.tsx      # Auto-scrolling synced lyrics renderer
│   │   ├── KeyboardShortcuts.tsx  # Global key listener & HUD overlay
│   │   ├── LoadingScreen.tsx      # Multi-stage loading transition screen
│   │   ├── LyricsTimeline.tsx     # Bottom timeline progress & playback controls
│   │   ├── SettingsModal.tsx      # Customization & typography settings
│   │   ├── States.tsx             # Home empty state & error displays
│   │   ├── ThemeSelector.tsx      # Color palette & theme manager
│   │   └── YouTubeEmbed.tsx       # YouTube IFrame player & rotating vinyl card
│   ├── hooks/
│   │   ├── useAnalyzeSong.ts      # Main song analysis & fetching orchestrator
│   │   └── useColorExtractor.ts   # Canvas thumbnail color extractor
│   ├── store/
│   │   ├── mockLyrics.ts          # Local fallback mock lyrics data
│   │   └── useLyraStore.ts        # Zustand global application state store
│   ├── App.tsx                    # Core app layout & view router
│   ├── index.css                  # Design tokens & glassmorphism utilities
│   └── main.tsx                   # React entry point
├── vite.config.ts                 # Backend proxy middleware (CORS & transcripts)
├── package.json
└── README.md
```

---

## ⚙️ Backend Middleware & Endpoints

Lyra includes built-in Node.js server middleware configured inside `vite.config.ts`:

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/transcript` | `GET` | Fetches transcripts, oEmbed metadata, and queries LRCLIB for synced `.lrc` files |
| `/api/thumbnail-proxy` | `GET` | Proxies YouTube thumbnail images to bypass CORS canvas tainting for color extraction |

---

## 📜 Scripts

* `npm run dev` — Launch local development server with API middleware
* `npm run build` — Compile TypeScript and build production bundle via Vite
* `npm run preview` — Locally preview the production build
* `npm run lint` — Run Oxlint code linter

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [Issues](../../issues) page.

---

## 👤 Author

Created with ❤️ by **Shivam Chaudhary** for fun.

---

## 📄 License

This project is open-source and available under the **MIT License**.