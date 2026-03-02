import Map "mo:core/Map";
import Principal "mo:core/Principal";

module {
  type AccountListing = {
    id : Text;
    rank : Text;
    priceE8s : Nat;
    specialDeal : Bool;
    status : {
      #available;
      #sold;
    };
    encryptedCredentialRef : Blob;
  };

  type PurchaseRecord = {
    purchaseId : Text;
    buyerPrincipal : Principal;
    accountId : Text;
    paymentMethod : {
      #icp;
      #btc;
      #eth;
    };
    txHash : Text;
    timestamp : Int;
    status : {
      #pending;
      #confirmed;
      #failed;
    };
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

  type UserProfile = {
    name : Text;
  };

  type OldActor = {
    listings : Map.Map<Text, AccountListing>;
    purchases : Map.Map<Text, PurchaseRecord>;
    credentials : Map.Map<Text, Blob>;
    decryptionKey : ?Blob;
    vouches : Map.Map<Text, Vouch>;
    viewCounts : Map.Map<Text, Nat>;
    maxViews : Nat;
    userProfiles : Map.Map<Principal, UserProfile>;
    accessControlState : { // Retain access control state type
      var adminAssigned : Bool;
      userRoles : Map.Map<Principal, { #admin; #user; #guest }>;
    };
  };

  type NewActor = {
    listings : Map.Map<Text, AccountListing>;
    purchases : Map.Map<Text, PurchaseRecord>;
    credentials : Map.Map<Text, Blob>;
    decryptionKey : ?Blob;
    vouches : Map.Map<Text, Vouch>;
    viewCounts : Map.Map<Text, Nat>;
    maxViews : Nat;
    userProfiles : Map.Map<Principal, UserProfile>;
    adminPrincipal : ?Principal;
    accessControlState : { // Retain access control state type
      var adminAssigned : Bool;
      userRoles : Map.Map<Principal, { #admin; #user; #guest }>;
    };
  };

  public func run(old : OldActor) : NewActor {
    { old with adminPrincipal = null };
  };
};
