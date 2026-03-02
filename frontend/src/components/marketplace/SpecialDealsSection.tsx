import React from 'react';
import type { PublicListing } from '../../backend';
import { Status } from '../../backend';
import { Zap, Loader2 } from 'lucide-react';
import ListingCard from './ListingCard';

interface SpecialDealsSectionProps {
  deals: PublicListing[];
  isLoading: boolean;
}

export default function SpecialDealsSection({ deals, isLoading }: SpecialDealsSectionProps) {
  // Only show available special deals
  const availableDeals = deals.filter((d) => d.status === Status.available);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-500" />
          <h2 className="text-xl font-bold text-foreground">Special Deals</h2>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground py-4">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Loading special deals...</span>
        </div>
      </div>
    );
  }

  // Hide section entirely when no available special deals
  if (availableDeals.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Zap className="w-5 h-5 text-amber-500" />
        <h2 className="text-xl font-bold text-foreground">Special Deals</h2>
        <span className="text-sm text-muted-foreground">({availableDeals.length} available)</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {availableDeals.map((deal) => (
          <ListingCard key={deal.id} listing={deal} />
        ))}
      </div>
    </div>
  );
}
