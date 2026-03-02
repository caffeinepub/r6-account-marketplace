import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetPurchaseByBuyer } from '../../hooks/useQueries';
import { formatTimestamp } from '../../lib/utils';
import { Variant_pending_confirmed_failed, PaymentMethod } from '../../backend';

export default function PurchasesView() {
  const { identity } = useInternetIdentity();
  const principalStr = identity?.getPrincipal().toString();

  const { data: purchases, isLoading, refetch } = useGetPurchaseByBuyer(principalStr);

  const getStatusBadge = (status: Variant_pending_confirmed_failed) => {
    switch (status) {
      case Variant_pending_confirmed_failed.confirmed:
        return (
          <Badge className="bg-green-500/10 text-green-400 border-green-500/30 text-xs">
            Confirmed
          </Badge>
        );
      case Variant_pending_confirmed_failed.pending:
        return (
          <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30 text-xs">
            Pending
          </Badge>
        );
      case Variant_pending_confirmed_failed.failed:
        return (
          <Badge className="bg-red-500/10 text-red-400 border-red-500/30 text-xs">Failed</Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="text-xs">
            {String(status)}
          </Badge>
        );
    }
  };

  const getPaymentMethodLabel = (method: PaymentMethod) => {
    switch (method) {
      case PaymentMethod.icp:
        return <span className="text-gold font-semibold">ICP</span>;
      case PaymentMethod.btc:
        return <span className="text-orange-400 font-semibold">BTC</span>;
      case PaymentMethod.eth:
        return <span className="text-blue-400 font-semibold">ETH</span>;
      default:
        return <span>{String(method)}</span>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-foreground">Purchase Records</h2>
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
      ) : !purchases || purchases.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">No purchases yet.</div>
      ) : (
        <div className="overflow-x-auto rounded-sm border border-border">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground text-xs">Purchase ID</TableHead>
                <TableHead className="text-muted-foreground text-xs">Account ID</TableHead>
                <TableHead className="text-muted-foreground text-xs">Method</TableHead>
                <TableHead className="text-muted-foreground text-xs">Tx Hash</TableHead>
                <TableHead className="text-muted-foreground text-xs">Status</TableHead>
                <TableHead className="text-muted-foreground text-xs">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchases.map((purchase) => (
                <TableRow
                  key={purchase.purchaseId}
                  className="border-border hover:bg-surface-raised"
                >
                  <TableCell className="font-mono text-xs text-muted-foreground max-w-[120px] truncate">
                    {purchase.purchaseId}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-foreground">
                    {purchase.accountId}
                  </TableCell>
                  <TableCell className="text-sm">
                    {getPaymentMethodLabel(purchase.paymentMethod)}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground max-w-[120px] truncate">
                    {purchase.txHash || '—'}
                  </TableCell>
                  <TableCell>{getStatusBadge(purchase.status)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatTimestamp(purchase.timestamp)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
