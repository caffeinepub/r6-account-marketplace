import React from 'react';
import { useGetPublicVouches } from '../hooks/useQueries';
import VouchCard from '../components/vouch/VouchCard';
import AverageRating from '../components/vouch/AverageRating';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare, Shield } from 'lucide-react';

export default function VouchesPage() {
  const { data: vouches, isLoading } = useGetPublicVouches();

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      {/* Page Header */}
      <div className="mb-8 space-y-2">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-6 h-6 text-gold" />
          <h1 className="font-display text-3xl font-bold text-foreground tracking-wide">
            BUYER REVIEWS
          </h1>
        </div>
        <p className="text-muted-foreground">
          Verified reviews from real buyers. All reviews are tied to confirmed purchases.
        </p>
      </div>

      {/* Average Rating */}
      {isLoading ? (
        <Skeleton className="h-32 bg-surface-raised rounded-sm mb-8" />
      ) : vouches && vouches.length > 0 ? (
        <div className="mb-8">
          <AverageRating vouches={vouches} />
        </div>
      ) : null}

      {/* Reviews List */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28 bg-surface-raised rounded-sm" />
          ))}
        </div>
      ) : !vouches || vouches.length === 0 ? (
        <div className="text-center py-20">
          <Shield className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground text-lg font-display">No reviews yet</p>
          <p className="text-sm text-muted-foreground mt-2">
            Be the first to purchase and leave a review!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {vouches.map((vouch, idx) => (
            <VouchCard key={idx} vouch={vouch} />
          ))}
        </div>
      )}
    </div>
  );
}
