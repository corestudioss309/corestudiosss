const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

/** Client-generated public ID (e.g. CS-AB12CD). The database keeps it if unique, otherwise replaces it. */
export const generateId = (prefix: 'CS-' | 'CSR-') => {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return prefix + Array.from(bytes, (b) => CHARS[b % CHARS.length]).join('');
};

const RECEIPT_MARKER = '/receipts/';

/** Returns the storage path for a receipt, accepting either a bare path or an old public URL. */
export const receiptPath = (value: string) => {
  const idx = value.indexOf(RECEIPT_MARKER);
  return decodeURIComponent(idx >= 0 ? value.slice(idx + RECEIPT_MARKER.length).split('?')[0] : value);
};
