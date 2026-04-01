export const FAVORITES_KEY = "travel_recommender_favorites";

function safeParse(json) {
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getFavoriteIds() {
  return safeParse(localStorage.getItem(FAVORITES_KEY));
}

export function setFavoriteIds(ids) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
}

