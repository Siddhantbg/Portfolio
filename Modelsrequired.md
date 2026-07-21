# Models Required — Know Me · Night World

Everything currently in the world is **procedural or already in the repo**, so the game
works with zero downloads. The models below are *optional upgrades* — add any of them,
tell me, and I'll wire them into the scene.

> **Format rule:** every model must be **`.glb`** (animations may be **`.fbx`** from Mixamo).
> Keep each file under ~5 MB where possible so the loading circle stays fast.

---

## 0. Environment map — ✅ DELIVERED

**Done!** Kakariko Village (Ocarina of Time) by XanderPriest281 is converted to
`public/models/knowme/map.glb` and wired into the world with terrain-following
movement. Attribution (required by its CC-BY-4.0 license) is shown in-game and kept
in `public/models/knowme/map-license.txt`.

> Note: `etihad_stadium.zip` was also found in the models folder but it's **64 MB —
> way too heavy** for a web loading screen. It has not been used and zips are now
> git-ignored. If you want a stadium in the world, bring a low-poly one under ~20 MB.

The original spec, if you ever want to swap the map:

| File to add | Put it exactly here |
|---|---|
| `map.glb` | `public/models/knowme/map.glb` |

**What to look for when choosing it:**

- **Style:** low-poly / stylized (flat-shaded), NOT realistic — must match the toon look
- **Shape:** a roughly circular or square island/park/village terrain with a **large flat
  walkable middle** (I need open ground to place your avatar, the name text, and the
  6 resume stones — heavy props only around the edges is ideal)
- **Content:** terrain + trees + props baked in is fine (bridges, houses, rivers all good)
- **Single file:** one `.glb` with textures embedded (when downloading from Sketchfab,
  choose the **glTF** format download — it includes textures)
- **Size:** ideally **under 20 MB** — anything bigger makes the loading circle crawl
- **License:** CC0 or CC-BY (downloadable badge on Sketchfab)

**Where to search (free):**

- [Sketchfab](https://sketchfab.com/search?features=downloadable&licenses=322a749bcfa841b29dff1e8a1bb74b0b&licenses=b9ddc40b93e34cdca1fc152f39b9f375&type=models) — filter *Downloadable*; search terms that work well:
  `"low poly island"`, `"stylized island"`, `"low poly village night"`, `"low poly park diorama"`
- [Quaternius](https://quaternius.com/) — packs are individual props, but some include demo scenes
- [Kenney Nature Kit](https://kenney.nl/assets/nature-kit) — sample scenes included

**After you drop it in:** ping me — I'll load it, scale it to the world, position the
spawn/name/stones on its flat area, align the walk boundary to its edges, and remove
whichever procedural pieces it replaces.

---

## 1. Character animations — ✅ DELIVERED

**Done!** Your `Walking.fbx` and `Running.fbx` were moved to
`public/models/animations/` and wired up: the avatar now idles when still, walks when
moving, and breaks into a run at high speed (animation speed scales with movement).

## 2. Village props (Bruno-Simon vibe)

These replace my procedural boxes (fences/crates) and add the props from your
reference image (bridge, well, signpost).

| File to add | Put it exactly here | Suggested source (all free) |
|---|---|---|
| `bridge.glb` | `public/models/knowme/props/bridge.glb` | [Quaternius Ultimate Nature Pack](https://quaternius.com/packs/ultimatenature.html) or [Kenney Nature Kit](https://kenney.nl/assets/nature-kit) |
| `house.glb` | `public/models/knowme/props/house.glb` | [Quaternius Ultimate Buildings](https://quaternius.com/) or Kenney |
| `well.glb` | `public/models/knowme/props/well.glb` | Kenney Nature Kit |
| `signpost.glb` | `public/models/knowme/props/signpost.glb` | Kenney Nature Kit ("sign" models) |
| `fence.glb` | `public/models/knowme/props/fence.glb` | Kenney Nature Kit |
| `crate.glb` | `public/models/knowme/props/crate.glb` | Kenney or Quaternius |

## 3. Better trees & rocks (optional)

My trees are procedural blobs and the landmark rocks are procedural standing stones
(the old `stones.glb` meshes had baked-in rotations that made them lie flat, so they
were replaced). Proper low-poly models would look closer to the reference.

| File to add | Put it exactly here | Suggested source |
|---|---|---|
| `tree-pink.glb` | `public/models/knowme/props/tree-pink.glb` | Quaternius Ultimate Nature Pack (recolour not needed — I can tint it pink in code) |
| `rock.glb` | `public/models/knowme/props/rock.glb` | Kenney Nature Kit or Quaternius — pick a **standing/upright** rock, exported with Y-up so it sits on the ground correctly |

## 4. Vehicle (only if you want drive mode later)

| File to add | Put it exactly here | Suggested source |
|---|---|---|
| `car.glb` | `public/models/knowme/props/car.glb` | [Quaternius Cars pack](https://quaternius.com/packs/cars.html) — pick the truck/jeep for the Bruno look |

---

### After adding files

1. Drop the file(s) into the exact paths above (create the `props` folder if needed).
2. Ping me with which ones you added — I'll load, scale, and place them in the world
   and remove the corresponding procedural stand-ins.

### License notes

- **Kenney.nl** assets: CC0 (public domain) — safe for a public portfolio.
- **Quaternius** packs: CC0 — safe.
- **Mixamo** animations: free with an Adobe account, allowed in personal projects.
