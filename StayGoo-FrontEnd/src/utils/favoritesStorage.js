const STORAGE_KEY = "staygoFavorites";
export const FAVORITES_CHANGED_EVENT = "staygo-favorites-changed";

export function getFavoriteIds() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed.map((id) => String(id)) : [];
  } catch {
    return [];
  }
}

export function setFavoriteIds(ids) {
  const normalized = ids.map((id) => String(id));
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  window.dispatchEvent(
    new CustomEvent(FAVORITES_CHANGED_EVENT, { detail: normalized })
  );
  return normalized;
}

export function isFavorite(listingId) {
  return getFavoriteIds().includes(String(listingId));
}

export function toggleFavoriteId(listingId) {
  const id = String(listingId);
  const current = getFavoriteIds();
  const updated = current.includes(id)
    ? current.filter((item) => item !== id)
    : [...current, id];
  setFavoriteIds(updated);
  return updated;
}
