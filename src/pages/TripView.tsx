import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { TripMap } from "../components/TripMap";
import { SuggestionList } from "../components/SuggestionList";
import { BottomSheet } from "../components/BottomSheet";
import type { Suggestion } from "../lib/database.types";

interface Trip {
  id: string;
  name: string;
}

type SuggestionWithProfile = Suggestion & {
  profiles: { display_name: string } | null;
};

export function TripView() {
  const { id } = useParams<{ id: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [suggestions, setSuggestions] = useState<SuggestionWithProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    Promise.all([
      supabase.from("trips").select("id, name").eq("id", id).single(),
      supabase
        .from("suggestions")
        .select("*, profiles(display_name)")
        .eq("trip_id", id)
        .order("created_at", { ascending: false }),
    ]).then(([tripRes, suggestionsRes]) => {
      setTrip(tripRes.data);
      setSuggestions((suggestionsRes.data as SuggestionWithProfile[]) ?? []);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <p className="text-lg">Trip not found.</p>
        <Link to="/" className="btn btn-primary btn-sm">
          Back to trips
        </Link>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Top bar */}
      <div className="navbar bg-base-100 shadow-sm z-10 shrink-0">
        <div className="flex items-center gap-2">
          <Link to="/" className="btn btn-ghost btn-sm">
            &larr;
          </Link>
          <div className="flex-1">
            <span className="text-lg font-bold">{trip.name}</span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Side panel — desktop only */}
        <aside className="hidden md:flex flex-col w-96 border-r border-base-300 bg-base-100 overflow-y-auto p-4">
          <h2 className="text-lg font-semibold mb-3">Suggestions</h2>
          <SuggestionList suggestions={suggestions} />
        </aside>

        {/* Map area */}
        <div className="flex-1">
          <TripMap suggestions={suggestions} />
        </div>

        {/* Bottom sheet — mobile only */}
        <BottomSheet>
          <h2 className="text-lg font-semibold mb-3">Suggestions</h2>
          <SuggestionList suggestions={suggestions} />
        </BottomSheet>
      </div>
    </div>
  );
}
