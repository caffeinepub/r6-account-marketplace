import React, { useState } from 'react';
import { useListAllListings, useFilterByRank } from '../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';
import { Zap, Shield } from 'lucide-react';
import RankFilter from '../components/marketplace/RankFilter';
import ListingCard from '../components/marketplace/ListingCard';
import SpecialDealsSection from '../components/marketplace/SpecialDealsSection';
import PurchaseFlowModal from '../components/purchase/PurchaseFlowModal';
import { Status } from '../backend';
import type { PublicListing } from '../backend';

export default function MarketplacePage() {
  const [selectedRank, setSelectedRank] = useState<string | null>(null);
  const [selectedListing, setSelectedListing] = useState<PublicListing | null>(null);

  const { data: allListings, isLoading: allLoading } = useListAllListings();
  const { data: filteredListings, isLoading: filterLoading } = useFilterByRank(selectedRank);

  const displayedListings = selectedRank ? filteredListings : allListings;
  const isLoading = selectedRank ? filterLoading : allLoading;

  const availableCount =
    displayedListings?.filter((l) => l.status === Status.available).length ?? 0;

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <div className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-b from-gold/5 to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 py-6">
          <img
            src="/assets/generated/r6-market-banner.dim_1200x200.png"
            alt="R6 Market — Premium Account Marketplace"
            className="w-full max-w-4xl mx-auto rounded-sm object-cover"
            style={{ maxHeight: '200px' }}
          />
        </div>
      </div>

      {/* Stats Bar */}
      <div className="border-b border-border bg-surface">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-muted-foreground">
                <span className="text-foreground font-semibold">{availableCount}</span> accounts
                available
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Shield className="w-3.5 h-3.5 text-gold" />
              <span>Instant delivery after payment</span>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-muted-foreground">
              <Zap className="w-3.5 h-3.5 text-gold" />
              <span>ICP · BTC · ETH accepted</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-10">
        {/* Special Deals */}
        <SpecialDealsSection onSelectListing={setSelectedListing} />

        {/* Rank Filter */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-2xl font-bold text-foreground tracking-wide">
              ALL ACCOUNTS
            </h2>
            <span className="text-sm text-muted-foreground">
              {displayedListings?.length ?? 0} listings
            </span>
          </div>

          <RankFilter selectedRank={selectedRank} onSelectRank={setSelectedRank} />
        </div>

        {/* Listings Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-48 bg-surface-raised rounded-sm" />
            ))}
          </div>
        ) : !displayedListings || displayedListings.length === 0 ? (
          <div className="text-center py-20">
            <Shield className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground text-lg font-display">
              {selectedRank ? `No ${selectedRank} accounts available` : 'No accounts available'}
            </p>
            {selectedRank && (
              <button
                onClick={() => setSelectedRank(null)}
                className="mt-3 text-sm text-gold hover:text-gold-bright transition-colors"
              >
                View all accounts
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {displayedListings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onSelect={() => setSelectedListing(listing)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Purchase Modal */}
      {selectedListing && (
        <PurchaseFlowModal
          listing={selectedListing}
          onClose={() => setSelectedListing(null)}
        />
      )}
    </div>
  );
}
