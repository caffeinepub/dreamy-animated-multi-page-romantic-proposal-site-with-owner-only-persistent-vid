import { useState, useEffect } from 'react';

const ADMIN_TOKEN_KEY = 'caffeineAdminToken';
const VALID_TOKEN = '58ebdf1dde2d6a60e17661aa11e8083a776a56383dbddcb33a89964a1f68a22b';

export function useAdminToken() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check URL hash for token
    const hash = window.location.hash;
    const match = hash.match(/caffeineAdminToken=([^&]+)/);
    
    if (match) {
      const token = match[1];
      if (token === VALID_TOKEN) {
        sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
        setIsAdmin(true);
        
        // Clean up URL hash
        const newHash = hash.replace(/[?&]?caffeineAdminToken=[^&]+&?/, '');
        window.location.hash = newHash;
      }
    } else {
      // Check session storage
      const storedToken = sessionStorage.getItem(ADMIN_TOKEN_KEY);
      if (storedToken === VALID_TOKEN) {
        setIsAdmin(true);
      }
    }
    
    setIsChecking(false);
  }, []);

  const setAdminAccess = () => {
    sessionStorage.setItem(ADMIN_TOKEN_KEY, VALID_TOKEN);
    setIsAdmin(true);
  };

  return {
    isAdmin,
    isChecking,
    token: isAdmin ? sessionStorage.getItem(ADMIN_TOKEN_KEY) : null,
    setAdminAccess,
  };
}
