import React from "react";
import type { PublicVouch } from "../../backend";
import {
  RANK_COLORS,
  RANK_ICONS,
  formatTimestamp,
} from "../../lib/marketplace-utils";
import StarRating from "./StarRating";

interface VouchCardProps {
  vouch: PublicVouch;
}

export default function VouchCard({ vouch }: VouchCardProps) {
  const rankColor = RANK_COLORS[vouch.rank] || RANK_COLORS.Unranked;
  const rankIcon = RANK_ICONS[vouch.rank] || "⚔️";

  return (
    <div className="p-4 bg-surface border border-border rounded-sm hover:border-gold/30 transition-all space-y-3 animate-slide-up">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="font-semibold text-foreground text-sm">
            {vouch.anonymousUsername}
          </p>
          <div
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm border text-xs font-semibold ${rankColor}`}
          >
            <span>{rankIcon}</span>
            <span>{vouch.rank}</span>
          </div>
        </div>
        <div className="text-right space-y-1">
          <StarRating value={Number(vouch.rating)} readonly size="sm" />
          <p className="text-xs text-muted-foreground">
            {formatTimestamp(vouch.timestamp)}
          </p>
        </div>
      </div>

      {/* Review Text */}
      {vouch.reviewText && (
        <p className="text-sm text-muted-foreground leading-relaxed border-t border-border/50 pt-3">
          "{vouch.reviewText}"
        </p>
      )}
    </div>
  );
}
