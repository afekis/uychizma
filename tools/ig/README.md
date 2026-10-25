# UyChizma Instagram vositalari (media branch)

Talab: Node + Playwright (Chromium), ffmpeg. Sayt kodi uchun main branch klonini alohida oching (bu yerga emas).

1. `node plans.js configs.json plans.json /path/to/uychizma-main` — saytdagi `buildVariants`/`planSVG` orqali haqiqiy rejalar (maydon, yotoqxona, qavat, gabarit, SVG).
2. `node post.js specs.json outDir` — feed post, 1080×1350 JPEG (to'q ko'k uslub).
3. `node reel.js spec.json out.mp4` — Reel, 1080×1920 MP4, 12–18 s. `spec.style` — 6 xil kreativ shablon (faylning boshida tavsifi bor): `klassik` (jigarrang + quruvchi personaj), `chizma` (blueprint), `quiz` (A/B/C variant), `tur` (xonalar bo'ylab zoom), `fakt` (kinetik matn), `yer` (bo'sh yer → uy). Ketma-ket bir xil shablonni takrorlamang.
4. `node story.js specs.json outDir` — Story, 1080×1920 JPEG (reja / savol / maslahat); `theme`: klassik | chizma | quiz | tur | fakt | yer.

Fayllar: `ig/` (post), `ig/reels/` (mp4), `ig/stories/` (jpg). Manzil: `https://raw.githubusercontent.com/afekis/uychizma/media/<yo'l>`.
