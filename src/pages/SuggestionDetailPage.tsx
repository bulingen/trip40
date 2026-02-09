import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { SuggestionDetail } from "../components/SuggestionDetail";
import { TripMap } from "../components/TripMap";
import type { Suggestion } from "../lib/database.types";
import { LeftChevronIcon } from "../components/LeftChevronIcon";

type SuggestionWithProfile = Suggestion & {
  profiles?: { display_name: string } | null;
};

export function SuggestionDetailPage() {
  const { id: tripId, suggestionId } = useParams<{ id: string; suggestionId: string }>();
  const [suggestion, setSuggestion] = useState<SuggestionWithProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tripId || !suggestionId) return;
    supabase
      .from("suggestions")
      .select("*, profiles(display_name)")
      .eq("id", suggestionId)
      .eq("trip_id", tripId)
      .single()
      .then(({ data }) => {
        setSuggestion(data as SuggestionWithProfile | null);
        setLoading(false);
      });
  }, [tripId, suggestionId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (!suggestion) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <p className="text-lg">Suggestion not found.</p>
        <Link to={tripId ? `/trips/${tripId}/list` : "/"} className="btn btn-primary btn-sm">
          Back to list
        </Link>
      </div>
    );
  }

  const hasCoords = suggestion.lat != null && suggestion.lng != null;

  return (
    <div className="min-h-screen bg-base-200">
      <div className="navbar bg-base-100 shadow-sm">
        <div className="flex items-center gap-2 px-4">
          <Link
            to={tripId ? `/trips/${tripId}/list` : "/"}
            className="btn btn-ghost btn-sm flex items-center gap-2"
          >
            <LeftChevronIcon />
          </Link>
          <span className="text-lg font-bold truncate">{suggestion.title}</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-6 flex flex-col gap-6">
        <SuggestionDetail
          suggestion={suggestion}
          onBack={() => window.history.back()}
        />

        {hasCoords && (
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold opacity-70">Map</h3>
            <div className="w-full aspect-video rounded-lg overflow-hidden bg-base-300 shrink-0">
              <TripMap
                suggestions={[suggestion]}
                center={{ lat: suggestion.lat!, lng: suggestion.lng! }}
                zoom={12}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
