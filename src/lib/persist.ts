export function readItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch { /* full storage or private browsing */ }
}

export function removeItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch { /* ignore */ }
}
