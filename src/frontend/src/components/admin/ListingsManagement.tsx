import {
  ExternalLink,
  Loader2,
  Pencil,
  Plus,
  Sparkles,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { Status } from "../../backend";
import type { PublicListing } from "../../backend";
import {
  useAddListing,
  useDeleteListing,
  useListAllListings,
  useMarkSold,
  useToggleSpecialDeal,
  useUpdateListing,
} from "../../hooks/useQueries";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

interface ListingFormData {
  id: string;
  rank: string;
  priceIcp: string;
  specialDeal: boolean;
  credentialText: string;
  rareSkinNames: string[];
  rareSkinShowcaseLink: string;
}

const defaultForm: ListingFormData = {
  id: "",
  rank: "",
  priceIcp: "",
  specialDeal: false,
  credentialText: "",
  rareSkinNames: [],
  rareSkinShowcaseLink: "",
};

function SkinTagInput({
  tags,
  onChange,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
}) {
  const [inputValue, setInputValue] = useState("");

  const addTag = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const removeTag = (tag: string) => {
    onChange(tags.filter((t) => t !== tag));
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type skin name, press Enter"
          className="flex-1"
        />
        <Button type="button" variant="outline" size="sm" onClick={addTag}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-medium"
            >
              <Tag className="w-2.5 h-2.5" />
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-0.5 hover:text-destructive transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ListingsManagement() {
  const { data: listings = [], isLoading } = useListAllListings();
  const addListing = useAddListing();
  const updateListing = useUpdateListing();
  const deleteListing = useDeleteListing();
  const toggleSpecialDeal = useToggleSpecialDeal();
  const markSold = useMarkSold();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingListing, setEditingListing] = useState<PublicListing | null>(
    null,
  );
  const [form, setForm] = useState<ListingFormData>(defaultForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const openAdd = () => {
    setForm(defaultForm);
    setShowAddDialog(true);
  };

  const openEdit = (listing: PublicListing) => {
    setEditingListing(listing);
    setForm({
      id: listing.id,
      rank: listing.rank,
      priceIcp: (Number(listing.priceE8s) / 1e8).toString(),
      specialDeal: listing.specialDeal,
      credentialText: "",
      rareSkinNames: listing.rareSkinNames ? [...listing.rareSkinNames] : [],
      rareSkinShowcaseLink: listing.rareSkinShowcaseLink || "",
    });
  };

  const closeDialogs = () => {
    setShowAddDialog(false);
    setEditingListing(null);
    setForm(defaultForm);
  };

  const handleAdd = async () => {
    try {
      const priceE8s = BigInt(
        Math.round(Number.parseFloat(form.priceIcp) * 1e8),
      );
      const credBytes = new TextEncoder().encode(
        form.credentialText || "placeholder",
      );
      await addListing.mutateAsync({
        id: form.id,
        rank: form.rank,
        priceE8s,
        specialDeal: form.specialDeal,
        encryptedCredentialRef: credBytes,
        rareSkinNames:
          form.rareSkinNames.length > 0 ? form.rareSkinNames : null,
        rareSkinShowcaseLink: form.rareSkinShowcaseLink.trim() || null,
      });
      toast.success(`Listing #${form.id} added successfully`);
      closeDialogs();
    } catch (err: any) {
      const msg = err?.message || String(err);
      toast.error(`Failed to add listing: ${msg}`);
    }
  };

  const handleUpdate = async () => {
    if (!editingListing) return;
    try {
      const priceE8s = BigInt(
        Math.round(Number.parseFloat(form.priceIcp) * 1e8),
      );
      await updateListing.mutateAsync({
        id: editingListing.id,
        priceE8s,
        rank: form.rank,
        rareSkinNames:
          form.rareSkinNames.length > 0 ? form.rareSkinNames : null,
        rareSkinShowcaseLink: form.rareSkinShowcaseLink.trim() || null,
      });
      toast.success(`Listing #${editingListing.id} updated`);
      closeDialogs();
    } catch (err: any) {
      const msg = err?.message || String(err);
      toast.error(`Failed to update listing: ${msg}`);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteListing.mutateAsync(id);
      toast.success(`Listing #${id} deleted`);
      setDeleteConfirm(null);
    } catch (err: any) {
      const msg = err?.message || String(err);
      toast.error(`Failed to delete listing: ${msg}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">
          Listings Management
        </h2>
        <Button onClick={openAdd} size="sm" className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Listing
        </Button>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Rank</TableHead>
              <TableHead>Price (ICP)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Special</TableHead>
              <TableHead>Rare Skins</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {listings.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground py-8"
                >
                  No listings yet. Add one to get started.
                </TableCell>
              </TableRow>
            ) : (
              listings.map((listing) => (
                <TableRow key={listing.id}>
                  <TableCell className="font-mono text-xs">
                    {listing.id}
                  </TableCell>
                  <TableCell>{listing.rank}</TableCell>
                  <TableCell>
                    {(Number(listing.priceE8s) / 1e8).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        listing.status === Status.sold ? "secondary" : "default"
                      }
                      className={
                        listing.status === Status.available
                          ? "bg-green-500/20 text-green-400 border-green-500/30"
                          : ""
                      }
                    >
                      {listing.status === Status.sold ? "Sold" : "Available"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => toggleSpecialDeal.mutate(listing.id)}
                      disabled={toggleSpecialDeal.isPending}
                      className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
                        listing.specialDeal
                          ? "bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/30"
                          : "bg-muted text-muted-foreground border-border hover:border-amber-500/30"
                      }`}
                    >
                      {listing.specialDeal ? "Yes" : "No"}
                    </button>
                  </TableCell>
                  <TableCell>
                    {listing.rareSkinNames &&
                    listing.rareSkinNames.length > 0 ? (
                      <div className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        <span className="text-xs text-amber-400">
                          {listing.rareSkinNames.length} skin(s)
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {listing.status === Status.available && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => markSold.mutate(listing.id)}
                          disabled={markSold.isPending}
                          title="Mark as sold"
                        >
                          {markSold.isPending ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <span className="text-xs">Sell</span>
                          )}
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => openEdit(listing)}
                        title="Edit listing"
                      >
                        <Pencil className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => setDeleteConfirm(listing.id)}
                        title="Delete listing"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Dialog */}
      <Dialog
        open={showAddDialog}
        onOpenChange={(open) => !open && closeDialogs()}
      >
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Listing</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Listing ID</Label>
                <Input
                  value={form.id}
                  onChange={(e) => setForm({ ...form, id: e.target.value })}
                  placeholder="e.g. acc-001"
                />
              </div>
              <div className="space-y-1">
                <Label>Rank</Label>
                <Input
                  value={form.rank}
                  onChange={(e) => setForm({ ...form, rank: e.target.value })}
                  placeholder="e.g. Diamond"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Price (ICP)</Label>
              <Input
                type="number"
                value={form.priceIcp}
                onChange={(e) => setForm({ ...form, priceIcp: e.target.value })}
                placeholder="e.g. 5.00"
                min="0"
                step="0.01"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="specialDeal-add"
                checked={form.specialDeal}
                onChange={(e) =>
                  setForm({ ...form, specialDeal: e.target.checked })
                }
                className="rounded"
              />
              <Label htmlFor="specialDeal-add">Special Deal</Label>
            </div>
            <div className="space-y-1">
              <Label>Credential (plaintext — will be encoded)</Label>
              <Input
                value={form.credentialText}
                onChange={(e) =>
                  setForm({ ...form, credentialText: e.target.value })
                }
                placeholder="username:password"
              />
            </div>

            {/* Rare Skins Panel */}
            <div className="space-y-2 border border-amber-500/20 rounded-lg p-3 bg-amber-500/5">
              <div className="flex items-center gap-2 text-amber-500 font-semibold text-sm">
                <Sparkles className="w-4 h-4" />
                Rare Skins
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Skin Names (type + Enter to add)
                </Label>
                <SkinTagInput
                  tags={form.rareSkinNames}
                  onChange={(tags) => setForm({ ...form, rareSkinNames: tags })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" />
                  Showcase Link (optional)
                </Label>
                <Input
                  value={form.rareSkinShowcaseLink}
                  onChange={(e) =>
                    setForm({ ...form, rareSkinShowcaseLink: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialogs}>
              Cancel
            </Button>
            <Button
              onClick={handleAdd}
              disabled={
                addListing.isPending || !form.id || !form.rank || !form.priceIcp
              }
            >
              {addListing.isPending && (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              )}
              Add Listing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingListing}
        onOpenChange={(open) => !open && closeDialogs()}
      >
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Listing #{editingListing?.id}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Rank</Label>
              <Input
                value={form.rank}
                onChange={(e) => setForm({ ...form, rank: e.target.value })}
                placeholder="e.g. Diamond"
              />
            </div>
            <div className="space-y-1">
              <Label>Price (ICP)</Label>
              <Input
                type="number"
                value={form.priceIcp}
                onChange={(e) => setForm({ ...form, priceIcp: e.target.value })}
                placeholder="e.g. 5.00"
                min="0"
                step="0.01"
              />
            </div>

            {/* Rare Skins Panel */}
            <div className="space-y-2 border border-amber-500/20 rounded-lg p-3 bg-amber-500/5">
              <div className="flex items-center gap-2 text-amber-500 font-semibold text-sm">
                <Sparkles className="w-4 h-4" />
                Rare Skins
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Skin Names (type + Enter to add)
                </Label>
                <SkinTagInput
                  tags={form.rareSkinNames}
                  onChange={(tags) => setForm({ ...form, rareSkinNames: tags })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" />
                  Showcase Link (optional)
                </Label>
                <Input
                  value={form.rareSkinShowcaseLink}
                  onChange={(e) =>
                    setForm({ ...form, rareSkinShowcaseLink: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialogs}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={updateListing.isPending || !form.rank || !form.priceIcp}
            >
              {updateListing.isPending && (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog
        open={!!deleteConfirm}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Listing</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-sm">
            Are you sure you want to delete listing{" "}
            <strong>#{deleteConfirm}</strong>? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              disabled={deleteListing.isPending}
            >
              {deleteListing.isPending && (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
