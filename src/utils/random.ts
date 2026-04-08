// ============================================
// Seeded Random Number Generator
// For deterministic simulation replay
// ============================================

export class SeededRandom {
  private seed: number;

  constructor(seed: number = Date.now()) {
    this.seed = seed;
  }

  // Linear Congruential Generator
  // Returns number between 0 and 1
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  // Generate random number in range [min, max)
  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  // Generate random integer in range [min, max]
  rangeInt(min: number, max: number): number {
    return Math.floor(this.range(min, max + 1));
  }

  // Pick random element from array
  pick<T>(array: T[]): T | undefined {
    if (array.length === 0) return undefined;
    return array[this.rangeInt(0, array.length - 1)];
  }

  // Get current seed (for saving state)
  getSeed(): number {
    return this.seed;
  }

  // Set seed (for restoring state)
  setSeed(seed: number): void {
    this.seed = seed;
  }
}

// Global instance for simulation use
let globalRandom = new SeededRandom();

export function setGlobalSeed(seed: number): void {
  globalRandom = new SeededRandom(seed);
}

export function getGlobalRandom(): SeededRandom {
  return globalRandom;
}
