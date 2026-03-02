import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface PublicVouch {
    rank: string;
    reviewText: string;
    timestamp: bigint;
    rating: bigint;
    anonymousUsername: string;
}
export interface PurchaseRecord {
    status: Variant_pending_confirmed_failed;
    paymentMethod: PaymentMethod;
    accountId: string;
    timestamp: bigint;
    buyerPrincipal: Principal;
    txHash: string;
    purchaseId: string;
}
export interface PublicListing {
    id: string;
    status: Status;
    rank: string;
    rareSkinShowcaseLink?: string;
    specialDeal: boolean;
    rareSkinNames?: Array<string>;
    priceE8s: bigint;
}
export interface Vouch {
    vouchId: string;
    rank: string;
    hidden: boolean;
    reviewText: string;
    timestamp: bigint;
    buyerPrincipal: Principal;
    rating: bigint;
    purchaseId: string;
    anonymousUsername: string;
}
export interface UserProfile {
    name: string;
}
export enum PaymentMethod {
    btc = "btc",
    eth = "eth",
    icp = "icp"
}
export enum Status {
    sold = "sold",
    available = "available"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_notAuthenticated_notPurchased_alreadyVouched_success_invalidRating {
    notAuthenticated = "notAuthenticated",
    notPurchased = "notPurchased",
    alreadyVouched = "alreadyVouched",
    success = "success",
    invalidRating = "invalidRating"
}
export enum Variant_pending_confirmed_failed {
    pending = "pending",
    confirmed = "confirmed",
    failed = "failed"
}
export enum Variant_success_alreadyClaimed {
    success = "success",
    alreadyClaimed = "alreadyClaimed"
}
export interface backendInterface {
    addListing(id: string, rank: string, priceE8s: bigint, specialDeal: boolean, encryptedCredentialRef: Uint8Array, rareSkinNames: Array<string> | null, rareSkinShowcaseLink: string | null): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    claimAdmin(): Promise<Variant_success_alreadyClaimed>;
    deleteListing(id: string): Promise<void>;
    deleteVouch(vouchId: string): Promise<void>;
    filterByRank(rank: string): Promise<Array<PublicListing>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCredential(accountId: string, purchaseId: string): Promise<{
        __kind__: "viewLimitExceeded";
        viewLimitExceeded: null;
    } | {
        __kind__: "notAuthenticated";
        notAuthenticated: null;
    } | {
        __kind__: "notPurchased";
        notPurchased: null;
    } | {
        __kind__: "notFound";
        notFound: null;
    } | {
        __kind__: "success";
        success: Uint8Array;
    }>;
    getDecryptionKey(): Promise<Uint8Array | null>;
    getListingById(id: string): Promise<{
        __kind__: "notFound";
        notFound: null;
    } | {
        __kind__: "success";
        success: PublicListing;
    }>;
    getMyVouches(): Promise<Array<Vouch>>;
    getPublicVouches(): Promise<Array<PublicVouch>>;
    getPurchaseByBuyer(buyer: Principal): Promise<Array<PurchaseRecord>>;
    getSpecialDeals(): Promise<Array<PublicListing>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    hasPurchased(accountId: string): Promise<boolean>;
    hideVouch(vouchId: string): Promise<void>;
    isAdminClaimed(): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    listAllListings(): Promise<Array<PublicListing>>;
    markSold(id: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setDecryptionKey(key: Uint8Array): Promise<void>;
    submitVouch(purchaseId: string, anonymousUsername: string, rank: string, rating: bigint, reviewText: string): Promise<Variant_notAuthenticated_notPurchased_alreadyVouched_success_invalidRating>;
    toggleSpecialDeal(id: string): Promise<void>;
    updateListing(id: string, priceE8s: bigint, rank: string, rareSkinNames: Array<string> | null, rareSkinShowcaseLink: string | null): Promise<void>;
    updateListingPrice(id: string, priceE8s: bigint): Promise<void>;
    uploadCredential(accountId: string, encryptedBlob: Uint8Array): Promise<void>;
    verifyBtcPayment(purchaseId: string, accountId: string, txHash: string): Promise<void>;
    verifyEthPayment(purchaseId: string, accountId: string, txHash: string): Promise<void>;
    verifyIcpPayment(purchaseId: string, accountId: string, _blockIndex: bigint): Promise<void>;
}
