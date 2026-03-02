import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Lock, Star } from 'lucide-react';
import { formatICP, RANK_COLORS, RANK_ICONS } from '../../lib/utils';
import { Status } from '../../backend';
import type { PublicListing } from '../../backend';

interface ListingCardProps {
  listing: PublicListing;
  onSelect: () => void;
  featured?: boolean;
}

export default function ListingCard({ listing, onSelect, featured = false }: ListingCardProps) {
  const isSold = listing.status === Status.sold;
  const rankColor = RANK_COLORS[listing.rank] || RANK_COLORS['Unranked'];
  const rankIcon = RANK_ICONS[listing.rank] || '⚔️';

  return (
    <div
      className={`relative group rounded-sm border transition-all duration-200 overflow-hidden ${
        isSold
          ? 'opacity-50 cursor-not-allowed border-border bg-surface'
          : featured
          ? 'border-gold/50 bg-surface hover:border-gold hover:shadow-gold cursor-pointer'
          : 'border-border bg-surface hover:border-gold/40 hover:bg-surface-raised cursor-pointer'
      }`}
      onClick={!isSold ? onSelect : undefined}
    >
      {/* Top accent line */}
      {!isSold && (
        <div
          className={`h-0.5 w-full ${
            featured ? 'bg-gold' : 'bg-gold/30 group-hover:bg-gold/60'
          } transition-all`}
        />
      )}

      <div className="p-4 space-y-3">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div
            className={`flex items-center gap-2 px-2.5 py-1 rounded-sm border text-sm font-semibold ${rankColor}`}
          >
            <span>{rankIcon}</span>
            <span>{listing.rank}</span>
          </div>
          <div className="flex flex-col items-end gap-1">
            {listing.specialDeal && (
              <Badge className="bg-gold/20 text-gold border-gold/40 text-xs px-2 py-0.5 font-semibold">
                <Star className="w-2.5 h-2.5 mr-1 fill-gold" />
                DEAL
              </Badge>
            )}
            {isSold && (
              <Badge
                variant="secondary"
                className="text-xs bg-surface-overlay text-muted-foreground border-border"
              >
                SOLD
              </Badge>
            )}
          </div>
        </div>

        {/* Price */}
        <div className="space-y-0.5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Price</p>
          <p className="font-display text-2xl font-bold text-gold">{formatICP(listing.priceE8s)}</p>
        </div>

        {/* Account ID (truncated, non-sensitive) */}
        <p className="text-xs text-muted-foreground font-mono truncate">ID: {listing.id}</p>

        {/* Action */}
        {isSold ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground pt-1">
            <Lock className="w-3.5 h-3.5" />
            <span>Account Sold</span>
          </div>
        ) : (
          <Button
            size="sm"
            className="w-full bg-gold/10 text-gold border border-gold/30 hover:bg-gold hover:text-background transition-all font-semibold text-sm group-hover:bg-gold group-hover:text-background"
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
          >
            <ShoppingCart className="w-3.5 h-3.5 mr-2" />
            Purchase Account
          </Button>
        )}
      </div>
    </div>
  );
}
