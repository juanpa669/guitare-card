'use client';

import { useEffect } from 'react';

export function PWAProvider() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Désactiver les SW existants (cache)
      navigator.serviceWorker.getRegistrations().then(regs => {
        regs.forEach(r => r.unregister());
      }).catch(() => {});
    }
  }, []);

  return null;
}
