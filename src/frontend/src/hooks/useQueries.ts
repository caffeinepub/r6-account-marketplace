import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  PublicListing,
  PublicVouch,
  PurchaseRecord,
  UserProfile,
  Vouch,
} from "../backend";
import { type UserRole, Variant_success_alreadyClaimed } from "../backend";
import { useActor } from "./useActor";

// ─── Listings ────────────────────────────────────────────────────────────────

export function useListAllListings() {
  const { actor, isFetching } = useActor();
  return useQuery<PublicListing[]>({
    queryKey: ["listings"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listAllListings();
    },
    enabled: !!actor && !isFetching,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}

export function useFilterByRank(rank: string) {
  const { actor, isFetching } = useActor();
  return useQuery<PublicListing[]>({
    queryKey: ["listings", "rank", rank],
    queryFn: async () => {
      if (!actor) return [];
      return actor.filterByRank(rank);
    },
    enabled: !!actor && !isFetching && !!rank,
  });
}

export function useGetListingById(id: string) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["listing", id],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getListingById(id);
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

export function useGetSpecialDeals() {
  const { actor, isFetching } = useActor();
  return useQuery<PublicListing[]>({
    queryKey: ["specialDeals"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSpecialDeals();
    },
    enabled: !!actor && !isFetching,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}

export function useAddListing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      id: string;
      rank: string;
      priceE8s: bigint;
      specialDeal: boolean;
      encryptedCredentialRef: Uint8Array;
      rareSkinNames: string[] | null;
      rareSkinShowcaseLink: string | null;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addListing(
        params.id,
        params.rank,
        params.priceE8s,
        params.specialDeal,
        params.encryptedCredentialRef,
        params.rareSkinNames,
        params.rareSkinShowcaseLink,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      queryClient.invalidateQueries({ queryKey: ["specialDeals"] });
      queryClient.refetchQueries({ queryKey: ["listings"] });
      queryClient.refetchQueries({ queryKey: ["specialDeals"] });
    },
  });
}

export function useUpdateListing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      id: string;
      priceE8s: bigint;
      rank: string;
      rareSkinNames: string[] | null;
      rareSkinShowcaseLink: string | null;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateListing(
        params.id,
        params.priceE8s,
        params.rank,
        params.rareSkinNames,
        params.rareSkinShowcaseLink,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      queryClient.invalidateQueries({ queryKey: ["specialDeals"] });
      queryClient.refetchQueries({ queryKey: ["listings"] });
      queryClient.refetchQueries({ queryKey: ["specialDeals"] });
    },
  });
}

export function useDeleteListing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteListing(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      queryClient.invalidateQueries({ queryKey: ["specialDeals"] });
      queryClient.refetchQueries({ queryKey: ["listings"] });
      queryClient.refetchQueries({ queryKey: ["specialDeals"] });
    },
  });
}

export function useToggleSpecialDeal() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.toggleSpecialDeal(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      queryClient.invalidateQueries({ queryKey: ["specialDeals"] });
      queryClient.refetchQueries({ queryKey: ["listings"] });
      queryClient.refetchQueries({ queryKey: ["specialDeals"] });
    },
  });
}

export function useMarkSold() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.markSold(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      queryClient.refetchQueries({ queryKey: ["listings"] });
    },
  });
}

// ─── Purchases ───────────────────────────────────────────────────────────────

export function useGetPurchaseByBuyer(buyerPrincipal: string | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery<PurchaseRecord[]>({
    queryKey: ["purchases", buyerPrincipal],
    queryFn: async () => {
      if (!actor || !buyerPrincipal) return [];
      const { Principal } = await import("@dfinity/principal");
      return actor.getPurchaseByBuyer(Principal.fromText(buyerPrincipal));
    },
    enabled: !!actor && !isFetching && !!buyerPrincipal,
  });
}

export function useHasPurchased(accountId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["hasPurchased", accountId],
    queryFn: async () => {
      if (!actor) return false;
      return actor.hasPurchased(accountId);
    },
    enabled: !!actor && !isFetching && !!accountId,
  });
}

export function useVerifyIcpPayment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      purchaseId: string;
      accountId: string;
      blockIndex: bigint;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.verifyIcpPayment(
        params.purchaseId,
        params.accountId,
        params.blockIndex,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
    },
  });
}

export function useVerifyBtcPayment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      purchaseId: string;
      accountId: string;
      txHash: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.verifyBtcPayment(
        params.purchaseId,
        params.accountId,
        params.txHash,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
    },
  });
}

export function useVerifyEthPayment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      purchaseId: string;
      accountId: string;
      txHash: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.verifyEthPayment(
        params.purchaseId,
        params.accountId,
        params.txHash,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
    },
  });
}

// ─── Credentials ─────────────────────────────────────────────────────────────

export function useGetCredential() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (params: { accountId: string; purchaseId: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCredential(params.accountId, params.purchaseId);
    },
  });
}

export function useUploadCredential() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (params: {
      accountId: string;
      encryptedBlob: Uint8Array;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.uploadCredential(params.accountId, params.encryptedBlob);
    },
  });
}

export function useGetDecryptionKey() {
  const { actor, isFetching } = useActor();
  return useQuery<Uint8Array | null>({
    queryKey: ["decryptionKey"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getDecryptionKey();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetDecryptionKey() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (key: Uint8Array) => {
      if (!actor) throw new Error("Actor not available");
      return actor.setDecryptionKey(key);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["decryptionKey"] });
    },
  });
}

// ─── Vouches ─────────────────────────────────────────────────────────────────

export function useGetPublicVouches() {
  const { actor, isFetching } = useActor();
  return useQuery<PublicVouch[]>({
    queryKey: ["publicVouches"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPublicVouches();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetMyVouches() {
  const { actor, isFetching } = useActor();
  return useQuery<Vouch[]>({
    queryKey: ["myVouches"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyVouches();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSubmitVouch() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      purchaseId: string;
      anonymousUsername: string;
      rank: string;
      rating: bigint;
      reviewText: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.submitVouch(
        params.purchaseId,
        params.anonymousUsername,
        params.rank,
        params.rating,
        params.reviewText,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["publicVouches"] });
      queryClient.invalidateQueries({ queryKey: ["myVouches"] });
    },
  });
}

export function useHideVouch() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vouchId: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.hideVouch(vouchId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["publicVouches"] });
    },
  });
}

export function useDeleteVouch() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vouchId: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteVouch(vouchId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["publicVouches"] });
    },
  });
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isCallerAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsAdminClaimed() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdminClaimed"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isAdminClaimed();
    },
    enabled: !!actor && !isFetching,
    staleTime: 0,
  });
}

export function useClaimAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.claimAdmin();
    },
    onSuccess: () => {
      // Always refetch admin status after any claim attempt, regardless of result
      queryClient.invalidateQueries({ queryKey: ["isCallerAdmin"] });
      queryClient.invalidateQueries({ queryKey: ["isAdminClaimed"] });
      queryClient.refetchQueries({ queryKey: ["isCallerAdmin"] });
      queryClient.refetchQueries({ queryKey: ["isAdminClaimed"] });
    },
  });
}

export function useAssignCallerUserRole() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { principal: string; role: UserRole }) => {
      if (!actor) throw new Error("Actor not available");
      const { Principal } = await import("@dfinity/principal");
      return actor.assignCallerUserRole(
        Principal.fromText(params.principal),
        params.role,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["isCallerAdmin"] });
    },
  });
}

// ─── User Profiles ────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Actor not available");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}
