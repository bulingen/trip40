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
  const [myOnly, setMyOnly] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [myDisplayName, setMyDisplayName] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("id", user.id)
          .single();
        setMyDisplayName(
          profile?.display_name != null ? profile.display_name : null
        );
      }

      const [tripRes, suggestionsRes] = await Promise.all([
        supabase.from("trips").select("id, name").eq("id", id).single(),
        supabase
          .from("suggestions")
          .select("*, profiles(display_name)")
          .eq("trip_id", id)
          .order("created_at", { ascending: false }),
      ]);
      setTrip(tripRes.data);
      setSuggestions((suggestionsRes.data as SuggestionWithProfile[]) ?? []);
      setLoading(false);
    };

    void load();
  }, [id]);

  // "My suggestions" = I created them (created_by) OR author_label matches my profile display_name
  const filteredSuggestions =
    !myOnly
      ? suggestions
      : suggestions.filter((s) => {
        if (myDisplayName != null && s.author_label === myDisplayName)
          return true;
        return false;
      });

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
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h2 className="text-xl font-semibold">Suggestions</h2>
          <div className="flex items-center gap-3">
            <label className="label cursor-pointer gap-2">
              <input
                type="checkbox"
                className="checkbox checkbox-sm"
                checked={myOnly}
                onChange={(e) => setMyOnly(e.target.checked)}
              />
              <span className="label-text">Show my suggestions only</span>
            </label>
            <Link
              to={`/trips/${id}/suggestions/new`}
              className="btn btn-primary btn-sm"
            >
              + Add suggestion
            </Link>
          </div>
        </div>
        {filteredSuggestions.length === 0 ? (
          <p className="text-base-content/60">
            {suggestions.length === 0
              ? "No suggestions yet."
              : "No suggestions match the filter."}
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredSuggestions.map((s) => (
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
