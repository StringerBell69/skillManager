import { createHash } from "node:crypto";

/**
 * Apply a deterministic, non-destructive watermark to agent content.
 *
 * Strategy:
 * 1. Inserts an invisible HTML comment with a hash derived from the seed.
 * 2. Applies subtle zero-width character variations at deterministic positions
 *    derived from the seed, making each client's copy uniquely traceable.
 *
 * The watermark is stable: calling it twice with the same seed produces the
 * same output. It does not alter the visible rendering.
 */

/** Zero-width characters used for watermarking */
const ZWC = {
  ZWSP: "\u200B", // zero-width space
  ZWNJ: "\u200C", // zero-width non-joiner
  ZWJ: "\u200D",  // zero-width joiner
} as const;

const ZWC_CHARS = [ZWC.ZWSP, ZWC.ZWNJ, ZWC.ZWJ] as const;

/**
 * Generate a deterministic hash from a seed string.
 */
function seedHash(seed: string): string {
  return createHash("sha256").update(seed).digest("hex");
}

/**
 * Encode a hex string into a sequence of zero-width characters.
 * Uses first 16 chars of the hash (64 bits) to create the fingerprint.
 */
function encodeFingerprint(hash: string): string {
  const chars: string[] = [];
  // Use first 16 hex chars → 8 bytes → enough entropy to identify a client
  const slice = hash.slice(0, 16);
  for (const ch of slice) {
    const val = parseInt(ch, 16);
    // Map each hex digit to a ZWC pattern (3 chars → base 3)
    chars.push(ZWC_CHARS[val % 3]!);
    chars.push(ZWC_CHARS[Math.floor(val / 3) % 3]!);
  }
  return chars.join("");
}

/**
 * Determine positions in the content to insert zero-width fingerprint bits.
 * Positions are spread across line endings for minimal disruption.
 */
function getInsertionPositions(content: string, hash: string): number[] {
  const lines = content.split("\n");
  const positions: number[] = [];
  let offset = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    offset += line.length;
    // Use hash to deterministically select ~20% of line endings
    const hashByte = parseInt(hash.slice((i * 2) % (hash.length - 1), (i * 2) % (hash.length - 1) + 2), 16);
    if (hashByte !== undefined && hashByte % 5 === 0) {
      positions.push(offset);
    }
    offset += 1; // for the \n
  }

  return positions.slice(0, 8); // Limit to 8 insertion points
}

/**
 * Apply a watermark to content based on a client seed.
 *
 * @param content - The markdown content to watermark
 * @param seed - A unique identifier for the client (e.g. userId)
 * @returns Watermarked content (visually identical, but uniquely traceable)
 */
export function applyWatermark(content: string, seed: string): string {
  const hash = seedHash(seed);
  const fingerprint = encodeFingerprint(hash);

  // 1. Add invisible HTML comment at the end
  const comment = `<!-- sm:${hash.slice(0, 12)} -->`;

  // 2. Insert zero-width fingerprint at deterministic positions
  const positions = getInsertionPositions(content, hash);
  let watermarked = content;
  let insertOffset = 0;

  for (const pos of positions) {
    const adjustedPos = pos + insertOffset;
    if (adjustedPos <= watermarked.length) {
      // Insert a single ZWC char from the fingerprint
      const zwcIdx = insertOffset % fingerprint.length;
      const zwc = fingerprint[zwcIdx] ?? ZWC.ZWSP;
      watermarked =
        watermarked.slice(0, adjustedPos) +
        zwc +
        watermarked.slice(adjustedPos);
      insertOffset += 1;
    }
  }

  return watermarked + "\n" + comment;
}

/**
 * Check if content contains a watermark from a given seed.
 */
export function hasWatermark(content: string, seed: string): boolean {
  const hash = seedHash(seed);
  const comment = `<!-- sm:${hash.slice(0, 12)} -->`;
  return content.includes(comment);
}

/**
 * Remove watermark comment from content.
 * Note: zero-width chars remain but are invisible.
 */
export function stripWatermarkComment(content: string): string {
  return content.replace(/\n<!-- sm:[a-f0-9]{12} -->/g, "");
}
