import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { SuggestionCard } from "../components/SuggestionCard";
import type { Suggestion } from "../lib/database.types";
import { LeftChevronIcon } from "../components/LeftChevronIcon";

interface Trip {
  id: string;
  name: string;
}

type SuggestionWithProfile = Suggestion & {
  profiles?: { display_name: string } | null;
};

export function TripListView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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
    <div className="min-h-screen bg-base-200">
      <div className="navbar bg-base-100 shadow-sm">
        <div className="flex items-center gap-2 px-4">
          <Link to={`/trips/${id}`} className="btn btn-ghost btn-sm flex items-center gap-2">
            <LeftChevronIcon />
          </Link>
          <span className="text-lg font-bold">List view</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-6">
        <h2 className="text-xl font-semibold mb-4">Suggestions</h2>
        {suggestions.length === 0 ? (
          <p className="text-base-content/60">No suggestions yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {suggestions.map((s) => (
              <SuggestionCard
                key={s.id}
                suggestion={s}
                onSelect={() => navigate(`/trips/${id}/suggestions/${s.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
