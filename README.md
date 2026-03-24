# 🌸 LumiBooth — Photo Strip Booth

A soft, aesthetic photo strip booth built with Next.js. Inspired by Korean photo booth culture, LumiBooth lets you capture beautiful moments, decorate them with stickers, choose a strip theme, and download a polished photo strip.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How It Works

LumiBooth walks you through 3 steps:

**Step 1 — Choose your strip format**
Pick from 4 layouts:
- **Single** — one large landscape photo
- **3 Strip** — 3 photos in a tall vertical strip
- **4 Strip** — 4 photos, the classic photo booth layout (default)
- **2 × 2 Grid** — 4 photos arranged in a square grid

**Step 2 — Camera**
- A 3-second countdown fires before each shot
- Live filter preview on the camera feed
- Mirror toggle for selfies
- Shot progress dots track each capture
- Strip preview panel updates in real time as photos are taken

**Step 3 — Design & Download**
- Preview your strip exactly as it will appear when downloaded
- Drag emoji stickers onto any photo — double-tap to remove
- Choose from 13 strip themes (Blossom, Midnight, Meadow, Honey, Aurora, Peach, Ocean, Noir, Cherry, Matcha, Lavender, Sunset, White)
- Themes scroll in a vertical carousel (3 per row)
- Download your finished strip as a JPEG — filters, stickers, and theme all baked in

## Features

- 🌸 4 strip formats — Single, 3-Strip, 4-Strip, 2×2 Grid
- 🎨 8 live camera filters — Natural, Soft, Bloom, Mono, Azure, Honey, Film, Vivid
- 🎉 Draggable emoji stickers with 28 options
- 🖼️ 13 downloadable strip themes
- 💾 One-click JPEG download with everything composited via Canvas
- 🪞 Mirror toggle
- 🌸 Petal burst celebration after shooting
- 📱 Fully responsive — desktop, tablet, and mobile

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Canvas API** — photo capture, filter baking, strip composition
- **Pointer Events API** — sticker drag and drop
- **MediaDevices API** — camera access

## Customisation

- **Add themes** — extend the `THEMES` array in `ReviewScreen.tsx`
- **Add filters** — extend the `FILTERS` array in `CameraScreen.tsx`
- **Add stickers** — extend `STICKER_EMOJIS` in `ReviewScreen.tsx`
- **Change default strip** — edit `useState<StripType>('strip4')` in `app/page.tsx`
- **Change default theme** — edit `useState<string>('blossom')` in `ReviewScreen.tsx`
