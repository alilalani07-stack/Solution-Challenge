// components/location/MapPreview.jsx
// Leaflet + OpenStreetMap — no API key required
import { useEffect, useRef, useCallback } from 'react'

/**
 * Props:
 *   lat, lng, zoom      — map centre & zoom level
 *   markers             — [{ id, lat, lng, color, pulsing, popup, onClick }]
 *   selectedId          — id of the currently highlighted marker
 *   height              — css height string (default '100%')
 *   showSingleMarker    — if true, show a single red pin at lat/lng (volunteer mode)
 *   singleMarkerColor   — color for the single pin (default '#ef4444')
 */
export default function MapPreview({
  lat = 20.5937,
  lng = 78.9629,
  zoom = 4,
  markers = [],
  selectedId,
  height = '100%',
  showSingleMarker = false,
  singleMarkerColor = '#ef4444',
}) {
  const containerRef = useRef(null)
  const mapRef       = useRef(null)
  const markersRef   = useRef([])

  // ✅ FIX: Constrain Leaflet controls z-index so they don't overlap modals/drawers
  useEffect(() => {
    const styleId = 'leaflet-control-zindex-fix'
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style')
      style.id = styleId
      style.textContent = `
        .leaflet-control { z-index: 10 !important; }
        .leaflet-top, .leaflet-bottom { z-index: 10 !important; }
      `
      document.head.appendChild(style)
    }
  }, [])

  // ── Red pin icon for single-marker mode ───────────────────────────────────
  const makeRedPinIcon = useCallback((L, color = '#ef4444') => {
    return L.divIcon({
      className: '',
      html: `
        <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
          <div style="
            width: 26px; height: 26px;
            background: ${color};
            border: 3px solid white;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            display: flex; align-items: center; justify-content: center;
          ">
            <div style="width: 6px; height: 6px; border-radius: 50%; background: white; transform: rotate(45deg);"></div>
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    })
  }, [])

  // Stable draw function — recreates all markers on the live map instance
  const syncMarkers = useCallback(() => {
    const map = mapRef.current
    const L   = window.L
    if (!map || !L) return

    // Clear existing markers
    markersRef.current.forEach(m => m.remove())
    markersRef.current = []

    // ✅ Single-marker mode (volunteer dashboard)
    if (showSingleMarker && lat != null && lng != null) {
      const icon = makeRedPinIcon(L, singleMarkerColor)
      const marker = L.marker([lat, lng], { icon })
      marker.bindPopup('<div style="font-family:sans-serif;font-size:13px;font-weight:600;">Selected Location</div>', { closeButton: false, offset: [0, -4] })
      marker.addTo(map)
      markersRef.current.push(marker)
      return // Skip multi-marker logic
    }

    // ✅ Multi-marker mode (coordinator dashboard)
    ;(markers || []).forEach(({ id, lat: mLat, lng: mLng, color = '#3B82F6', pulsing, popup, onClick }) => {
      if (mLat == null || mLng == null) return

      const isSelected = id === selectedId
      const outer = isSelected ? 22 : 16
      const inner = isSelected ? 10 : 7

      const icon = L.divIcon({
        className: '',
        html: `
          <div style="position:relative;width:${outer}px;height:${outer}px;display:flex;align-items:center;justify-content:center;">
            <div style="position:absolute;inset:0;border-radius:50%;border:2.5px solid ${color};background:${color}22;box-shadow:0 2px 8px ${color}55;${pulsing ? 'animation:lfpulse 1.6s ease-out infinite;' : ''}"></div>
            <div style="width:${inner}px;height:${inner}px;border-radius:50%;background:${color};box-shadow:0 1px 4px rgba(0,0,0,0.3);"></div>
          </div>
          <style>@keyframes lfpulse{0%{box-shadow:0 0 0 0 ${color}66}70%{box-shadow:0 0 0 10px ${color}00}100%{box-shadow:0 0 0 0 ${color}00}}</style>
        `,
        iconSize:    [outer, outer],
        iconAnchor:  [outer / 2, outer / 2],
        popupAnchor: [0, -(outer / 2 + 4)],
      })

      const marker = L.marker([mLat, mLng], { icon })

      if (popup) {
        marker.bindPopup(
          `<div style="font-family:sans-serif;font-size:13px;font-weight:600;min-width:100px;line-height:1.4;">${popup}</div>`,
          { closeButton: false, offset: [0, -4] }
        )
      }

      if (typeof onClick === 'function') {
        marker.on('click', () => onClick(id))
      } else if (popup) {
        marker.on('click', () => marker.openPopup())
      }

      marker.addTo(map)
      markersRef.current.push(marker)
    })
  }, [markers, selectedId, showSingleMarker, lat, lng, singleMarkerColor, makeRedPinIcon])

  // ── Bootstrap Leaflet exactly once ────────────────────────────────────────
  useEffect(() => {
    if (mapRef.current) return // already initialised

    // Inject CSS if absent
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link')
      link.id   = 'leaflet-css'
      link.rel  = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }

    function init() {
      if (!containerRef.current || mapRef.current) return
      const L = window.L
      if (!L) return

      const map = L.map(containerRef.current, {
        center:             [lat, lng],
        zoom,
        zoomControl:        true,
        scrollWheelZoom:    false,
        attributionControl: false,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map)

      mapRef.current = map
      syncMarkers() // draw any markers that arrived before the map was ready
    }

    if (window.L) {
      init()
    } else if (!document.getElementById('leaflet-js')) {
      const script  = document.createElement('script')
      script.id     = 'leaflet-js'
      script.src    = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      script.onload = init
      document.head.appendChild(script)
    } else {
      // Script tag already injected by another instance — wait for it
      document.getElementById('leaflet-js').addEventListener('load', init)
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps — intentional one-time init

  // ── Re-centre when lat/lng/zoom change ───────────────────────────────────
  useEffect(() => {
    if (!mapRef.current) return
    mapRef.current.setView([lat, lng], zoom)
  }, [lat, lng, zoom])

  // ── Redraw markers whenever they change ──────────────────────────────────
  useEffect(() => {
    syncMarkers()
  }, [syncMarkers])

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height, minHeight: height, borderRadius: 'inherit' }}
    />
  )
}