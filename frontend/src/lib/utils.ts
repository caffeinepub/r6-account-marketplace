import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatICP(priceE8s: bigint): string {
  const icp = Number(priceE8s) / 1e8;
  return `${icp.toFixed(2)} ICP`;
}

export function formatTimestamp(timestamp: bigint): string {
  const ms = Number(timestamp) / 1_000_000;
  return new Date(ms).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function generatePurchaseId(): string {
  return `purchase_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export const RANKS = [
  'Copper',
  'Bronze',
  'Silver',
  'Gold',
  'Platinum',
  'Diamond',
  'Champion',
  'Unranked',
] as const;

export type Rank = (typeof RANKS)[number];

export const RANK_COLORS: Record<string, string> = {
  Copper: 'text-orange-400 border-orange-400/40 bg-orange-400/10',
  Bronze: 'text-amber-600 border-amber-600/40 bg-amber-600/10',
  Silver: 'text-slate-300 border-slate-300/40 bg-slate-300/10',
  Gold: 'text-gold border-gold/40 bg-gold/10',
  Platinum: 'text-cyan-300 border-cyan-300/40 bg-cyan-300/10',
  Diamond: 'text-blue-400 border-blue-400/40 bg-blue-400/10',
  Champion: 'text-purple-400 border-purple-400/40 bg-purple-400/10',
  Unranked: 'text-muted-foreground border-border bg-surface-raised',
};

export const RANK_ICONS: Record<string, string> = {
  Copper: '🥉',
  Bronze: '🏅',
  Silver: '🥈',
  Gold: '🥇',
  Platinum: '💎',
  Diamond: '💠',
  Champion: '👑',
  Unranked: '⚔️',
};

// ICP payment address (placeholder - admin should configure)
export const ICP_PAYMENT_ADDRESS = 'ryjl3-tyaaa-aaaaa-aaaba-cai';
export const BTC_PAYMENT_ADDRESS = 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh';
export const ETH_PAYMENT_ADDRESS = '0x742d35Cc6634C0532925a3b8D4C9C3b4b5e8f1a2';
