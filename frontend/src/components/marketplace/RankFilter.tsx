import React from 'react';
import { RANKS, RANK_COLORS, RANK_ICONS } from '../../lib/utils';

interface RankFilterProps {
  selectedRank: string | null;
  onSelectRank: (rank: string | null) => void;
}

export default function RankFilter({ selectedRank, onSelectRank }: RankFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelectRank(null)}
        className={`px-4 py-1.5 text-sm font-medium rounded-sm border transition-all ${
          selectedRank === null
            ? 'bg-gold text-background border-gold font-semibold'
            : 'bg-surface-raised border-border text-muted-foreground hover:border-gold/50 hover:text-foreground'
        }`}
      >
        All Ranks
      </button>
      {RANKS.map((rank) => {
        const isSelected = selectedRank === rank;
        const colorClass = RANK_COLORS[rank] || '';
        return (
          <button
            key={rank}
            onClick={() => onSelectRank(rank)}
            className={`px-4 py-1.5 text-sm font-medium rounded-sm border transition-all flex items-center gap-1.5 ${
              isSelected
                ? `${colorClass} font-semibold`
                : 'bg-surface-raised border-border text-muted-foreground hover:border-gold/50 hover:text-foreground'
            }`}
          >
            <span>{RANK_ICONS[rank]}</span>
            {rank}
          </button>
        );
      })}
    </div>
  );
}
