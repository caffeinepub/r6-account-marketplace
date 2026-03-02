import Map "mo:core/Map";
import Principal "mo:core/Principal";

module {
  type Status = { #available; #sold };
  type PaymentMethod = { #icp; #btc; #eth };
  type UserProfile = { name : Text };

  // Old data type without rareSkin fields
  type OldAccountListing = {
    id : Text;
    rank : Text;
    priceE8s : Nat;
    specialDeal : Bool;
    status : Status;
    encryptedCredentialRef : Blob;
  };

  type OldPublicListing = {
    id : Text;
    rank : Text;
    priceE8s : Nat;
    specialDeal : Bool;
    status : Status;
  };

  // New data type with rareSkin fields
  type NewAccountListing = {
    id : Text;
    rank : Text;
    priceE8s : Nat;
    specialDeal : Bool;
    status : Status;
    encryptedCredentialRef : Blob;
    rareSkinNames : ?[Text];
    rareSkinShowcaseLink : ?Text;
  };

  // Old actor state
  type OldActor = {
    listings : Map.Map<Text, OldAccountListing>;
    purchases : Map.Map<Text, {
      purchaseId : Text;
      buyerPrincipal : Principal.Principal;
      accountId : Text;
      paymentMethod : PaymentMethod;
      txHash : Text;
      timestamp : Int;
      status : { #pending; #confirmed; #failed };
    }>;
    credentials : Map.Map<Text, Blob>;
    decryptionKey : ?Blob;
    vouches : Map.Map<Text, {
      vouchId : Text;
      purchaseId : Text;
      buyerPrincipal : Principal.Principal;
      anonymousUsername : Text;
      rank : Text;
      rating : Nat;
      reviewText : Text;
      timestamp : Int;
      hidden : Bool;
    }>;
    viewCounts : Map.Map<Text, Nat>;
    maxViews : Nat;
    userProfiles : Map.Map<Principal.Principal, UserProfile>;
    adminPrincipal : ?Principal.Principal;
  };

  // New actor state type with new listing values
  type NewActor = {
    listings : Map.Map<Text, NewAccountListing>;
    purchases : Map.Map<Text, {
      purchaseId : Text;
      buyerPrincipal : Principal.Principal;
      accountId : Text;
      paymentMethod : PaymentMethod;
      txHash : Text;
      timestamp : Int;
      status : { #pending; #confirmed; #failed };
    }>;
    credentials : Map.Map<Text, Blob>;
    decryptionKey : ?Blob;
    vouches : Map.Map<Text, {
      vouchId : Text;
      purchaseId : Text;
      buyerPrincipal : Principal.Principal;
      anonymousUsername : Text;
      rank : Text;
      rating : Nat;
      reviewText : Text;
      timestamp : Int;
      hidden : Bool;
    }>;
    viewCounts : Map.Map<Text, Nat>;
    maxViews : Nat;
    userProfiles : Map.Map<Principal.Principal, UserProfile>;
    adminPrincipal : ?Principal.Principal;
  };

  public func run(old : OldActor) : NewActor {
    // Transform listings to include new fields with default values
    let newListings = old.listings.map<Text, OldAccountListing, NewAccountListing>(
      func(_id, oldListing) {
        {
          oldListing with
          rareSkinNames = null;
          rareSkinShowcaseLink = null;
        };
      }
    );
    { old with listings = newListings };
  };
};
