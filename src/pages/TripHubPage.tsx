import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { LeftChevronIcon } from "../components/LeftChevronIcon";

interface Trip {
  id: string;
  name: string;
}

export function TripHubPage() {
  const { id } = useParams<{ id: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [incompleteRoundsCount, setIncompleteRoundsCount] = useState<number | null>(null);

  useEffect(() => {
    if (!id) return;
    supabase
      .from("trips")
      .select("id, name")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        setTrip(data ?? null);
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: rounds } = await supabase
        .from("reactions_rounds")
        .select("id")
        .eq("trip_id", id);
      if (!rounds?.length || cancelled) {
        setIncompleteRoundsCount(0);
        return;
      }
      const roundIds = rounds.map((r) => r.id);
      const [suggestionsRes, reactionsRes] = await Promise.all([
        supabase.from("reactions_round_suggestions").select("reactions_round_id").in("reactions_round_id", roundIds),
        supabase.from("reactions").select("reactions_round_id").in("reactions_round_id", roundIds).eq("user_id", user.id),
      ]);
      if (cancelled) return;
      const suggestionCountByRound: Record<string, number> = {};
      for (const r of suggestionsRes.data ?? []) {
        suggestionCountByRound[r.reactions_round_id] = (suggestionCountByRound[r.reactions_round_id] ?? 0) + 1;
      }
      const myReactionCountByRound: Record<string, number> = {};
      for (const r of reactionsRes.data ?? []) {
        myReactionCountByRound[r.reactions_round_id] = (myReactionCountByRound[r.reactions_round_id] ?? 0) + 1;
      }
      let incomplete = 0;
      for (const rid of roundIds) {
        const need = suggestionCountByRound[rid] ?? 0;
        const have = myReactionCountByRound[rid] ?? 0;
        if (need > 0 && have < need) incomplete += 1;
      }
      setIncompleteRoundsCount(incomplete);
    })();
    return () => {
      cancelled = true;
    };
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
          <Link to="/" className="btn btn-ghost btn-sm flex items-center gap-2">
            <LeftChevronIcon />
          </Link>
          <span className="text-lg font-bold">{trip.name}</span>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-6 flex flex-col gap-3">
        <Link
          to={`/trips/${id}/map`}
          className="btn btn-outline btn-primary btn-lg w-full justify-start gap-2"
        >
          Map view
        </Link>
        <Link
          to={`/trips/${id}/list`}
          className="btn btn-outline btn-primary btn-lg w-full justify-start gap-2"
        >
          List view
        </Link>
        <div className="divider">Games</div>
        <Link
          to={`/trips/${id}/reactions`}
          className="btn btn-outline btn-primary btn-lg w-full justify-start gap-2 relative"
        >
          Play: Reactions
          {typeof incompleteRoundsCount === "number" && incompleteRoundsCount > 0 && (
            <span className="badge badge-primary badge-sm absolute top-2 right-2">
              {incompleteRoundsCount}
            </span>
          )}
        </Link>
        <button type="button" className="btn btn-lg w-full justify-start gap-2" disabled>
          Play: Swipe
        </button>
        <button type="button" className="btn btn-lg w-full justify-start gap-2" disabled>
          Play: Head 2 head
        </button>
      </div>
    </div>
  );
}
