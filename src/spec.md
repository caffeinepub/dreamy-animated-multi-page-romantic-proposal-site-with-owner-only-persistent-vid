# Specification

## Summary
**Goal:** Fix non-functional submit button in Admin Panel and ensure newly created comment lists appear immediately in the dropdown without page refresh.

**Planned changes:**
- Fix the "Choose a list..." button click handler so it successfully creates a new comment list and triggers backend storage
- Auto-populate newly created lists in the "Manage Existing Lists" dropdown immediately after creation by invalidating React Query cache
- Clear the list name input field after successful creation
- Fix all button click event handlers throughout the Admin Panel to respond properly in production
- Optimize form submission and list rendering to reduce response time and eliminate UI glitches

**User-visible outcome:** Admin users can create new comment lists (like "App7") by clicking the submit button, see them immediately appear in the dropdown below, and continue creating additional lists without manual page refresh or input clearing.
