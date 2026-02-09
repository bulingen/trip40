import { APIProvider, Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";
import type { MapMouseEvent } from "@vis.gl/react-google-maps";

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? "";
const DEFAULT_CENTER = { lat: 45, lng: 15 };
const DEFAULT_ZOOM = 4;

interface LocationPickerMapProps {
  /** Current position; when null, user must click map to set. */
  position: { lat: number; lng: number } | null;
  onPositionChange: (lat: number, lng: number) => void;
  /** Optional initial center when position is null */
  defaultCenter?: { lat: number; lng: number };
  className?: string;
}

export function LocationPickerMap({
  position,
  onPositionChange,
  defaultCenter = DEFAULT_CENTER,
  className = "",
}: LocationPickerMapProps) {
  if (!API_KEY) {
    return (
      <div className={`flex items-center justify-center bg-base-300 text-base-content/30 text-center p-6 ${className}`}>
        <span>Set VITE_GOOGLE_MAPS_API_KEY to pick a location on the map.</span>
      </div>
    );
  }

  const center = position ?? defaultCenter;

  const handleMapClick = (e: MapMouseEvent) => {
    const latLng = e.detail.latLng;
    if (latLng) onPositionChange(latLng.lat, latLng.lng);
  };

  const handleMarkerDragEnd = (e: google.maps.MapMouseEvent) => {
    const latLng = e.latLng;
    if (!latLng) return;
    const lat = (latLng as { lat(): number }).lat();
    const lng = (latLng as { lng(): number }).lng();
    onPositionChange(lat, lng);
  };

  return (
    <APIProvider apiKey={API_KEY}>
      <Map
        defaultCenter={center}
        defaultZoom={position ? 12 : DEFAULT_ZOOM}
        gestureHandling="greedy"
        onClick={handleMapClick}
        mapId="trip40-map"
        className={className}
      >
        {position && (
          <AdvancedMarker
            position={position}
            draggable
            onDragEnd={handleMarkerDragEnd}
          >
            <Pin />
          </AdvancedMarker>
        )}
      </Map>
    </APIProvider>
  );
}
