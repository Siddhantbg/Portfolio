import type { AnimationClip, Object3D } from "three";

function collectBoneNames(root: Object3D): Set<string> {
  const names = new Set<string>();
  root.traverse((node) => {
    if (node.type === "Bone" && node.name) {
      names.add(node.name);
    }
  });
  return names;
}

function normalizeBoneName(name: string) {
  return name
    .replace(/^mixamorig:/i, "")
    .replace(/^mixamorig/i, "")
    .trim();
}

function resolveBoneName(trackBone: string, available: Set<string>) {
  if (available.has(trackBone)) return trackBone;

  const normalized = normalizeBoneName(trackBone);
  if (available.has(normalized)) return normalized;

  for (const bone of available) {
    if (bone.toLowerCase() === normalized.toLowerCase()) return bone;
    if (normalizeBoneName(bone) === normalized) return bone;
  }

  return null;
}

/** Safely remap Mixamo/FBX clips onto a GLB skeleton (never throws). */
export function remapClipToModel(
  clip: AnimationClip,
  root: Object3D,
): AnimationClip | null {
  const bones = collectBoneNames(root);
  const remapped = clip.clone();
  remapped.name = clip.name;

  remapped.tracks = clip.tracks
    .map((track) => {
      const dot = track.name.indexOf(".");
      if (dot === -1) return null;

      const trackBone = track.name.slice(0, dot);
      const property = track.name.slice(dot + 1);
      const mapped = resolveBoneName(trackBone, bones);
      if (!mapped) return null;

      const next = track.clone();
      next.name = `${mapped}.${property}`;
      return next;
    })
    .filter((track): track is NonNullable<typeof track> => track !== null);

  return remapped.tracks.length > 0 ? remapped : null;
}

export function buildSafeClips(
  root: Object3D,
  sources: { label: string; animations: AnimationClip[] }[],
): AnimationClip[] {
  const clips: AnimationClip[] = [];

  for (const { label, animations } of sources) {
    animations.forEach((clip, index) => {
      const remapped = remapClipToModel(clip, root);
      if (!remapped) return;
      remapped.name =
        animations.length === 1 ? label : `${label}_${index}`;
      clips.push(remapped);
    });
  }

  return clips;
}
