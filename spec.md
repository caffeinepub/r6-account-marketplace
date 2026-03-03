# R6 Account Marketplace

## Current State

A full-stack ICP marketplace for Rainbow Six Siege accounts with:
- Motoko backend with marketplace, payment, credential vault, and vouch logic
- Admin role tracked via `adminPrincipal` variable in main.mo
- `claimAdmin()` sets `adminPrincipal` for the first authenticated caller
- `isCallerAdmin()` is provided by the `MixinAuthorization` mixin, which checks `accessControlState` — NOT `adminPrincipal`
- This mismatch means: after calling `claimAdmin()`, `isCallerAdmin()` still returns `false`, breaking the entire admin flow
- The frontend admin dashboard is accessible to non-admins because `isCallerAdmin()` always returns false
- React frontend with admin dashboard, marketplace, and vouch pages

## Requested Changes (Diff)

### Add
- Override `isCallerAdmin()` as a `query` in `main.mo` that checks `adminPrincipal` directly (supersedes the mixin's version)
- Frontend: after `claimAdmin` succeeds (any result), always invalidate and refetch `isCallerAdmin` and `isAdminClaimed`
- Frontend: AdminDashboard must not render the dashboard tabs/content at all if `isAdmin` is false (hard guard, not just a UI state)

### Modify
- `isCallerAdmin` in main.mo: replace the mixin-provided implementation with one that calls the local `isAdmin(caller)` helper
- `useClaimAdmin` in useQueries.ts: always invalidate/refetch `isCallerAdmin` and `isAdminClaimed` after any successful mutation result (not just on `#success`)
- AdminDashboard: ensure non-admins who navigate directly to `/admin` are shown the access-denied or claim screen, never the dashboard content

### Remove
- No removals

## Implementation Plan

1. In `main.mo`, add a `public query ({ caller }) func isCallerAdmin() : async Bool { isAdmin(caller) }` — this overrides the mixin and correctly checks `adminPrincipal`.
2. In `useQueries.ts` `useClaimAdmin`: move `queryClient.invalidateQueries` for both `isCallerAdmin` and `isAdminClaimed` outside the `if` condition so they fire on any successful mutation.
3. In `AdminDashboard.tsx`: confirm the guard correctly shows "Claim Admin" when `isAdminClaimed` is false, "Access Denied" when `isAdminClaimed` is true and `isAdmin` is false, and the dashboard only when `isAdmin` is true. Also handle the case where `claimSuccess` is set after claim — immediately refetch `isCallerAdmin` so the dashboard renders.
