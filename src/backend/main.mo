import Array "mo:core/Array";
import Blob "mo:core/Blob";
import Map "mo:core/Map";
import Order "mo:core/Order";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";

import Nat "mo:core/Nat";
import OutCall "http-outcalls/outcall";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  type Status = {
    #available;
    #sold;
  };

  type PaymentMethod = {
    #icp;
    #btc;
    #eth;
  };

  type AccountListing = {
    id : Text;
    rank : Text;
    priceE8s : Nat;
    specialDeal : Bool;
    status : Status;
    encryptedCredentialRef : Blob;
    rareSkinNames : ?[Text];
    rareSkinShowcaseLink : ?Text;
  };

  type PublicListing = {
    id : Text;
    rank : Text;
    priceE8s : Nat;
    specialDeal : Bool;
    status : Status;
    rareSkinNames : ?[Text];
    rareSkinShowcaseLink : ?Text;
  };

  module PublicListing {
    public func compareById(entry1 : PublicListing, entry2 : PublicListing) : Order.Order {
      Text.compare(entry1.id, entry2.id);
    };
  };

  type PurchaseRecord = {
    purchaseId : Text;
    buyerPrincipal : Principal;
    accountId : Text;
    paymentMethod : PaymentMethod;
    txHash : Text;
    timestamp : Int;
    status : {
      #pending;
      #confirmed;
      #failed;
    };
  };

  type PublicVouch = {
    anonymousUsername : Text;
    rank : Text;
    rating : Nat;
    reviewText : Text;
    timestamp : Int;
  };

  type Vouch = {
    vouchId : Text;
    purchaseId : Text;
    buyerPrincipal : Principal;
    anonymousUsername : Text;
    rank : Text;
    rating : Nat;
    reviewText : Text;
    timestamp : Int;
    hidden : Bool;
  };

  module Vouch {
    public func compareByTimestamp(entry1 : Vouch, entry2 : Vouch) : Order.Order {
      if (entry1.timestamp > entry2.timestamp) { #less }
      else if (entry1.timestamp < entry2.timestamp) { #greater }
      else { #equal };
    };
  };

  type UserProfile = {
    name : Text;
  };

  let listings = Map.empty<Text, AccountListing>();
  let purchases = Map.empty<Text, PurchaseRecord>();
  let credentials = Map.empty<Text, Blob>();
  var decryptionKey : ?Blob = null;
  let vouches = Map.empty<Text, Vouch>();
  let viewCounts = Map.empty<Text, Nat>();
  let maxViews = 5;
  let accessControlState = AccessControl.initState();
  let userProfiles = Map.empty<Principal, UserProfile>();
  var adminPrincipal : ?Principal = null;

  include MixinAuthorization(accessControlState);

  // ─── User Profile Functions ───────────────────────────────────────────────

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can get profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not isAdmin(caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // ─── Marketplace Functions ────────────────────────────────────────────────

  public shared ({ caller }) func addListing(
    id : Text,
    rank : Text,
    priceE8s : Nat,
    specialDeal : Bool,
    encryptedCredentialRef : Blob,
    rareSkinNames : ?[Text],
    rareSkinShowcaseLink : ?Text,
  ) : async () {
    if (not isAdmin(caller)) {
      Runtime.trap("Unauthorized: Admins only");
    };
    let listing : AccountListing = {
      id;
      rank;
      priceE8s;
      specialDeal;
      status = #available;
      encryptedCredentialRef;
      rareSkinNames;
      rareSkinShowcaseLink;
    };
    listings.add(id, listing);
  };

  public shared ({ caller }) func updateListingPrice(id : Text, priceE8s : Nat) : async () {
    if (not isAdmin(caller)) {
      Runtime.trap("Unauthorized: Admins only");
    };
    switch (listings.get(id)) {
      case (null) { Runtime.trap("Listing not found") };
      case (?listing) {
        listings.add(id, { listing with priceE8s });
      };
    };
  };

  public shared ({ caller }) func toggleSpecialDeal(id : Text) : async () {
    if (not isAdmin(caller)) {
      Runtime.trap("Unauthorized: Admins only");
    };
    switch (listings.get(id)) {
      case (null) { Runtime.trap("Listing not found") };
      case (?listing) {
        listings.add(id, { listing with specialDeal = not listing.specialDeal });
      };
    };
  };

  public shared ({ caller }) func markSold(id : Text) : async () {
    if (not isAdmin(caller)) {
      Runtime.trap("Unauthorized: Admins only");
    };
    switch (listings.get(id)) {
      case (null) { Runtime.trap("Listing not found") };
      case (?listing) {
        listings.add(id, { listing with status = #sold });
      };
    };
  };

  public shared ({ caller }) func updateListing(
    id : Text,
    priceE8s : Nat,
    rank : Text,
    rareSkinNames : ?[Text],
    rareSkinShowcaseLink : ?Text,
  ) : async () {
    if (not isAdmin(caller)) {
      Runtime.trap("Unauthorized: Admins only");
    };

    switch (listings.get(id)) {
      case (null) { Runtime.trap("Listing not found") };
      case (?existingListing) {
        let updatedListing = {
          existingListing with
          rank;
          priceE8s;
          rareSkinNames;
          rareSkinShowcaseLink;
        };
        listings.add(id, updatedListing);
      };
    };
  };

  public shared ({ caller }) func deleteListing(id : Text) : async () {
    if (not isAdmin(caller)) {
      Runtime.trap("Unauthorized: Admins only");
    };
    listings.remove(id);
  };

  public query func listAllListings() : async [PublicListing] {
    listings.values().toArray().map<AccountListing, PublicListing>(
      func(l) {
        {
          id = l.id;
          rank = l.rank;
          priceE8s = l.priceE8s;
          specialDeal = l.specialDeal;
          status = l.status;
          rareSkinNames = l.rareSkinNames;
          rareSkinShowcaseLink = l.rareSkinShowcaseLink;
        };
      }
    ).sort(PublicListing.compareById);
  };

  public query func filterByRank(rank : Text) : async [PublicListing] {
    listings.values().toArray().map<AccountListing, PublicListing>(
      func(l) {
        {
          id = l.id;
          rank = l.rank;
          priceE8s = l.priceE8s;
          specialDeal = l.specialDeal;
          status = l.status;
          rareSkinNames = l.rareSkinNames;
          rareSkinShowcaseLink = l.rareSkinShowcaseLink;
        };
      }
    ).filter(func(l) { l.rank == rank }).sort(PublicListing.compareById);
  };

  public query func getListingById(id : Text) : async {
    #notFound;
    #success : PublicListing;
  } {
    switch (listings.get(id)) {
      case (null) { #notFound };
      case (?l) {
        #success({
          id = l.id;
          rank = l.rank;
          priceE8s = l.priceE8s;
          specialDeal = l.specialDeal;
          status = l.status;
          rareSkinNames = l.rareSkinNames;
          rareSkinShowcaseLink = l.rareSkinShowcaseLink;
        });
      };
    };
  };

  public query func getSpecialDeals() : async [PublicListing] {
    listings.values().toArray().map<AccountListing, PublicListing>(
      func(l) {
        {
          id = l.id;
          rank = l.rank;
          priceE8s = l.priceE8s;
          specialDeal = l.specialDeal;
          status = l.status;
          rareSkinNames = l.rareSkinNames;
          rareSkinShowcaseLink = l.rareSkinShowcaseLink;
        };
      }
    ).filter(func(l) { l.specialDeal }).sort(PublicListing.compareById);
  };

  // ─── Payment Functions ────────────────────────────────────────────────────

  func _hasPurchasedInternal(buyer : Principal, accountId : Text) : Bool {
    let found = purchases.values().toArray().find(
      func(p : PurchaseRecord) : Bool {
        p.buyerPrincipal == buyer and p.accountId == accountId and p.status == #confirmed
      }
    );
    switch (found) {
      case (?_) { true };
      case (null) { false };
    };
  };

  func _hasPurchaseByIdInternal(buyer : Principal, purchaseId : Text) : Bool {
    switch (purchases.get(purchaseId)) {
      case (null) { false };
      case (?p) {
        p.buyerPrincipal == buyer and p.status == #confirmed
      };
    };
  };

  public shared ({ caller }) func verifyIcpPayment(purchaseId : Text, accountId : Text, _blockIndex : Nat) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Must be authenticated to verify payment");
    };
    let purchase : PurchaseRecord = {
      purchaseId;
      buyerPrincipal = caller;
      accountId;
      paymentMethod = #icp;
      txHash = "icp_block_" # _blockIndex.toText();
      timestamp = Time.now();
      status = #confirmed;
    };
    purchases.add(purchaseId, purchase);

    switch (listings.get(accountId)) {
      case (null) {};
      case (?listing) {
        listings.add(accountId, { listing with status = #sold });
      };
    };
  };

  public shared ({ caller }) func verifyBtcPayment(purchaseId : Text, accountId : Text, txHash : Text) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Must be authenticated to verify payment");
    };
    let purchase : PurchaseRecord = {
      purchaseId;
      buyerPrincipal = caller;
      accountId;
      paymentMethod = #btc;
      txHash;
      timestamp = Time.now();
      status = #confirmed;
    };
    purchases.add(purchaseId, purchase);

    switch (listings.get(accountId)) {
      case (null) {};
      case (?listing) {
        listings.add(accountId, { listing with status = #sold });
      };
    };
  };

  public shared ({ caller }) func verifyEthPayment(purchaseId : Text, accountId : Text, txHash : Text) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Must be authenticated to verify payment");
    };
    let purchase : PurchaseRecord = {
      purchaseId;
      buyerPrincipal = caller;
      accountId;
      paymentMethod = #eth;
      txHash;
      timestamp = Time.now();
      status = #confirmed;
    };
    purchases.add(purchaseId, purchase);

    switch (listings.get(accountId)) {
      case (null) {};
      case (?listing) {
        listings.add(accountId, { listing with status = #sold });
      };
    };
  };

  public query ({ caller }) func getPurchaseByBuyer(buyer : Principal) : async [PurchaseRecord] {
    if (caller != buyer and not isAdmin(caller)) {
      Runtime.trap("Unauthorized: Can only view your own purchases");
    };
    purchases.values().toArray().filter(func(p : PurchaseRecord) : Bool {
      p.buyerPrincipal == buyer
    });
  };

  public query ({ caller }) func hasPurchased(accountId : Text) : async Bool {
    if (caller.isAnonymous()) {
      return false;
    };
    _hasPurchasedInternal(caller, accountId);
  };

  // ─── Credential Vault Functions ───────────────────────────────────────────

  public shared ({ caller }) func uploadCredential(accountId : Text, encryptedBlob : Blob) : async () {
    if (not isAdmin(caller)) {
      Runtime.trap("Unauthorized: Admins only");
    };
    credentials.add(accountId, encryptedBlob);
  };

  public shared ({ caller }) func getCredential(accountId : Text, purchaseId : Text) : async {
    #notAuthenticated;
    #notFound;
    #notPurchased;
    #viewLimitExceeded;
    #success : Blob;
  } {
    if (caller.isAnonymous()) {
      return #notAuthenticated;
    };

    switch (purchases.get(purchaseId)) {
      case (null) { return #notPurchased };
      case (?p) {
        if (p.buyerPrincipal != caller) {
          return #notPurchased;
        };
        if (p.accountId != accountId) {
          return #notPurchased;
        };
        if (p.status != #confirmed) {
          return #notPurchased;
        };
      };
    };

    let currentCount = switch (viewCounts.get(purchaseId)) {
      case (null) { 0 };
      case (?c) { c };
    };

    if (currentCount >= maxViews) {
      return #viewLimitExceeded;
    };

    viewCounts.add(purchaseId, currentCount + 1);

    switch (credentials.get(accountId)) {
      case (null) { #notFound };
      case (?blob) { #success(blob) };
    };
  };

  public shared ({ caller }) func getDecryptionKey() : async ?Blob {
    if (not isAdmin(caller)) {
      Runtime.trap("Unauthorized: Admins only");
    };
    decryptionKey;
  };

  public shared ({ caller }) func setDecryptionKey(key : Blob) : async () {
    if (not isAdmin(caller)) {
      Runtime.trap("Unauthorized: Admins only");
    };
    decryptionKey := ?key;
  };

  // ─── Vouch Functions ──────────────────────────────────────────────────────

  public shared ({ caller }) func submitVouch(purchaseId : Text, anonymousUsername : Text, rank : Text, rating : Nat, reviewText : Text) : async {
    #notAuthenticated;
    #notPurchased;
    #invalidRating;
    #alreadyVouched;
    #success;
  } {
    if (caller.isAnonymous()) {
      return #notAuthenticated;
    };

    if (rating < 1 or rating > 5) {
      return #invalidRating;
    };

    if (not _hasPurchaseByIdInternal(caller, purchaseId)) {
      return #notPurchased;
    };

    let existingVouch = vouches.values().toArray().find(func(v : Vouch) : Bool {
      v.purchaseId == purchaseId
    });

    switch (existingVouch) {
      case (?_) { return #alreadyVouched };
      case (null) {
        let vouchId = purchaseId # "_vouch";
        let vouch : Vouch = {
          vouchId;
          purchaseId;
          buyerPrincipal = caller;
          anonymousUsername;
          rank;
          rating;
          reviewText;
          timestamp = Time.now();
          hidden = false;
        };
        vouches.add(vouchId, vouch);
        return #success;
      };
    };
  };

  public query func getPublicVouches() : async [PublicVouch] {
    vouches.values().toArray()
      .filter(func(v : Vouch) : Bool { not v.hidden })
      .map<Vouch, PublicVouch>(func(v : Vouch) : PublicVouch {
        {
          anonymousUsername = v.anonymousUsername;
          rank = v.rank;
          rating = v.rating;
          reviewText = v.reviewText;
          timestamp = v.timestamp;
        };
      })
      .sort(func(a : PublicVouch, b : PublicVouch) : Order.Order {
        if (a.timestamp > b.timestamp) { #less }
        else if (a.timestamp < b.timestamp) { #greater }
        else { #equal };
      });
  };

  public shared ({ caller }) func hideVouch(vouchId : Text) : async () {
    if (not isAdmin(caller)) {
      Runtime.trap("Unauthorized: Admins only");
    };
    switch (vouches.get(vouchId)) {
      case (null) { Runtime.trap("Vouch not found") };
      case (?vouch) {
        vouches.add(vouchId, { vouch with hidden = true });
      };
    };
  };

  public shared ({ caller }) func deleteVouch(vouchId : Text) : async () {
    if (not isAdmin(caller)) {
      Runtime.trap("Unauthorized: Admins only");
    };
    vouches.remove(vouchId);
  };

  public query ({ caller }) func getMyVouches() : async [Vouch] {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Must be authenticated to view your vouches");
    };
    vouches.values().toArray()
      .filter(func(v : Vouch) : Bool { v.buyerPrincipal == caller })
      .sort(Vouch.compareByTimestamp);
  };

  // ─── Admin Bootstrap Functions ─────────────────────────────────────────────

  public query func isAdminClaimed() : async Bool {
    isAdminSet();
  };

  public shared ({ caller }) func claimAdmin() : async {
    #alreadyClaimed;
    #success;
  } {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Must be authenticated to claim admin");
    };

    if (isAdminSet()) {
      if (isAdmin(caller)) {
        return #alreadyClaimed;
      };
      Runtime.trap("Unauthorized: Admin has already been claimed by another principal");
    };

    adminPrincipal := ?caller;
    #success;
  };

  func isAdminSet() : Bool {
    switch (adminPrincipal) {
      case (null) { false };
      case (?p) { not p.isAnonymous() };
    };
  };

  func isAdmin(caller : Principal) : Bool {
    switch (adminPrincipal) {
      case (?admin) { caller == admin };
      case (null) { false };
    };
  };
};
