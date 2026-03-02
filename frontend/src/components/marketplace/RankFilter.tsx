import React from 'react';
import { Sparkles } from 'lucide-react';

interface RankFilterProps {
  ranks: string[];
  selectedRank: string | null;
  onSelectRank: (rank: string | null) => void;
  showRareSkins: boolean;
  onToggleRareSkins: () => void;
}

const RANK_ORDER = [
  'Copper',
  'Bronze',
  'Silver',
  'Gold',
  'Platinum',
  'Emerald',
  'Diamond',
  'Champion',
  'Unranked',
];

export default function RankFilter({
  ranks,
  selectedRank,
  onSelectRank,
  showRareSkins,
  onToggleRareSkins,
}: RankFilterProps) {
  const sortedRanks = [...ranks].sort((a, b) => {
    const ai = RANK_ORDER.indexOf(a);
    const bi = RANK_ORDER.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        Filter by Rank
      </h2>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onSelectRank(null)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
            !selectedRank && !showRareSkins
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
          }`}
        >
          All
        </button>

        {sortedRanks.map((rank) => (
          <button
            key={rank}
            onClick={() => onSelectRank(rank === selectedRank ? null : rank)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
              selectedRank === rank
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
            }`}
          >
            {rank}
          </button>
        ))}

        {/* Rare Skins filter button — placed alongside Unranked */}
        <button
          onClick={onToggleRareSkins}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border flex items-center gap-1.5 ${
            showRareSkins
              ? 'bg-amber-500 text-white border-amber-500'
              : 'bg-card text-amber-500 border-amber-500/40 hover:border-amber-500 hover:bg-amber-500/10'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Rare Skins
        </button>
      </div>
    </div>
  );
}
