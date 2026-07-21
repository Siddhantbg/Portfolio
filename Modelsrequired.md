# Models Required — Know Me · Night World

Everything currently in the world is **procedural or already in the repo**, so the game
works with zero downloads. The models below are *optional upgrades* — add any of them,
tell me, and I'll wire them into the scene.

> **Format rule:** every model must be **`.glb`** (animations may be **`.fbx`** from Mixamo).
> Keep each file under ~5 MB where possible so the loading circle stays fast.

---

## 0. Environment map — THE big one (yes, bring this!)

You asked whether to bring a full map model from the internet: **yes.** A single
environment GLB replaces my procedural grass/paths/trees with a real modelled world
(like Bruno's island) and is the single biggest visual upgrade possible.

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

## 1. Character animations (highest impact)

The avatar currently plays its *idle* animation while walking. A real walk/run cycle
would make movement look dramatically better.

| File to add | Put it exactly here | Where to get it |
|---|---|---|
| `walking.fbx` | `public/models/animations/walking.fbx` | [mixamo.com](https://www.mixamo.com) → search **"Walking"** → download *without skin*, 30 fps |
| `running.fbx` | `public/models/animations/running.fbx` | [mixamo.com](https://www.mixamo.com) → search **"Running"** → download *without skin*, 30 fps |

Mixamo settings when downloading: **Format:** FBX Binary · **Skin:** Without Skin ·
**Frames per Second:** 30 · **Keyframe Reduction:** None.

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
