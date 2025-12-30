/**
 * Provably Fair RNG System for Slab Safari
 *
 * Algorithm:
 * 1. Server generates server_seed (32 bytes random)
 * 2. User sees SHA-256(server_seed) before play
 * 3. Combined = server_seed + ":" + client_seed + ":" + nonce
 * 4. Hash = SHA-256(combined)
 * 5. Roll = parseInt(hash[0:8], 16) % 100000
 * 6. Nonce increments for each roll
 * 7. Server seed revealed after rotation
 */

import { createHash, randomBytes } from 'crypto';

export interface RollParams {
  serverSeed: string;
  clientSeed: string;
  nonce: number;
}

export interface RollResult {
  roll: number;
  hash: string;
}

export interface VerifyParams extends RollParams {
  expectedRoll: number;
}

/**
 * Generate a cryptographically secure server seed (32 bytes, hex encoded)
 */
export function generateServerSeed(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Hash a seed using SHA-256
 */
export function hashSeed(seed: string): string {
  return createHash('sha256').update(seed).digest('hex');
}

/**
 * Generate a roll number from seed combination
 * Returns a number between 0-99999 (100,000 possibilities)
 */
export function generateRoll(params: RollParams): RollResult {
  const { serverSeed, clientSeed, nonce } = params;

  // Combine seeds with nonce
  const combined = `${serverSeed}:${clientSeed}:${nonce}`;

  // Hash the combined string
  const hash = hashSeed(combined);

  // Take first 8 characters of hash and convert to number
  const rollValue = parseInt(hash.substring(0, 8), 16);

  // Modulo to get 0-99999 range
  const roll = rollValue % 100000;

  return { roll, hash };
}

/**
 * Verify a roll result - allows users to independently verify
 */
export function verifyRoll(params: VerifyParams): boolean {
  const { serverSeed, clientSeed, nonce, expectedRoll } = params;
  const { roll } = generateRoll({ serverSeed, clientSeed, nonce });
  return roll === expectedRoll;
}

/**
 * Convert a roll (0-99999) to a rarity based on pack odds
 */
export function rollToRarity(roll: number, packOdds: PackOdds): string {
  let cumulative = 0;

  for (const [rarity, percentage] of Object.entries(packOdds)) {
    cumulative += percentage * 1000; // Convert to 0-100000 scale
    if (roll < cumulative) {
      return rarity;
    }
  }

  // Fallback to lowest rarity
  return Object.keys(packOdds)[0];
}

export interface PackOdds {
  [rarity: string]: number; // Percentage as decimal (e.g., 65.0 for 65%)
}

// Default pack odds from spec
export const DEFAULT_PACK_ODDS: PackOdds = {
  common: 65.0,
  uncommon: 24.0,
  rare: 8.0,
  ultra_rare: 2.5,
  secret_rare: 0.45,
  chase: 0.05,
};

/**
 * Create initial seed data for a new user
 */
export function createSeedPair(clientSeed: string = 'default') {
  const serverSeed = generateServerSeed();
  const serverSeedHash = hashSeed(serverSeed);

  return {
    serverSeed,
    serverSeedHash,
    clientSeed,
    nonce: 0,
  };
}
