import { Loader2, ShoppingBag, Star, TrendingUp } from "lucide-react";
import React, { useState, useMemo } from "react";
import { Status } from "../backend";
import type { PublicListing } from "../backend";
import ListingCard from "../components/marketplace/ListingCard";
import RankFilter from "../components/marketplace/RankFilter";
import SpecialDealsSection from "../components/marketplace/SpecialDealsSection";
import {
  useGetPublicVouches,
  useGetSpecialDeals,
  useListAllListings,
} from "../hooks/useQueries";

export default function MarketplacePage() {
  const [selectedRank, setSelectedRank] = useState<string | null>(null);
  const [showRareSkins, setShowRareSkins] = useState(false);

  const { data: allListings = [], isLoading: listingsLoading } =
    useListAllListings();
  const { data: specialDeals = [], isLoading: dealsLoading } =
    useGetSpecialDeals();
  const { data: vouches = [] } = useGetPublicVouches();

  const availableListings = useMemo(() => {
    return allListings.filter((l) => l.status === Status.available);
  }, [allListings]);

  const filteredListings = useMemo(() => {
    let result = availableListings;

    if (showRareSkins) {
      result = result.filter(
        (l) => l.rareSkinNames && l.rareSkinNames.length > 0,
      );
    } else if (selectedRank) {
      result = result.filter((l) => l.rank === selectedRank);
    }

    return result;
  }, [availableListings, selectedRank, showRareSkins]);

  const allRanks = useMemo(() => {
    const ranks = new Set(availableListings.map((l) => l.rank));
    return Array.from(ranks).sort();
  }, [availableListings]);

  const avgRating =
    vouches.length > 0
      ? (
          vouches.reduce((sum, v) => sum + Number(v.rating), 0) / vouches.length
        ).toFixed(1)
      : "5.0";

  const handleRankSelect = (rank: string | null) => {
    setSelectedRank(rank);
    setShowRareSkins(false);
  };

  const handleRareSkins = () => {
    setShowRareSkins((prev) => !prev);
    setSelectedRank(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Banner */}
      <div className="relative overflow-hidden">
        <img
          src="/assets/generated/ascensions-market-banner.dim_1200x300.png"
          alt="Ascension's Market"
          className="w-full object-cover max-h-64"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/40 to-transparent flex items-center">
          <div className="px-8 py-6">
            <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
              Ascension's Market
            </h1>
            <p className="text-white font-bold mt-2 text-lg drop-shadow">
              Premium Rainbow Six Siege accounts — verified &amp; secure
            </p>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap gap-6 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <ShoppingBag className="w-4 h-4 text-primary" />
            <span>
              <strong className="text-foreground">
                {availableListings.length}
              </strong>{" "}
              accounts available
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Star className="w-4 h-4 text-yellow-500" />
            <span>
              <strong className="text-foreground">{avgRating}</strong> avg
              rating ({vouches.length} reviews)
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span>
              <strong className="text-foreground">{specialDeals.length}</strong>{" "}
              special deals
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Special Deals Section */}
        <SpecialDealsSection deals={specialDeals} isLoading={dealsLoading} />

        {/* Rank Filter */}
        <RankFilter
          ranks={allRanks}
          selectedRank={selectedRank}
          onSelectRank={handleRankSelect}
          showRareSkins={showRareSkins}
          onToggleRareSkins={handleRareSkins}
        />

        {/* Listings Grid */}
        {listingsLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">No listings found</p>
            <p className="text-sm mt-1">
              {showRareSkins
                ? "No listings with rare skins available."
                : selectedRank
                  ? `No available listings for rank "${selectedRank}".`
                  : "No listings available at the moment."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
