# Specification

## Summary
**Goal:** Add a one-time admin bootstrap mechanism so the first authenticated caller can claim the admin role, with all subsequent grants still requiring an existing admin.

**Planned changes:**
- Add a `claimAdmin` backend function that grants admin to the first authenticated (non-anonymous) caller; rejects all subsequent claims once an admin is set
- Anonymous callers are rejected by `claimAdmin`
- All existing admin-gated functions continue to enforce the stored `adminPrincipal` unchanged
- On the frontend Admin Dashboard, show a prominent "Claim Admin" button when no admin has been claimed yet (instead of "Access Denied")
- On successful claim, refresh admin status and render the full dashboard; on failure, show an error toast and display "Access Denied"

**User-visible outcome:** The first user to log in and visit the Admin Dashboard can click "Claim Admin" to become the admin. Subsequent visitors who are not the admin see the standard "Access Denied" message, and the existing admin can still transfer the role via `updateAdmin`.
