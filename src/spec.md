# Specification

## Summary
**Goal:** Enhance the admin panel with comment list lock controls, usage tracking (available/used counts), individual comment deletion, a refresh button, dynamic button text, bulk totals dashboard, and a danger zone for clearing all lists.

**Planned changes:**
- Add lock/unlock toggle icons next to each list in the Existing Lists section to restrict customer access
- Display "85 available" (green) and "5 used" (orange) badges in the Managing interface to track comment usage
- Add a refresh button next to the delete button to reload list data and statistics
- Update "Add X Comments" button text to dynamically show the count of lines in the textarea
- Display individual comments with trash icons for deletion in the Comments in List section
- Add a "Bulk Comment Totals" dashboard section showing summary cards with list names and total counts
- Add a "Danger Zone" section at the bottom with a "Clear All Comment Lists" button
- Ensure all data (lists, comments, lock states, usage tracking) persists across page refreshes and canister upgrades

**User-visible outcome:** Admins can lock/unlock comment lists to control customer access, see real-time available vs. used comment counts, delete individual comments, refresh list data, view bulk totals in a dashboard, and clear all lists via a danger zone. All data persists reliably.
