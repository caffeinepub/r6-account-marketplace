import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, EyeOff, Loader2, RefreshCw, Trash2 } from "lucide-react";
import React from "react";
import { toast } from "sonner";
import {
  useDeleteVouch,
  useGetMyVouches,
  useHideVouch,
} from "../../hooks/useQueries";
import {
  RANK_COLORS,
  RANK_ICONS,
  formatTimestamp,
} from "../../lib/marketplace-utils";
import StarRating from "../vouch/StarRating";

export default function VouchModeration() {
  const { data: vouches, isLoading, refetch } = useGetMyVouches();
  const hideVouch = useHideVouch();
  const deleteVouch = useDeleteVouch();

  const handleHide = async (vouchId: string, currentlyHidden: boolean) => {
    try {
      await hideVouch.mutateAsync(vouchId);
      toast.success(currentlyHidden ? "Vouch unhidden." : "Vouch hidden.");
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error?.message || "Failed to update vouch visibility.");
    }
  };

  const handleDelete = async (vouchId: string) => {
    if (!confirm("Delete this vouch permanently? This cannot be undone."))
      return;
    try {
      await deleteVouch.mutateAsync(vouchId);
      toast.success("Vouch deleted.");
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error?.message || "Failed to delete vouch.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-foreground">
          Review Moderation
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="border-border text-muted-foreground hover:text-foreground"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-10">
          <Loader2 className="w-6 h-6 text-gold animate-spin mx-auto" />
        </div>
      ) : !vouches || vouches.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          No reviews yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-sm border border-border">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground text-xs">
                  Username
                </TableHead>
                <TableHead className="text-muted-foreground text-xs">
                  Rank
                </TableHead>
                <TableHead className="text-muted-foreground text-xs">
                  Rating
                </TableHead>
                <TableHead className="text-muted-foreground text-xs">
                  Review
                </TableHead>
                <TableHead className="text-muted-foreground text-xs">
                  Status
                </TableHead>
                <TableHead className="text-muted-foreground text-xs">
                  Date
                </TableHead>
                <TableHead className="text-muted-foreground text-xs text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vouches.map((vouch) => {
                const rankColor = RANK_COLORS[vouch.rank] || "";
                return (
                  <TableRow
                    key={vouch.vouchId}
                    className={`border-border hover:bg-surface-raised ${vouch.hidden ? "opacity-50" : ""}`}
                  >
                    <TableCell className="text-sm font-medium text-foreground">
                      {vouch.anonymousUsername}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-sm border ${rankColor}`}
                      >
                        {RANK_ICONS[vouch.rank]} {vouch.rank}
                      </span>
                    </TableCell>
                    <TableCell>
                      <StarRating
                        value={Number(vouch.rating)}
                        readonly
                        size="sm"
                      />
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                      {vouch.reviewText || "—"}
                    </TableCell>
                    <TableCell>
                      {vouch.hidden ? (
                        <Badge
                          variant="secondary"
                          className="bg-surface-overlay text-muted-foreground border-border text-xs"
                        >
                          Hidden
                        </Badge>
                      ) : (
                        <Badge className="bg-green-500/10 text-green-400 border-green-500/30 text-xs">
                          Visible
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatTimestamp(vouch.timestamp)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                          onClick={() =>
                            handleHide(vouch.vouchId, vouch.hidden)
                          }
                          disabled={hideVouch.isPending}
                          title={vouch.hidden ? "Unhide" : "Hide"}
                        >
                          {vouch.hidden ? (
                            <Eye className="w-3.5 h-3.5" />
                          ) : (
                            <EyeOff className="w-3.5 h-3.5" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          onClick={() => handleDelete(vouch.vouchId)}
                          disabled={deleteVouch.isPending}
                          title="Delete"
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
