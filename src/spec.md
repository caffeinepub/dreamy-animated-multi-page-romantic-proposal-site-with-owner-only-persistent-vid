# Specification

## Summary
**Goal:** Enforce a “one single comment per list per device” rule for the single-comment generator flow, with backend validation and frontend UI prevention/error handling.

**Planned changes:**
- Backend: add/update the single-comment generation API to require a device identifier and reject repeat requests for the same (device, listName) with a clear English error; allow other listNames; keep bulk generation unchanged.
- Backend: add/extend persisted state and migration (if applicable) to initialize per-(device, listName) single-generation tracking without breaking existing deployments.
- Frontend (Customer View): generate/persist a device identifier in local storage; call the backend single-comment API with it; after first successful single generation for a list, disable the single-generate button for that list (or show an English error); if backend rejects due to the rule, show an English error and ensure the button is disabled for that list; keep bulk UI unchanged.

**User-visible outcome:** A user can generate a single comment once per list on their device; further attempts for the same list show a clear English error and/or the single-generate button is disabled, while bulk generation works as before.
