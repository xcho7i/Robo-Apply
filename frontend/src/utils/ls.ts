
const TOUR_PREFIX = "ra_seen_"


export function clearLocalStorageButKeepTour() {
  const keep = new Map<string, string>()
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)!
    if (k && k.startsWith(TOUR_PREFIX)) {
      const v = localStorage.getItem(k)
      if (v != null) keep.set(k, v)
    }
  }
  localStorage.clear()
  keep.forEach((v, k) => localStorage.setItem(k, v))
}

export function clearAuthOnly() {
  const KEYS = [
    "access_token",
    "refresh_token",
    "user",
    "onboarding_data",
  ]
  KEYS.forEach(k => localStorage.removeItem(k))
}
