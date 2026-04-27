import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { T } from '../../styles/tokens'

// Fix default icon issue
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const createCustomIcon = (color = T.primary, pulsing = true) => L.divIcon({
  className: '',
  html: `
    <div style="position:relative;width:24px;height:24px;">
      ${pulsing ? `<div style="position:absolute;inset:-6px;background:${color}33;border-radius:50%;animation:ping 2s cubic-bezier(0,0,0.2,1) infinite;"></div>` : ''}
      <div style="width:24px;height:24px;background:${color};border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.2);"></div>
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -16],
})

export default function MapPreview({ 
  lat, 
  lng, 
  zoom = 14, 
  height = '200px', 
  markers = [], 
  onMarkerClick,
  selectedId,
  className = '' 
}) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markerLayersRef = useRef({})

  useEffect(() => {
    if (!containerRef.current) return

    if (!mapRef.current) {
      if (containerRef.current._leaflet_id) {
        containerRef.current._leaflet_id = null
      }

      mapRef.current = L.map(containerRef.current, {
        center: [lat || 20.5937, lng || 78.9629],
        zoom: lat ? zoom : 4,
        zoomControl: true,
        scrollWheelZoom: true,
        attributionControl: true
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapRef.current)
    }
  }, [])

  // Handle single lat/lng updates (e.g. from detail view)
  useEffect(() => {
    if (mapRef.current && lat && lng && !markers.length) {
      mapRef.current.flyTo([lat, lng], zoom, { duration: 0.8 })
      
      // Clear old markers if any
      Object.values(markerLayersRef.current).forEach(m => m.remove())
      markerLayersRef.current = {}

      const m = L.marker([lat, lng], { icon: createCustomIcon() }).addTo(mapRef.current)
      markerLayersRef.current['single'] = m
    }
  }, [lat, lng, zoom, markers.length])

  // Handle multiple markers (dashboard mode)
  useEffect(() => {
    if (!mapRef.current || !markers.length) return

    // Clear removed markers
    const currentIds = new Set(markers.map(m => m.id))
    Object.keys(markerLayersRef.current).forEach(id => {
      if (!currentIds.has(id) && id !== 'single') {
        markerLayersRef.current[id].remove()
        delete markerLayersRef.current[id]
      }
    })

    // Add or update markers
    const bounds = L.latLngBounds([])
    markers.forEach(data => {
      const { id, lat: mLat, lng: mLng, color, pulsing, popup } = data
      
      if (!markerLayersRef.current[id]) {
        const icon = createCustomIcon(color || T.primary, pulsing !== false)
        const m = L.marker([mLat, mLng], { icon }).addTo(mapRef.current)
        
        if (popup) {
          m.bindPopup(popup)
        }

        m.on('click', () => {
          if (onMarkerClick) onMarkerClick(id)
        })

        markerLayersRef.current[id] = m
      } else {
        markerLayersRef.current[id].setLatLng([mLat, mLng])
      }
      
      bounds.extend([mLat, mLng])
    })

    // Auto-fit if more than one marker and no single lat/lng provided
    if (markers.length > 1 && !lat) {
      mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 })
    } else if (markers.length === 1 && !lat) {
      mapRef.current.flyTo([markers[0].lat, markers[0].lng], 12)
    }

  }, [markers, onMarkerClick, lat])

  // Handle selection styling
  useEffect(() => {
    if (!mapRef.current) return
    Object.keys(markerLayersRef.current).forEach(id => {
      const marker = markerLayersRef.current[id]
      if (id === selectedId) {
        marker.setZIndexOffset(1000)
        // Could update icon here if needed
      } else {
        marker.setZIndexOffset(0)
      }
    })
  }, [selectedId])

  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  return (
    <div 
      ref={containerRef}
      className={className} 
      style={{ 
        height, 
        width: '100%', 
        borderRadius: T.radiusMd, 
        overflow: 'hidden', 
        border: `1px solid ${T.border}`,
        backgroundColor: T.surface2,
        position: 'relative',
        zIndex: 1
      }} 
    />
  )
}
