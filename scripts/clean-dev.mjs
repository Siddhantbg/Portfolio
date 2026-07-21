import { rmSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const targets = [".next", join("node_modules", ".cache")];

for (const target of targets) {
  try {
    rmSync(join(root, target), { recursive: true, force: true });
    console.log(`[clean-dev] Removed ${target}`);
  } catch {
    console.warn(`[clean-dev] Could not remove ${target}`);
  }
}
