import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";

const sourceDir = join(process.cwd(), "src", "assets", "songs");
const targetDir = join(process.cwd(), "public", "songs");
const playlistFile = join(process.cwd(), "src", "data", "playlist.ts");

function cleanLabel(value) {
  return value
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/\.mp3$/i, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseTrack(filename) {
  let base = filename.replace(/\.mp3$/i, "");
  base = base.replace(/_\(mp3\.pm\)$/i, "");
  base = base.replace(/_OST_FIFA_\d+.*$/i, "");
  base = base.replace(/_FIFA_\d+.*$/i, "");
  base = base.replace(/_Soundtrack.*$/i, "");
  base = base.replace(/_Sountrack.*$/i, "");

  const fifaNumbered = base.match(/^FIFA_\d+_-_\d+\.(.+?)_-_(.+)$/i);
  if (fifaNumbered) {
    return {
      id: slugify(filename),
      title: cleanLabel(fifaNumbered[2]),
      artist: cleanLabel(fifaNumbered[1]),
    };
  }

  const fifaFlat = base.match(/^FIFA_\d+_-_(.+?)_-_(.+)$/i);
  if (fifaFlat) {
    return {
      id: slugify(filename),
      title: cleanLabel(fifaFlat[2]),
      artist: cleanLabel(fifaFlat[1]),
    };
  }

  const split = base.split("_-_");
  if (split.length >= 2) {
    return {
      id: slugify(filename),
      title: cleanLabel(split.slice(1).join(" - ")),
      artist: cleanLabel(split[0]),
    };
  }

  return {
    id: slugify(filename),
    title: cleanLabel(base),
    artist: "FIFA Soundtrack",
  };
}

function escapeString(value) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function writePlaylist(tracks) {
  const lines = tracks.map((track) => {
    const src = `/songs/${encodeURIComponent(track.filename)}`;
    return `  {
    id: "${escapeString(track.id)}",
    title: "${escapeString(track.title)}",
    artist: "${escapeString(track.artist)}",
    src: "${escapeString(src)}",
  }`;
  });

  const contents = `export interface PlaylistTrack {
  id: string;
  title: string;
  artist: string;
  src: string;
}

/** Auto-generated from \`src/assets/songs\` by \`scripts/sync-songs.mjs\`. */
export const playlist: PlaylistTrack[] = [
${lines.join(",\n")},
];
`;

  writeFileSync(playlistFile, contents, "utf8");
}

if (!existsSync(sourceDir)) {
  console.warn(`[sync-songs] Source folder missing: ${sourceDir}`);
  process.exit(0);
}

mkdirSync(targetDir, { recursive: true });

const songs = readdirSync(sourceDir)
  .filter((file) => file.toLowerCase().endsWith(".mp3"))
  .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));

for (const file of songs) {
  cpSync(join(sourceDir, file), join(targetDir, file), { force: true });
}

const tracks = songs.map((filename) => ({
  filename,
  ...parseTrack(filename),
}));

writePlaylist(tracks);

console.log(
  `[sync-songs] Synced ${songs.length} track(s) to public/songs and updated playlist.ts`,
);
