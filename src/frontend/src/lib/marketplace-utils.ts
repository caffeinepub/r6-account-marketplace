/**
 * Marketplace-specific utility helpers.
 * These are separate from lib/utils.ts (which is a protected platform file).
 */

// ---------------------------------------------------------------------------
// Rank display maps
// ---------------------------------------------------------------------------

export const RANK_COLORS: Record<string, string> = {
  Unranked: "bg-zinc-800/60 text-zinc-300 border-zinc-600/40",
  Copper: "bg-amber-900/40 text-amber-400 border-amber-700/40",
  Bronze: "bg-orange-900/40 text-orange-400 border-orange-700/40",
  Silver: "bg-slate-700/40 text-slate-300 border-slate-500/40",
  Gold: "bg-yellow-900/40 text-yellow-400 border-yellow-600/40",
  Platinum: "bg-cyan-900/40 text-cyan-300 border-cyan-600/40",
  Emerald: "bg-emerald-900/40 text-emerald-400 border-emerald-600/40",
  Diamond: "bg-sky-900/40 text-sky-300 border-sky-500/40",
  Champion: "bg-purple-900/40 text-purple-400 border-purple-600/40",
  "Pro League": "bg-rose-900/40 text-rose-400 border-rose-600/40",
};

export const RANK_ICONS: Record<string, string> = {
  Unranked: "⚔️",
  Copper: "🔶",
  Bronze: "🥉",
  Silver: "🥈",
  Gold: "🥇",
  Platinum: "💎",
  Emerald: "💚",
  Diamond: "🔷",
  Champion: "🏆",
  "Pro League": "👑",
};

// ---------------------------------------------------------------------------
// ICP formatting
// ---------------------------------------------------------------------------

/**
 * Formats an e8s bigint value as a human-readable ICP string.
 * e.g. 100_000_000n → "1.00 ICP"
 */
export function formatICP(priceE8s: bigint): string {
  const icp = Number(priceE8s) / 1e8;
  return `${icp.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 })} ICP`;
}

// ---------------------------------------------------------------------------
// Timestamp formatting
// ---------------------------------------------------------------------------

/**
 * Formats a nanosecond bigint timestamp into a human-readable date string.
 */
export function formatTimestamp(ns: bigint): string {
  const ms = Number(ns / 1_000_000n);
  return new Date(ms).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ---------------------------------------------------------------------------
// Purchase ID generator
// ---------------------------------------------------------------------------

/**
 * Generates a short, random purchase ID.
 */
export function generatePurchaseId(): string {
  return `purch_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

// ---------------------------------------------------------------------------
// Payment addresses (placeholder — admin configures real addresses on-chain)
// ---------------------------------------------------------------------------

export const ICP_PAYMENT_ADDRESS =
  "b6f9b2e3d4c5a6f7e8d9c0b1a2f3e4d5c6b7a8f9e0d1c2b3a4f5e6d7c8b9a0";

export const BTC_PAYMENT_ADDRESS = "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh";

export const ETH_PAYMENT_ADDRESS = "0xAbCd1234EfGh5678IjKl9012MnOp3456QrSt7890";
