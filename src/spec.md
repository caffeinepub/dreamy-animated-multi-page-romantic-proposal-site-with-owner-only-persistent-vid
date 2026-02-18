# Specification

## Summary
**Goal:** Rebuild the Comment Generator app UI and backend flows to closely match the uploaded mobile screenshots, covering Customer View, Upload Section, and an admin-gated Admin Panel.

**Planned changes:**
- Rework top-level navigation into a segmented control with three sections: Customer View, Upload Section, Admin Panel; highlight the active section and switch views without full reload.
- Implement Customer View UI with two cards: Single Comment Generator (requires comment list selection; generates one comment and marks it used per user/device) and Bulk Comment Generator (requires list selection + quantity; requires an admin-managed access key; generates multiple comments and marks them used).
- Implement Upload Section UI with an “Upload Rating Image” card (name input + image file picker) and backend persistence for image blob + uploader metadata; show success state and reset form after upload.
- Implement Admin Panel UI gated by existing URL-hash token mechanism (caffeineAdminToken), with secondary tabs: Comments, Images, Chat, Settings.
- Admin → Comments tab: comment list management matching screenshots (create list, select existing lists, managing header with counts, reset/delete controls, bulk vs single add modes, per-comment delete, and totals summary).
- Admin → Settings tab: Bulk Generator Access Key management (status, masked key display, reset, set/update with show/hide).
- Admin → Images tab: list/grid of uploaded rating images with uploader name, timestamp, thumbnail preview, and delete.
- Admin → Chat tab: add and display an ordered message list; persist messages in backend.
- Replace current backend live-events storage/APIs with persistent storage for comment lists/comments/usage tracking, uploaded images, chat messages, and bulk access key; add methods required by the screens.
- Add/adjust backend migration/upgrade logic so upgrading from existing deployed state does not trap and initializes the new state cleanly.
- Apply a consistent screenshot-like visual theme (pastel/confetti background, rounded cards, soft shadows, blue→teal gradient primary buttons) across all sections and reference a static background asset from `frontend/public/assets/generated`.

**User-visible outcome:** Users can switch between Customer View and Upload Section to generate single/bulk comments (bulk gated by an access key) and upload rating images; admins (with the existing token) can manage comment lists, uploaded images, chat messages, and the bulk access key in a mobile-friendly panel that matches the screenshots.
