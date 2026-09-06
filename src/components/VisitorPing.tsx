import React, { useEffect } from 'react';
import api from '../utils/api';

const SESSION_PING_KEY = 'shoplogs.pinged';

/**
 * Fires POST /api/track/visit once per browser session.
 * Server-side dedupes by IP for 60s regardless, so this is a light hint.
 */
const VisitorPing: React.FC = () => {
  useEffect(() => {
    try {
      if (sessionStorage.getItem(SESSION_PING_KEY)) return;
      sessionStorage.setItem(SESSION_PING_KEY, '1');
    } catch {
      // fall through — server dedupes anyway
    }
    api
      .post('/track/visit', {
        path: window.location.pathname,
        referrer: document.referrer || '',
      })
      .catch(() => {
        /* silent — tracking is best-effort */
      });
  }, []);

  return null;
};

export default VisitorPing;
