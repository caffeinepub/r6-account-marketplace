import React, { useState } from 'react';
import type { PublicListing } from '../../backend';
import { Status } from '../../backend';
import { Badge } from '../ui/badge';
import { ExternalLink, Sparkles, Tag } from 'lucide-react';
import PurchaseFlowModal from '../purchase/PurchaseFlowModal';

interface ListingCardProps {
  listing: PublicListing;
}

const RANK_COLORS: Record<string, string> = {
  Copper: 'text-orange-700',
  Bronze: 'text-orange-500',
  Silver: 'text-slate-400',
  Gold: 'text-yellow-400',
  Platinum: 'text-cyan-400',
  Emerald: 'text-emerald-400',
  Diamond: 'text-blue-400',
  Champion: 'text-purple-400',
  Unranked: 'text-muted-foreground',
};

function formatPrice(priceE8s: bigint): string {
  const icp = Number(priceE8s) / 1e8;
  return icp.toFixed(2);
}

export default function ListingCard({ listing }: ListingCardProps) {
  const [showPurchase, setShowPurchase] = useState(false);
  const isSold = listing.status === Status.sold;
  const rankColor = RANK_COLORS[listing.rank] || 'text-foreground';

  const hasSkins = listing.rareSkinNames && listing.rareSkinNames.length > 0;

  return (
    <>
      <div
        className={`relative bg-card border rounded-xl overflow-hidden transition-all duration-200 flex flex-col ${
          isSold
            ? 'opacity-60 border-border'
            : 'border-border hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5'
        }`}
      >
        {/* Special Deal Badge */}
        {listing.specialDeal && (
          <div className="absolute top-2 right-2 z-10">
            <Badge variant="default" className="bg-amber-500 text-white text-xs px-2 py-0.5">
              Special Deal
            </Badge>
          </div>
        )}

        {/* Sold Overlay */}
        {isSold && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/60 backdrop-blur-sm">
            <span className="text-lg font-bold text-muted-foreground uppercase tracking-widest">
              Sold
            </span>
          </div>
        )}

        <div className="p-4 flex flex-col gap-3 flex-1">
          {/* Rank */}
          <div className="flex items-center justify-between">
            <span className={`text-lg font-bold ${rankColor}`}>{listing.rank}</span>
            <span className="text-xs text-muted-foreground font-mono">#{listing.id}</span>
          </div>

          {/* Rare Skins Section — only rendered when rareSkinNames is non-empty */}
          {hasSkins && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1 text-xs font-semibold text-amber-500 uppercase tracking-wider">
                <Sparkles className="w-3 h-3" />
                Rare Skins
              </div>
              <div className="flex flex-wrap gap-1">
                {listing.rareSkinNames!.map((skin) => (
                  <span
                    key={skin}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-medium"
                  >
                    <Tag className="w-2.5 h-2.5" />
                    {skin}
                  </span>
                ))}
              </div>
              {listing.rareSkinShowcaseLink && (
                <a
                  href={listing.rareSkinShowcaseLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-0.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="w-3 h-3" />
                  View Skins
                </a>
              )}
            </div>
          )}

          {/* Price */}
          <div className="mt-auto">
            <div className="text-2xl font-bold text-foreground">
              {formatPrice(listing.priceE8s)}
              <span className="text-sm font-normal text-muted-foreground ml-1">ICP</span>
            </div>
          </div>
        </div>

        {/* Buy Button */}
        <div className="px-4 pb-4">
          <button
            onClick={() => !isSold && setShowPurchase(true)}
            disabled={isSold}
            className={`w-full py-2 rounded-lg text-sm font-semibold transition-colors ${
              isSold
                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
          >
            {isSold ? 'Sold' : 'Buy Now'}
          </button>
        </div>
      </div>

      {showPurchase && (
        <PurchaseFlowModal listing={listing} onClose={() => setShowPurchase(false)} />
      )}
    </>
  );
}
