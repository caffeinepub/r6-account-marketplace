import React from 'react';
import StarRating from './StarRating';
import type { PublicVouch } from '../../backend';

interface AverageRatingProps {
  vouches: PublicVouch[];
}

export default function AverageRating({ vouches }: AverageRatingProps) {
  if (vouches.length === 0) return null;

  const avg = vouches.reduce((sum, v) => sum + Number(v.rating), 0) / vouches.length;
  const rounded = Math.round(avg * 10) / 10;

  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: vouches.filter((v) => Number(v.rating) === star).length,
    pct: (vouches.filter((v) => Number(v.rating) === star).length / vouches.length) * 100,
  }));

  return (
    <div className="p-6 bg-surface border border-gold/20 rounded-sm flex flex-col sm:flex-row items-center gap-8">
      {/* Big Number */}
      <div className="text-center shrink-0">
        <p className="font-display text-6xl font-bold text-gold">{rounded.toFixed(1)}</p>
        <StarRating value={Math.round(avg)} readonly size="lg" />
        <p className="text-sm text-muted-foreground mt-1">{vouches.length} review{vouches.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Distribution */}
      <div className="flex-1 w-full space-y-1.5">
        {distribution.map(({ star, count, pct }) => (
          <div key={star} className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground w-4 text-right">{star}</span>
            <div className="flex-1 h-2 bg-surface-raised rounded-full overflow-hidden">
              <div
                className="h-full bg-gold rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground w-6">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
