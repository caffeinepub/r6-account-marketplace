import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, MessageSquare, X } from 'lucide-react';
import StarRating from './StarRating';
import { useSubmitVouch } from '../../hooks/useQueries';
import { RANK_COLORS, RANK_ICONS } from '../../lib/utils';
import { toast } from 'sonner';
import { Variant_notAuthenticated_notPurchased_alreadyVouched_success_invalidRating } from '../../backend';

interface VouchPromptModalProps {
  purchaseId: string;
  rank: string;
  onClose: () => void;
}

export default function VouchPromptModal({ purchaseId, rank, onClose }: VouchPromptModalProps) {
  const [username, setUsername] = useState('');
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const submitVouch = useSubmitVouch();
  const rankColor = RANK_COLORS[rank] || RANK_COLORS['Unranked'];
  const rankIcon = RANK_ICONS[rank] || '⚔️';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || rating === 0) return;

    try {
      const result = await submitVouch.mutateAsync({
        purchaseId,
        anonymousUsername: username.trim(),
        rank,
        rating: BigInt(rating),
        reviewText: reviewText.trim(),
      });

      if (result === Variant_notAuthenticated_notPurchased_alreadyVouched_success_invalidRating.success) {
        setSubmitted(true);
        toast.success('Review submitted! Thank you.');
      } else if (result === Variant_notAuthenticated_notPurchased_alreadyVouched_success_invalidRating.alreadyVouched) {
        toast.info('You have already submitted a review for this purchase.');
        onClose();
      } else if (result === Variant_notAuthenticated_notPurchased_alreadyVouched_success_invalidRating.notAuthenticated) {
        toast.error('You must be logged in to submit a review.');
      } else if (result === Variant_notAuthenticated_notPurchased_alreadyVouched_success_invalidRating.notPurchased) {
        toast.error('No confirmed purchase found for this review.');
      } else if (result === Variant_notAuthenticated_notPurchased_alreadyVouched_success_invalidRating.invalidRating) {
        toast.error('Invalid rating. Please select 1-5 stars.');
      }
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error?.message || 'Failed to submit review.');
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-surface border-border max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-sm bg-gold/10 border border-gold/30 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-gold" />
            </div>
            <div>
              <DialogTitle className="font-display text-xl text-foreground">
                Leave a Review
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm">
                Help other buyers with your experience
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {submitted ? (
          <div className="text-center py-6 space-y-3 animate-slide-up">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto" />
            <p className="font-display text-xl font-bold text-foreground">Thank You!</p>
            <p className="text-sm text-muted-foreground">Your review has been submitted and will be visible publicly.</p>
            <Button
              onClick={onClose}
              className="bg-gold text-background hover:bg-gold-bright font-semibold"
            >
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            {/* Rank (read-only) */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Account rank:</span>
              <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-sm border text-sm font-semibold ${rankColor}`}>
                <span>{rankIcon}</span>
                <span>{rank}</span>
              </span>
            </div>

            {/* Anonymous Username */}
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-sm font-medium text-foreground">
                Anonymous Username <span className="text-crimson-bright">*</span>
              </Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. SilentOperator99"
                className="bg-surface-raised border-border focus:border-gold"
                maxLength={32}
                required
              />
            </div>

            {/* Star Rating */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-foreground">
                Rating <span className="text-crimson-bright">*</span>
              </Label>
              <StarRating value={rating} onChange={setRating} />
            </div>

            {/* Review Text */}
            <div className="space-y-1.5">
              <Label htmlFor="review" className="text-sm font-medium text-foreground">
                Review <span className="text-muted-foreground text-xs">(optional)</span>
              </Label>
              <Textarea
                id="review"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share your experience..."
                className="bg-surface-raised border-border focus:border-gold resize-none"
                rows={3}
                maxLength={500}
              />
            </div>

            <div className="flex gap-3 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-border text-muted-foreground hover:text-foreground"
              >
                Skip
              </Button>
              <Button
                type="submit"
                disabled={!username.trim() || rating === 0 || submitVouch.isPending}
                className="flex-1 bg-gold text-background hover:bg-gold-bright font-semibold"
              >
                {submitVouch.isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </span>
                ) : (
                  'Submit Review'
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
