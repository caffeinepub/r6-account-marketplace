import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, CheckCircle, AlertTriangle, ArrowLeft, Loader2 } from 'lucide-react';
import {
  useVerifyIcpPayment,
  useVerifyBtcPayment,
  useVerifyEthPayment,
} from '../../hooks/useQueries';
import { formatICP, ICP_PAYMENT_ADDRESS, BTC_PAYMENT_ADDRESS, ETH_PAYMENT_ADDRESS } from '../../lib/utils';
import { toast } from 'sonner';
import type { PublicListing } from '../../backend';

interface PaymentStepProps {
  listing: PublicListing;
  paymentMethod: 'icp' | 'btc' | 'eth';
  purchaseId: string;
  onVerified: () => void;
  onBack: () => void;
}

export default function PaymentStep({
  listing,
  paymentMethod,
  purchaseId,
  onVerified,
  onBack,
}: PaymentStepProps) {
  const [txHash, setTxHash] = useState('');
  const [blockIndex, setBlockIndex] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  const verifyIcp = useVerifyIcpPayment();
  const verifyBtc = useVerifyBtcPayment();
  const verifyEth = useVerifyEthPayment();

  const isVerifying = verifyIcp.isPending || verifyBtc.isPending || verifyEth.isPending;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleVerify = async () => {
    try {
      if (paymentMethod === 'icp') {
        const idx = BigInt(blockIndex.trim());
        await verifyIcp.mutateAsync({
          purchaseId,
          accountId: listing.id,
          blockIndex: idx,
        });
      } else if (paymentMethod === 'btc') {
        if (!txHash.trim()) {
          toast.error('Please enter the transaction hash');
          return;
        }
        await verifyBtc.mutateAsync({
          purchaseId,
          accountId: listing.id,
          txHash: txHash.trim(),
        });
      } else {
        if (!txHash.trim()) {
          toast.error('Please enter the transaction hash');
          return;
        }
        await verifyEth.mutateAsync({
          purchaseId,
          accountId: listing.id,
          txHash: txHash.trim(),
        });
      }
      toast.success('Payment verified! Unlocking credentials...');
      onVerified();
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error?.message || 'Payment verification failed. Please try again.');
    }
  };

  const icpAmount = formatICP(listing.priceE8s);
  const btcAmount = (Number(listing.priceE8s) / 1e8 * 0.000025).toFixed(8);
  const ethAmount = (Number(listing.priceE8s) / 1e8 * 0.0004).toFixed(6);

  return (
    <div className="space-y-4">
      {/* Payment Instructions */}
      <div className="p-4 bg-surface-raised border border-border rounded-sm space-y-3">
        {paymentMethod === 'icp' && (
          <>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Send exactly</Label>
              <div className="flex items-center justify-between p-2 bg-surface border border-gold/20 rounded-sm">
                <span className="font-display text-lg font-bold text-gold">{icpAmount}</span>
                <button
                  onClick={() => copyToClipboard(icpAmount, 'amount')}
                  className="text-muted-foreground hover:text-gold transition-colors"
                >
                  {copied === 'amount' ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">To this address</Label>
              <div className="flex items-center justify-between p-2 bg-surface border border-border rounded-sm gap-2">
                <span className="text-xs font-mono text-foreground truncate">{ICP_PAYMENT_ADDRESS}</span>
                <button
                  onClick={() => copyToClipboard(ICP_PAYMENT_ADDRESS, 'address')}
                  className="text-muted-foreground hover:text-gold transition-colors shrink-0"
                >
                  {copied === 'address' ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="blockIndex" className="text-xs text-muted-foreground uppercase tracking-wider">
                Block Index (from your wallet)
              </Label>
              <Input
                id="blockIndex"
                value={blockIndex}
                onChange={(e) => setBlockIndex(e.target.value)}
                placeholder="e.g. 12345678"
                className="bg-surface border-border focus:border-gold font-mono text-sm"
                type="number"
                min="0"
              />
            </div>
          </>
        )}

        {(paymentMethod === 'btc' || paymentMethod === 'eth') && (
          <>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Send exactly</Label>
              <div className="flex items-center justify-between p-2 bg-surface border border-gold/20 rounded-sm">
                <span className="font-display text-lg font-bold text-gold">
                  {paymentMethod === 'btc' ? `${btcAmount} BTC` : `${ethAmount} ETH`}
                </span>
                <button
                  onClick={() => copyToClipboard(paymentMethod === 'btc' ? btcAmount : ethAmount, 'amount')}
                  className="text-muted-foreground hover:text-gold transition-colors"
                >
                  {copied === 'amount' ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                To this {paymentMethod.toUpperCase()} address
              </Label>
              <div className="flex items-center justify-between p-2 bg-surface border border-border rounded-sm gap-2">
                <span className="text-xs font-mono text-foreground truncate">
                  {paymentMethod === 'btc' ? BTC_PAYMENT_ADDRESS : ETH_PAYMENT_ADDRESS}
                </span>
                <button
                  onClick={() => copyToClipboard(
                    paymentMethod === 'btc' ? BTC_PAYMENT_ADDRESS : ETH_PAYMENT_ADDRESS,
                    'address'
                  )}
                  className="text-muted-foreground hover:text-gold transition-colors shrink-0"
                >
                  {copied === 'address' ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="txHash" className="text-xs text-muted-foreground uppercase tracking-wider">
                Transaction Hash
              </Label>
              <Input
                id="txHash"
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
                placeholder={paymentMethod === 'btc' ? 'e.g. a1b2c3d4...' : 'e.g. 0x1a2b3c...'}
                className="bg-surface border-border focus:border-gold font-mono text-sm"
              />
            </div>
          </>
        )}
      </div>

      <Alert className="border-gold/20 bg-gold/5">
        <AlertTriangle className="w-4 h-4 text-gold" />
        <AlertDescription className="text-sm text-muted-foreground">
          Payment is verified on-chain. Credentials unlock only after confirmation.
        </AlertDescription>
      </Alert>

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={onBack}
          className="border-border text-muted-foreground hover:text-foreground"
          disabled={isVerifying}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={handleVerify}
          disabled={isVerifying || (paymentMethod === 'icp' ? !blockIndex.trim() : !txHash.trim())}
          className="flex-1 bg-gold text-background hover:bg-gold-bright font-semibold"
        >
          {isVerifying ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Verifying on-chain...
            </span>
          ) : (
            'Verify Payment'
          )}
        </Button>
      </div>
    </div>
  );
}
