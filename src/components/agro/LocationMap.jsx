import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Search, Loader2 } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon issue with bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom green marker for farm location
const farmIcon = L.divIcon({
  className: 'agro-map-marker',
  html: `<div style="background:#4A7C2A;width:28px;height:28px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

// Helper: recenter map when position changes externally
function MapRecenter({ position, zoom = 13 }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, zoom, { animate: true });
    }
  }, [position, zoom, map]);
  return null;
}

// Helper: allow clicking on map to set position
function MapClickHandler({ onMapClick }) {
  const map = useMap();
  useEffect(() => {
    if (!onMapClick) return;
    const handler = (e) => onMapClick(e.latlng.lat, e.latlng.lng);
    map.on('click', handler);
    return () => map.off('click', handler);
  }, [map, onMapClick]);
  return null;
}

export default function LocationMap({ lat, lng, onPositionChange, t }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const mapRef = useRef(null);

  const hasPosition = lat != null && lng != null;
  const position = hasPosition ? [lat, lng] : null;
  const defaultCenter = [20, 0]; // Default world view if no position

  const handleSearch = async (e) => {
    e?.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    setSearching(true);
    setSearchError(null);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      if (data && data.length > 0) {
        const result = data[0];
        onPositionChange(parseFloat(result.lat), parseFloat(result.lon), result.display_name);
        setSearchQuery('');
      } else {
        setSearchError(t('error'));
      }
    } catch (err) {
      console.error('Geocode error:', err);
      setSearchError(t('error'));
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-3 py-2.5 rounded-lg border border-[#D4C5B0] text-[#2D5016] focus:outline-none focus:ring-2 focus:ring-[#4A7C2A] min-h-[44px]"
          placeholder="Search city, zip, or region..."
        />
        <button
          type="submit"
          disabled={searching}
          className="px-4 bg-[#4A7C2A] text-white rounded-lg hover:bg-[#2D5016] transition-colors disabled:opacity-50 min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          {searching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
        </button>
      </form>

      {searchError && (
        <p className="text-sm text-red-600">{searchError}</p>
      )}

      {/* Map */}
      <div className="rounded-xl overflow-hidden border border-[#D4C5B0]" style={{ height: '280px' }}>
        <MapContainer
          center={position || defaultCenter}
          zoom={hasPosition ? 13 : 2}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {position && (
            <Marker position={position} icon={farmIcon} />
          )}
          <MapRecenter position={position} zoom={13} />
          <MapClickHandler onMapClick={hasPosition ? (newLat, newLng) => onPositionChange(newLat, newLng) : null} />
        </MapContainer>
      </div>

      {hasPosition && (
        <div className="flex items-center gap-2 text-sm text-[#5B7553]">
          <MapPin className="w-4 h-4 text-[#4A7C2A] flex-shrink-0" />
          <span>GPS: {lat.toFixed(4)}, {lng.toFixed(4)}</span>
        </div>
      )}
    </div>
  );
}