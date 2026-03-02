# Specification

## Summary
**Goal:** Add Rare Skins tagging/filtering, fix Special Deals visibility, rebrand to Ascension's Market, remove caffeine.ai attribution, and implement first-login admin claim.

**Planned changes:**
- Extend the backend `AccountListing` data model with `rareSkinNames` (list of strings) and `rareSkinShowcaseLink` (optional URL); update `addListing` and `updateListing` to accept these fields; return them in all public listing queries.
- Add a "Rare Skins" filter button next to the Unranked filter on the marketplace page; filtering shows only listings with at least one tagged skin name.
- Display skin name badge chips on listing cards when `rareSkinNames` is non-empty; show a "View Skins" external link when `rareSkinShowcaseLink` is set; omit the skins section entirely when empty.
- Add a Rare Skins tag input panel in the Admin Dashboard Listings Management section (type → Enter → chip appears, removable) plus a showcase URL text input and Save button, pre-populated when editing.
- Investigate and fix why the Special Deals section is not appearing; audit the component, query hook, backend query, and rendering logic so the section renders whenever at least one listing has `specialDeal = true`.
- Remove all "Built with caffeine.ai" branding text, links, and attribution from the entire frontend (Footer and any other location).
- Rename all user-facing references from "R6 Market" to "Ascension's Market" across page titles, Header, Footer, hero section, Admin Dashboard, and all string literals.
- Update the backend `claimAdmin` function so the first non-anonymous caller is permanently granted admin; subsequent non-admin calls are rejected; anonymous principals cannot claim admin.
- Update the frontend Admin Dashboard to show the "Claim Admin" button only when no admin is set; show "Access Denied" for rejected non-admin attempts.

**User-visible outcome:** The marketplace is fully rebranded as Ascension's Market, Special Deals appear correctly, admins can tag and showcase rare skins on listings with a dedicated filter, caffeine.ai branding is gone, and the first authenticated user to visit the admin page securely claims permanent admin rights.
