// Universal Maps Links
// iOS: Apple Maps wird durch maps.apple.com automatisch geöffnet
// Android: Google Maps öffnet via geo: oder google.com/maps
// Desktop: Browser fallback

export function appleMapsUrl(lat: number, lng: number, label?: string): string {
  const q = label ? encodeURIComponent(label) : `${lat},${lng}`;
  return `https://maps.apple.com/?ll=${lat},${lng}&q=${q}`;
}

export function googleMapsUrl(lat: number, lng: number, label?: string): string {
  const q = `${lat},${lng}` + (label ? `+(${encodeURIComponent(label)})` : "");
  return `https://www.google.com/maps?q=${q}`;
}

export function geoUri(lat: number, lng: number, label?: string): string {
  return `geo:${lat},${lng}?q=${lat},${lng}${label ? `(${encodeURIComponent(label)})` : ""}`;
}

// Routenplanung (Navigation), nicht nur Anzeige
export function appleMapsNavUrl(lat: number, lng: number): string {
  return `https://maps.apple.com/?daddr=${lat},${lng}&dirflg=d`;
}

export function googleMapsNavUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
}
