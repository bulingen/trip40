import { APIProvider, Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";
import type { Suggestion } from "../lib/database.types";

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? "";

// Default center: Europe
const DEFAULT_CENTER = { lat: 45, lng: 15 };
const DEFAULT_ZOOM = 4;

interface TripMapProps {
  suggestions: Suggestion[];
}

export function TripMap({ suggestions }: TripMapProps) {
  if (!API_KEY) {
    return (
      <div className="flex items-center justify-center bg-base-300 text-base-content/30 text-2xl font-bold h-full w-full select-none">
        Map (set VITE_GOOGLE_MAPS_API_KEY)
      </div>
    );
  }

  const markers = suggestions.filter((s) => s.lat != null && s.lng != null);

  return (
    <APIProvider apiKey={API_KEY}>
      <Map
        defaultCenter={DEFAULT_CENTER}
        defaultZoom={DEFAULT_ZOOM}
        gestureHandling="greedy"
        disableDefaultUI={false}
        mapId="trip40-map"
        className="h-full w-full"
      >
        {markers.map((s) => (
          <AdvancedMarker
            key={s.id}
            position={{ lat: s.lat!, lng: s.lng! }}
            title={s.title}
          >
            <Pin />
          </AdvancedMarker>
        ))}
      </Map>
    </APIProvider>
  );
}
