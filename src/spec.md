# Specification

## Summary
**Goal:** Fix the comment list creation feature so users can successfully create new lists without getting stuck in a loading state.

**Planned changes:**
- Fix backend createCommentList method to properly persist new comment lists in stable storage and return success confirmation
- Fix frontend async handling in useAdminComments.ts and AdminCommentsTab.tsx to properly await backend response
- Update the 'Manage Existing Lists' dropdown to automatically refresh and display newly created lists after successful creation
- Add proper error handling and user feedback for list creation failures

**User-visible outcome:** Users can successfully create new comment lists (like "Story tv"), see the loading state resolve, receive success/error feedback, and immediately see their new list appear in the "Select List" dropdown for management.
