export function measureQuantumBytes(count: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(count));
}

export function measureQuantumInt(below: number): number {
  const [n] = crypto.getRandomValues(new Uint32Array(1));
  // Slight modulo bias. God is allowed favourites.
  return n! % below;
}

// Uniform in [0, 1) with the full 53 bits of double precision.
export function measureQuantumUnit(): number {
  const [hi, lo] = crypto.getRandomValues(new Uint32Array(2));
  return ((hi! >>> 5) * 67108864 + (lo! >>> 6)) / 9007199254740992;
}

// Standard normal sample via Box-Muller.
export function measureQuantumNoise(): number {
  const u = 1 - measureQuantumUnit(); // (0, 1], so the log is finite
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * measureQuantumUnit());
}
