import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { PublicListing, PublicVouch, Vouch, PurchaseRecord } from '../backend';

// ─── Listings ────────────────────────────────────────────────────────────────

export function useListAllListings() {
  const { actor, isFetching } = useActor();
  return useQuery<PublicListing[]>({
    queryKey: ['listings'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listAllListings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useFilterByRank(rank: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<PublicListing[]>({
    queryKey: ['listings', 'rank', rank],
    queryFn: async () => {
      if (!actor) return [];
      if (!rank) return actor.listAllListings();
      return actor.filterByRank(rank);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetSpecialDeals() {
  const { actor, isFetching } = useActor();
  return useQuery<PublicListing[]>({
    queryKey: ['listings', 'special'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSpecialDeals();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetListingById(id: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ['listing', id],
    queryFn: async () => {
      if (!actor || !id) return null;
      const result = await actor.getListingById(id);
      // Use __kind__ (double underscore) as per backend interface
      if (result.__kind__ === 'success') return result.success;
      return null;
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

// ─── Payment ─────────────────────────────────────────────────────────────────

export function useVerifyIcpPayment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      purchaseId,
      accountId,
      blockIndex,
    }: {
      purchaseId: string;
      accountId: string;
      blockIndex: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.verifyIcpPayment(purchaseId, accountId, blockIndex);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
    },
  });
}

export function useVerifyBtcPayment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      purchaseId,
      accountId,
      txHash,
    }: {
      purchaseId: string;
      accountId: string;
      txHash: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.verifyBtcPayment(purchaseId, accountId, txHash);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
    },
  });
}

export function useVerifyEthPayment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      purchaseId,
      accountId,
      txHash,
    }: {
      purchaseId: string;
      accountId: string;
      txHash: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.verifyEthPayment(purchaseId, accountId, txHash);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
    },
  });
}

// ─── Credentials ─────────────────────────────────────────────────────────────

export function useGetCredential() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      accountId,
      purchaseId,
    }: {
      accountId: string;
      purchaseId: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCredential(accountId, purchaseId);
    },
  });
}

export function useGetPurchasesByBuyer() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<PurchaseRecord[]>({
    queryKey: ['purchases', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return [];
      return actor.getPurchaseByBuyer(identity.getPrincipal());
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useHasPurchased(accountId: string | null) {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<boolean>({
    queryKey: ['hasPurchased', accountId, identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !accountId) return false;
      return actor.hasPurchased(accountId);
    },
    enabled: !!actor && !isFetching && !!identity && !!accountId,
  });
}

// ─── Vouches ─────────────────────────────────────────────────────────────────

export function useGetPublicVouches() {
  const { actor, isFetching } = useActor();
  return useQuery<PublicVouch[]>({
    queryKey: ['vouches', 'public'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPublicVouches();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetMyVouches() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<Vouch[]>({
    queryKey: ['vouches', 'mine', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyVouches();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useSubmitVouch() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      purchaseId,
      anonymousUsername,
      rank,
      rating,
      reviewText,
    }: {
      purchaseId: string;
      anonymousUsername: string;
      rank: string;
      rating: bigint;
      reviewText: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitVouch(purchaseId, anonymousUsername, rank, rating, reviewText);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vouches'] });
    },
  });
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export function useAddListing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      rank,
      priceE8s,
      specialDeal,
      encryptedCredentialRef,
    }: {
      id: string;
      rank: string;
      priceE8s: bigint;
      specialDeal: boolean;
      encryptedCredentialRef: Uint8Array;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addListing(id, rank, priceE8s, specialDeal, encryptedCredentialRef);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
  });
}

export function useUpdateListingPrice() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, priceE8s }: { id: string; priceE8s: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateListingPrice(id, priceE8s);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
  });
}

export function useToggleSpecialDeal() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.toggleSpecialDeal(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
  });
}

export function useMarkSold() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.markSold(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
  });
}

export function useDeleteListing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteListing(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
  });
}

export function useUploadCredential() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      accountId,
      encryptedBlob,
    }: {
      accountId: string;
      encryptedBlob: Uint8Array;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.uploadCredential(accountId, encryptedBlob);
    },
  });
}

export function useHideVouch() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vouchId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.hideVouch(vouchId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vouches'] });
    },
  });
}

export function useDeleteVouch() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vouchId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteVouch(vouchId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vouches'] });
    },
  });
}

export function useSetDecryptionKey() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (key: Uint8Array) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setDecryptionKey(key);
    },
  });
}

export function useGetDecryptionKey() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<Uint8Array | null>({
    queryKey: ['decryptionKey'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getDecryptionKey();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useAssignCallerUserRole() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ principal, role }: { principal: string; role: import('../backend').UserRole }) => {
      if (!actor) throw new Error('Actor not available');
      const { Principal } = await import('@dfinity/principal');
      return actor.assignCallerUserRole(Principal.fromText(principal), role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isCallerAdmin'] });
    },
  });
}

// ─── Admin Bootstrap ──────────────────────────────────────────────────────────

export function useClaimAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.claimAdmin();
    },
    onSuccess: (result) => {
      if (result === 'success') {
        // Invalidate admin status so the dashboard re-checks and renders
        queryClient.invalidateQueries({ queryKey: ['isCallerAdmin'] });
      }
    },
  });
}
