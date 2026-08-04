# KNOW ME · Cyber City — scene context (updated Aug 2026)

> **For the next developer / agent:** start from this file when continuing the Know Me 3D explorer.
> Do **not** reintroduce the old night village, soccer ball, stones, Kakariko map, or walking avatar.

---

## What just shipped (this chat)

A **full scrape + rebuild** of the Know Me 3D experience:

1. **Welcome splash** (black screen) → **EXPLORE MY WORLD →** → **fullscreen cyber city game**
2. **New map / cast / traffic** from user drop folder `models_new/` (source only; runtime uses `public/models/knowme/*.glb`)
3. Design polish on Home (glass tiles, tab blue glow, tile hover border animation)
4. Skills report portal (full viewport overlay) — separate from Know Me

---

## Runtime model paths (committed)

| Role | File on disk | Used as |
|------|----------------|---------|
| City map | `public/models/knowme/cybercity.glb` (~29 MB) | Full playable map |
| MC / Ironman | `public/models/knowme/ironman.glb` (~1.8 MB) | Controllable floating character |
| Black NPC cars | `public/models/knowme/car-koenigsegg.glb` (~12.5 MB) | Tinted black, loop roads |
| White NPC cars | `public/models/knowme/car-sonata.glb` (~4 MB) | Tinted white, loop roads |

**Do not commit** `models_new/` (raw zips + duplicates). Copy any new GLB into `public/models/knowme/` and wire paths in `src/data/knowMeWorld.ts`.

### Source originals (local only)

`D:\Resume projects\Portfolio\models_new\`

- `cybercity_2099_v2.glb` → cybercity
- `iron_cameraman.glb` → ironman
- `2014_koenigsegg_one1_-_patrol.glb` → car-koenigsegg
- `sonata.glb` → car-sonata
- `sci-fi_space_station_interior_pack_modular.glb` — **not used yet**

### Licenses / credits

Shown at bottom of the game via `KNOWME_MAP_CREDIT` in `src/data/knowMeWorld.ts`:

- CyberCity_2099_V2 — Animateria — **CC-BY-4.0**
- Iron Cameraman — Void — **CC-BY-4.0**
- 2014 Koenigsegg One:1 Patrol — Ddiaz Design — **CC-BY-NC-SA-4.0** (personal portfolio OK; no commercial re-use without care)
- sonata — Ch0kitu — **CC-BY-4.0**

---

## Code map (start here to change behaviour)

| File | Responsibility |
|------|----------------|
| `src/data/knowMeWorld.ts` | Paths, fleet config (2 black + 5 white ellipse loops), bounds, fly limits, credits |
| `src/components/knowme/KnowMeWorldScene.tsx` | Three.js: city, Ironman flight + chase cam, NPC traffic |
| `src/components/knowme/KnowMeWorldModal.tsx` | Fullscreen portal, welcome → city, loading HUD, Esc |
| `src/components/knowme/KnowMeTile.tsx` | Home tile entry point |

### Player controls

- **WASD / arrows** — fly relative to chase camera  
- **Space** — altitude up  
- **Shift** (or Ctrl / C) — altitude down  
- **Esc** — map → welcome → close modal  
- Hover bob / sway is **procedural** (Ironman GLB has **no animations**)

### Traffic algorithm

Each entry in `knowMeCars` is an **ellipse** around `(center.x, center.z)` with `radiusX` / `radiusZ`, `speed`, `phase`, `direction` (±1). Cars face their tangent. Paint materials matching chassis/body/door etc. are recolored black/white; glass/tires/lights kept.

### Scene tuning knobs (`knowMeWorld.ts`)

- `CITY_SIZE` — normalize map footprint  
- `CITY_BOUNDS_RADIUS` — player clamp  
- `FLY_MIN_Y` / `FLY_MAX_Y` / `MC_START`  
- `knowMeCars[]` — road loop paths (tune radii if cars float off roads)

---

## Explicitly removed (do not restore unless product asks)

- `map.glb` / Kakariko village walk system  
- `soccer-ball.glb`, `stones.glb`  
- Resume glowing-stone landmarks + Enter-to-GitHub  
- Developer.glb + walking/running FBX as Know Me avatar  
- Old night-world procedural trees/lamps/trees data (replaced by cyber city fleet config)

Career tab still uses `public/models/animations/*` — **do not delete** those.

---

## How to run

```bash
npm install
npm run dev
```

Open Know Me → welcome → **EXPLORE MY WORLD →** → city loads (cybercity is large; expect a few seconds first load).

---

## Suggested next iterations

1. Align car ellipse paths to actual cybercity streets (visually tweak `knowMeCars` radii/centers)  
2. Optional: use unused space-station GLB as an interior zone  
3. Optional: re-add resume landmarks as neon billboards / floating markers without scrap-ping flight feel  
4. Optional: pointer-lock mouse look for freer aerial camera  

---

## Agent instruction

When the user says “Know Me”, “map”, “3D city”, “ironman”, or “cars on the road”:

1. Read **this file** first  
2. Edit only Know Me files listed above + `public/models/knowme/*`  
3. Keep welcome → fullscreen → cybercity flight architecture  
4. Keep NPC fleet as **2 black + 5 white** unless told otherwise  
