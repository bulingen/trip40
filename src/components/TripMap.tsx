import { APIProvider, Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";
import type { Suggestion } from "../lib/database.types";

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? "";

const DEFAULT_CENTER = { lat: 45, lng: 15 };
const DEFAULT_ZOOM = 4;

interface TripMapProps {
  suggestions: Suggestion[];
  selectedId: string | null;
  onSelectSuggestion: (id: string) => void;
}

export function TripMap({ suggestions, selectedId, onSelectSuggestion }: TripMapProps) {
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
            onClick={() => onSelectSuggestion(s.id)}
          >
            <Pin
              background={selectedId === s.id ? "#0ea5e9" : undefined}
              borderColor={selectedId === s.id ? "#0284c7" : undefined}
            />
          </AdvancedMarker>
        ))}
      </Map>
    </APIProvider>
  );
}
