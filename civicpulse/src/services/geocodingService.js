import axios from 'axios'

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org'

export async function searchLocations(query) {
  if (!query || query.length < 3) return []
  const response = await axios.get(`${NOMINATIM_BASE}/search`, {
    params: {
      q: query,
      format: 'json',
      limit: 5,
      addressdetails: 1,
    },
    headers: {
      'User-Agent': 'CivicPulse/1.0 (community-help-platform)'
    }
  })
  return response.data.map(r => ({
    displayName: r.display_name,
    shortName: [r.address?.suburb, r.address?.city || r.address?.town, r.address?.country].filter(Boolean).join(', '),
    lat: parseFloat(r.lat),
    lng: parseFloat(r.lon),
    placeId: r.place_id,
  }))
}

export async function reverseGeocode(lat, lng) {
  const response = await axios.get(`${NOMINATIM_BASE}/reverse`, {
    params: { lat, lon: lng, format: 'json' },
    headers: { 'User-Agent': 'CivicPulse/1.0' }
  })
  return response.data.display_name
}
