# Specification

## Summary
**Goal:** Fix the "Create New Comment List" functionality so administrators can successfully create comment lists through the Admin Panel interface.

**Planned changes:**
- Implement backend Motoko function to create and persist new comment lists with provided list IDs
- Wire the "Create" button in the "Create New Comment List" section to call the backend function with the entered list ID
- Add input validation to prevent empty list ID submission
- Display loading state and disable the button during creation to prevent duplicate requests
- Show success/error toast notifications and update the comment list dropdown after creation

**User-visible outcome:** Administrators can create new comment lists by entering a list ID and clicking "Create", with immediate feedback and the new list appearing in the dropdown selector.
