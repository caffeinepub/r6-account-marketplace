import React from 'react';
import { useGetSpecialDeals } from '../../hooks/useQueries';
import ListingCard from './ListingCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, Zap } from 'lucide-react';
import type { PublicListing } from '../../backend';

interface SpecialDealsSectionProps {
  onSelectListing: (listing: PublicListing) => void;
}

export default function SpecialDealsSection({ onSelectListing }: SpecialDealsSectionProps) {
  const { data: deals, isLoading } = useGetSpecialDeals();

  if (!isLoading && (!deals || deals.length === 0)) return null;

  return (
    <section>
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gold/10 border border-gold/30 rounded-sm">
          <Star className="w-4 h-4 text-gold fill-gold" />
          <span className="font-display text-lg font-bold text-gold tracking-wider">SPECIAL DEALS</span>
          <Zap className="w-4 h-4 text-gold" />
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-gold/30 to-transparent" />
      </div>

      {/* Deals Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 bg-surface-raised rounded-sm" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {deals!.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              onSelect={() => onSelectListing(listing)}
              featured={true}
            />
          ))}
        </div>
      )}
    </section>
  );
}
