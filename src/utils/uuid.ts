// Simple UUID generator for browser environment
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Short ID for events
export function generateShortId(prefix: string = ''): string {
  return `${prefix}${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`;
}
