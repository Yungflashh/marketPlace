const SESSION_KEY = 'shoplogs.sessionId';

// UUID v4 fallback for older browsers
const uuidv4 = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const getSessionId = (): string => {
  try {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id = uuidv4();
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return uuidv4();
  }
};
