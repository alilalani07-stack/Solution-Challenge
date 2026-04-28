import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'

delete L.Icon.Default.prototype._getIconUrl

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
})

export default function TaskMap({ task }) {
  const coords =
    task?.coords ||
    task?.location_coords ||
    task?.location?.coords

  if (!coords || !coords.lat || !coords.lng) {
    return (
      <div style={{
        height: '220px',
        borderRadius: '16px',
        background: '#f3f4f6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '13px',
        color: '#666'
      }}>
        No map location available
      </div>
    )
  }

  return (
    <div style={{ height: '260px', borderRadius: '16px', overflow: 'hidden' }}>
      <MapContainer
        center={[coords.lat, coords.lng]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[coords.lat, coords.lng]}>
          <Popup>
            {task?.title || 'Task Location'}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  )
}