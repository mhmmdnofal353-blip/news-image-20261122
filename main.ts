// news-image-20261122 — entry program.
// Copies the pre-composed front page (entry.png, shipped in this repo)
// into $MAKEFUN_OUTPUT_DIR/entry.png, after checking the file really is
// a JPEG or PNG and that the copy is byte-identical to the original.
// Node 22, standard library only; runs with no network, deterministic:
// the same shipped bytes always produce the same output bytes.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const source = join(here, "entry.png");
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "out";
const target = join(outDir, "entry.png");

const bytes = readFileSync(source);

const isJpeg = bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
const isPng =
  bytes.length > 8 &&
  bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
if (!isJpeg && !isPng) {
  console.error("entry.png is neither a JPEG nor a PNG (bad magic bytes)");
  process.exit(1);
}
if (bytes.length > 1048576) {
  console.error(`entry.png is ${bytes.length} bytes, over the 1 MiB limit`);
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });
writeFileSync(target, bytes);

const written = readFileSync(target);
if (!written.equals(bytes)) {
  console.error("copied entry.png differs from the shipped file");
  process.exit(1);
}

console.log(`wrote ${target} (${bytes.length} bytes, ${isJpeg ? "JPEG" : "PNG"})`);
