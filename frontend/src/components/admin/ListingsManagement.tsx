import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Trash2, DollarSign, Loader2, RefreshCw } from 'lucide-react';
import {
  useListAllListings,
  useAddListing,
  useUpdateListingPrice,
  useToggleSpecialDeal,
  useMarkSold,
  useDeleteListing,
} from '../../hooks/useQueries';
import { formatICP, RANKS, RANK_COLORS, RANK_ICONS } from '../../lib/utils';
import { Status } from '../../backend';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function ListingsManagement() {
  const { data: listings, isLoading, refetch } = useListAllListings();
  const addListing = useAddListing();
  const updatePrice = useUpdateListingPrice();
  const toggleDeal = useToggleSpecialDeal();
  const markSold = useMarkSold();
  const deleteListing = useDeleteListing();

  const [showForm, setShowForm] = useState(false);
  const [editingPrice, setEditingPrice] = useState<{ id: string; value: string } | null>(null);

  // New listing form state
  const [newId, setNewId] = useState('');
  const [newRank, setNewRank] = useState('Gold');
  const [newPrice, setNewPrice] = useState('');
  const [newSpecialDeal, setNewSpecialDeal] = useState(false);

  const handleAddListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newId.trim() || !newPrice.trim()) return;
    try {
      const priceE8s = BigInt(Math.round(parseFloat(newPrice) * 1e8));
      await addListing.mutateAsync({
        id: newId.trim(),
        rank: newRank,
        priceE8s,
        specialDeal: newSpecialDeal,
        encryptedCredentialRef: new Uint8Array(0),
      });
      toast.success('Listing added successfully!');
      setNewId('');
      setNewPrice('');
      setNewSpecialDeal(false);
      setShowForm(false);
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error?.message || 'Failed to add listing.');
    }
  };

  const handleUpdatePrice = async (id: string) => {
    if (!editingPrice || editingPrice.id !== id) return;
    try {
      const priceE8s = BigInt(Math.round(parseFloat(editingPrice.value) * 1e8));
      await updatePrice.mutateAsync({ id, priceE8s });
      toast.success('Price updated!');
      setEditingPrice(null);
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error?.message || 'Failed to update price.');
    }
  };

  const handleToggleDeal = async (id: string) => {
    try {
      await toggleDeal.mutateAsync(id);
      toast.success('Special deal toggled!');
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error?.message || 'Failed to toggle deal.');
    }
  };

  const handleMarkSold = async (id: string) => {
    try {
      await markSold.mutateAsync(id);
      toast.success('Listing marked as sold.');
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error?.message || 'Failed to mark sold.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(`Delete listing "${id}"? This cannot be undone.`)) return;
    try {
      await deleteListing.mutateAsync(id);
      toast.success('Listing deleted.');
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error?.message || 'Failed to delete listing.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-foreground">Listings Management</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="border-border text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            onClick={() => setShowForm(!showForm)}
            className="bg-gold text-background hover:bg-gold-bright font-semibold"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Listing
          </Button>
        </div>
      </div>

      {/* Add Listing Form */}
      {showForm && (
        <form
          onSubmit={handleAddListing}
          className="p-4 bg-surface-raised border border-gold/20 rounded-sm space-y-4 animate-slide-up"
        >
          <h3 className="font-semibold text-foreground text-sm">New Listing</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Account ID</Label>
              <Input
                value={newId}
                onChange={(e) => setNewId(e.target.value)}
                placeholder="e.g. acc_001"
                className="bg-surface border-border focus:border-gold text-sm"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Rank</Label>
              <Select value={newRank} onValueChange={setNewRank}>
                <SelectTrigger className="bg-surface border-border focus:border-gold text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-surface-raised border-border">
                  {RANKS.map((r) => (
                    <SelectItem
                      key={r}
                      value={r}
                      className="text-foreground hover:bg-surface-overlay"
                    >
                      {RANK_ICONS[r]} {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Price (ICP)</Label>
              <Input
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                placeholder="e.g. 5.00"
                type="number"
                step="0.01"
                min="0"
                className="bg-surface border-border focus:border-gold text-sm"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Special Deal</Label>
              <div className="flex items-center gap-2 h-9">
                <Switch
                  checked={newSpecialDeal}
                  onCheckedChange={setNewSpecialDeal}
                  className="data-[state=checked]:bg-gold"
                />
                <span className="text-sm text-muted-foreground">
                  {newSpecialDeal ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowForm(false)}
              className="border-border text-muted-foreground"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={addListing.isPending}
              className="bg-gold text-background hover:bg-gold-bright font-semibold"
            >
              {addListing.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Add Listing'
              )}
            </Button>
          </div>
        </form>
      )}

      {/* Listings Table */}
      {isLoading ? (
        <div className="text-center py-10">
          <Loader2 className="w-6 h-6 text-gold animate-spin mx-auto" />
        </div>
      ) : !listings || listings.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">No listings yet.</div>
      ) : (
        <div className="overflow-x-auto rounded-sm border border-border">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground text-xs">ID</TableHead>
                <TableHead className="text-muted-foreground text-xs">Rank</TableHead>
                <TableHead className="text-muted-foreground text-xs">Price</TableHead>
                <TableHead className="text-muted-foreground text-xs">Deal</TableHead>
                <TableHead className="text-muted-foreground text-xs">Status</TableHead>
                <TableHead className="text-muted-foreground text-xs text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listings.map((listing) => {
                const rankColor = RANK_COLORS[listing.rank] || '';
                // Status is an enum value, compare directly
                const isSold = listing.status === Status.sold;
                return (
                  <TableRow key={listing.id} className="border-border hover:bg-surface-raised">
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {listing.id}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-sm border ${rankColor}`}
                      >
                        {RANK_ICONS[listing.rank]} {listing.rank}
                      </span>
                    </TableCell>
                    <TableCell>
                      {editingPrice?.id === listing.id ? (
                        <div className="flex items-center gap-1">
                          <Input
                            value={editingPrice.value}
                            onChange={(e) =>
                              setEditingPrice({ id: listing.id, value: e.target.value })
                            }
                            className="w-20 h-7 text-xs bg-surface border-border"
                            type="number"
                            step="0.01"
                          />
                          <Button
                            size="sm"
                            className="h-7 px-2 bg-gold text-background text-xs"
                            onClick={() => handleUpdatePrice(listing.id)}
                            disabled={updatePrice.isPending}
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-xs"
                            onClick={() => setEditingPrice(null)}
                          >
                            ✕
                          </Button>
                        </div>
                      ) : (
                        <button
                          onClick={() =>
                            setEditingPrice({
                              id: listing.id,
                              value: (Number(listing.priceE8s) / 1e8).toString(),
                            })
                          }
                          className="text-gold text-sm font-semibold hover:text-gold-bright transition-colors flex items-center gap-1"
                        >
                          {formatICP(listing.priceE8s)}
                          <DollarSign className="w-3 h-3 opacity-50" />
                        </button>
                      )}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={listing.specialDeal}
                        onCheckedChange={() => handleToggleDeal(listing.id)}
                        className="data-[state=checked]:bg-gold scale-75"
                        disabled={toggleDeal.isPending}
                      />
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={isSold ? 'secondary' : 'default'}
                        className={
                          isSold
                            ? 'bg-surface-overlay text-muted-foreground border-border text-xs'
                            : 'bg-green-500/10 text-green-400 border-green-500/30 text-xs'
                        }
                      >
                        {isSold ? 'Sold' : 'Available'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {!isSold && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                            onClick={() => handleMarkSold(listing.id)}
                            disabled={markSold.isPending}
                          >
                            Mark Sold
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          onClick={() => handleDelete(listing.id)}
                          disabled={deleteListing.isPending}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
