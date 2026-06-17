const STORAGE_KEY = 'travellta_guest_id';

function uuid(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function getGuestId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = uuid();
    localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}
