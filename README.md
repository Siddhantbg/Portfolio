#Inspired Portfolio

A personal portfolio website styled after the FIFA 14 main menu — glassmorphism tiles, slanted navigation tabs, stadium background, and FIFA-style attribute stats.

## Tech Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS v4**
- **Framer Motion** — tile animations and tab transitions
- **Recharts** — skill radar chart on the Attributes tab

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Navigation

| Tab | Content |
|-----|---------|
| **Home** | Intro, education, featured project & career |
| **Career** | Experience, leadership, achievements |
| **Projects** | RAG recommender, AI code review, research papers |
| **Attributes** | FIFA-style stat bars, radar chart, certifications |

Tabs sync to the URL (`/?tab=career`) for bookmarkable links.

## Updating Content

All resume content lives in a single file:

```
src/data/portfolio.ts
```

Edit profile, experience, projects, skills, and certifications there — no PDF parsing at runtime.

## Deploy

Deploy to [Vercel](https://vercel.com) with zero config:

```bash
npm run build
```

Or connect the repo to Vercel for automatic deployments on push.

## Assets

- Stadium background uses a royalty-free Unsplash image via CSS.
- No EA Sports / FIFA trademarks — FIFA-*inspired* personal branding only.

## Project Structure

```
src/
├── app/              # Layout, page, global styles
├── components/
│   ├── layout/       # Header, NavTabs, GameFooter
│   ├── tiles/        # Tile, TileGrid, tab panels
│   └── attributes/   # StatBar, SkillRadar
├── data/
│   └── portfolio.ts  # All portfolio content
└── lib/
    └── cn.ts
```
