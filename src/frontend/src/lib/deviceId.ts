// Device ID and single-generation tracking utilities

const DEVICE_ID_KEY = 'app_review_device_id';
const USED_LISTS_KEY = 'app_review_used_single_lists';

/**
 * Get or create a stable device identifier for this browser
 */
export function getDeviceId(): string {
  try {
    let deviceId = localStorage.getItem(DEVICE_ID_KEY);
    
    if (!deviceId) {
      // Generate a random device ID
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      localStorage.setItem(DEVICE_ID_KEY, deviceId);
      console.log('[deviceId] Generated new device ID:', deviceId);
    } else {
      console.log('[deviceId] Retrieved existing device ID:', deviceId);
    }
    
    return deviceId;
  } catch (error) {
    console.error('[deviceId] Error accessing localStorage:', error);
    // Fallback to session-based ID if localStorage fails
    return `device_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }
}

/**
 * Check if a list has been used for single generation on this device
 */
export function isListUsedForSingleGeneration(listName: string): boolean {
  try {
    const usedListsJson = localStorage.getItem(USED_LISTS_KEY);
    if (!usedListsJson) return false;
    
    const usedLists: string[] = JSON.parse(usedListsJson);
    return usedLists.includes(listName);
  } catch (error) {
    console.error('[deviceId] Error checking used lists:', error);
    return false;
  }
}

/**
 * Mark a list as used for single generation on this device
 */
export function markListAsUsedForSingleGeneration(listName: string): void {
  try {
    const usedListsJson = localStorage.getItem(USED_LISTS_KEY);
    let usedLists: string[] = [];
    
    if (usedListsJson) {
      try {
        usedLists = JSON.parse(usedListsJson);
      } catch {
        usedLists = [];
      }
    }
    
    if (!usedLists.includes(listName)) {
      usedLists.push(listName);
      localStorage.setItem(USED_LISTS_KEY, JSON.stringify(usedLists));
      console.log('[deviceId] Marked list as used:', listName);
    }
  } catch (error) {
    console.error('[deviceId] Error marking list as used:', error);
  }
}
