import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, X } from 'lucide-react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { formatICP, RANK_COLORS, RANK_ICONS, generatePurchaseId } from '../../lib/utils';
import PaymentStep from './PaymentStep';
import CredentialView from './CredentialView';
import VouchPromptModal from '../vouch/VouchPromptModal';
import type { PublicListing } from '../../backend';

type PaymentMethod = 'icp' | 'btc' | 'eth';
type Step = 'select-payment' | 'payment' | 'credentials';

interface PurchaseFlowModalProps {
  listing: PublicListing;
  onClose: () => void;
}

export default function PurchaseFlowModal({ listing, onClose }: PurchaseFlowModalProps) {
  const { identity, login, loginStatus } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const [step, setStep] = useState<Step>('select-payment');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('icp');
  const [purchaseId] = useState(() => generatePurchaseId());
  const [credentialBlob, setCredentialBlob] = useState<Uint8Array | null>(null);
  const [showVouch, setShowVouch] = useState(false);

  const rankColor = RANK_COLORS[listing.rank] || RANK_COLORS['Unranked'];
  const rankIcon = RANK_ICONS[listing.rank] || '⚔️';

  const handlePaymentVerified = () => {
    setStep('credentials');
  };

  const handleCredentialsLoaded = (blob: Uint8Array) => {
    setCredentialBlob(blob);
    setShowVouch(true);
  };

  if (!isAuthenticated) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="bg-surface border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-foreground">
              Login Required
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              You must be logged in to purchase an account.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="p-4 bg-surface-raised border border-border rounded-sm flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-gold shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                Internet Identity login is required to securely link your purchase to your account and deliver credentials.
              </p>
            </div>
            <Button
              onClick={login}
              disabled={isLoggingIn}
              className="w-full bg-gold text-background hover:bg-gold-bright font-semibold"
            >
              {isLoggingIn ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Connecting...
                </span>
              ) : (
                'Login with Internet Identity'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="bg-surface border-border max-w-lg">
          {/* Account Info Header */}
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-sm bg-gold/10 border border-gold/30 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <DialogTitle className="font-display text-xl text-foreground">
                    {step === 'select-payment' && 'Purchase Account'}
                    {step === 'payment' && 'Complete Payment'}
                    {step === 'credentials' && 'Account Credentials'}
                  </DialogTitle>
                  <DialogDescription className="text-muted-foreground text-sm">
                    {step === 'select-payment' && 'Select your payment method'}
                    {step === 'payment' && 'Send payment and verify on-chain'}
                    {step === 'credentials' && 'Your purchased account details'}
                  </DialogDescription>
                </div>
              </div>
            </div>
          </DialogHeader>

          {/* Account Summary */}
          <div className="flex items-center justify-between p-3 bg-surface-raised border border-border rounded-sm">
            <div className={`flex items-center gap-2 px-2.5 py-1 rounded-sm border text-sm font-semibold ${rankColor}`}>
              <span>{rankIcon}</span>
              <span>{listing.rank}</span>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Price</p>
              <p className="font-display text-xl font-bold text-gold">{formatICP(listing.priceE8s)}</p>
            </div>
          </div>

          {/* Step Content */}
          {step === 'select-payment' && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Choose your payment method:</p>
              <div className="grid grid-cols-3 gap-3">
                {(['icp', 'btc', 'eth'] as PaymentMethod[]).map((method) => (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    className={`p-3 rounded-sm border text-center transition-all ${
                      paymentMethod === method
                        ? 'border-gold bg-gold/10 text-gold'
                        : 'border-border bg-surface-raised text-muted-foreground hover:border-gold/40 hover:text-foreground'
                    }`}
                  >
                    <div className="text-2xl mb-1">
                      {method === 'icp' ? '∞' : method === 'btc' ? '₿' : 'Ξ'}
                    </div>
                    <div className="text-xs font-semibold uppercase">{method}</div>
                  </button>
                ))}
              </div>
              <Button
                onClick={() => setStep('payment')}
                className="w-full bg-gold text-background hover:bg-gold-bright font-semibold"
              >
                Continue with {paymentMethod.toUpperCase()}
              </Button>
            </div>
          )}

          {step === 'payment' && (
            <PaymentStep
              listing={listing}
              paymentMethod={paymentMethod}
              purchaseId={purchaseId}
              onVerified={handlePaymentVerified}
              onBack={() => setStep('select-payment')}
            />
          )}

          {step === 'credentials' && (
            <CredentialView
              accountId={listing.id}
              purchaseId={purchaseId}
              onCredentialsLoaded={handleCredentialsLoaded}
            />
          )}
        </DialogContent>
      </Dialog>

      {showVouch && (
        <VouchPromptModal
          purchaseId={purchaseId}
          rank={listing.rank}
          onClose={() => setShowVouch(false)}
        />
      )}
    </>
  );
}
