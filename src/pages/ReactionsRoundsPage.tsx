import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { LeftChevronIcon } from "../components/LeftChevronIcon";
import type { ReactionsRound } from "../lib/database.types";

interface Trip {
  id: string;
  name: string;
}

interface RoundWithCounts extends ReactionsRound {
  suggestion_count: number;
  my_reaction_count: number;
}

export function ReactionsRoundsPage() {
  const { id: tripId } = useParams<{ id: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [rounds, setRounds] = useState<RoundWithCounts[]>([]);
  const [canCreate, setCanCreate] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tripId) return;
    let cancelled = false;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const [tripRes, roundsRes, profileRes] = await Promise.all([
        supabase.from("trips").select("id, name").eq("id", tripId).single(),
        supabase.from("reactions_rounds").select("*").eq("trip_id", tripId).order("created_at", { ascending: false }),
        user ? supabase.from("profiles").select("can_create_voting_round").eq("id", user.id).single() : Promise.resolve({ data: null }),
      ]);
      if (cancelled) return;
      setTrip(tripRes.data ?? null);
      setCanCreate(!!(profileRes.data as { can_create_voting_round?: boolean } | null)?.can_create_voting_round);
      const roundList = (roundsRes.data ?? []) as ReactionsRound[];
      if (roundList.length === 0) {
        setRounds([]);
        setLoading(false);
        return;
      }
      const roundIds = roundList.map((r) => r.id);
      const [suggestionsRes, reactionsRes] = await Promise.all([
        supabase.from("reactions_round_suggestions").select("reactions_round_id").in("reactions_round_id", roundIds),
        user ? supabase.from("reactions").select("reactions_round_id").in("reactions_round_id", roundIds).eq("user_id", user.id) : Promise.resolve({ data: [] }),
      ]);
      if (cancelled) return;
      const suggestionCount: Record<string, number> = {};
      for (const row of suggestionsRes.data ?? []) {
        suggestionCount[row.reactions_round_id] = (suggestionCount[row.reactions_round_id] ?? 0) + 1;
      }
      const myCount: Record<string, number> = {};
      for (const row of reactionsRes.data ?? []) {
        myCount[row.reactions_round_id] = (myCount[row.reactions_round_id] ?? 0) + 1;
      }
      setRounds(
        roundList.map((r) => ({
          ...r,
          suggestion_count: suggestionCount[r.id] ?? 0,
          my_reaction_count: myCount[r.id] ?? 0,
        }))
      );
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [tripId]);

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
          <Link to={`/trips/${tripId}`} className="btn btn-ghost btn-sm flex items-center gap-2">
            <LeftChevronIcon />
          </Link>
          <span className="text-lg font-bold">Play: Reactions</span>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-6 flex flex-col gap-3">
        {canCreate && (
          <Link
            to={`/trips/${tripId}/reactions/new`}
            className="btn btn-primary btn-lg w-full"
          >
            New voting round
          </Link>
        )}
        <div className="divider">Rounds</div>
        {rounds.length === 0 ? (
          <p className="text-base-content/70">No rounds yet. Create one to start rating suggestions.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {rounds.map((round) => {
              const incomplete = round.suggestion_count > 0 && round.my_reaction_count < round.suggestion_count;
              return (
                <li key={round.id}>
                  <Link
                    to={`/trips/${tripId}/reactions/${round.id}`}
                    className={`flex items-center justify-between gap-2 p-4 rounded-lg bg-base-100 shadow-sm border border-base-300 hover:border-primary/30 ${incomplete ? "ring-2 ring-primary/30" : ""}`}
                  >
                    <span className="font-medium">{round.name || "Unnamed round"}</span>
                    <span className="text-sm opacity-70">
                      {round.my_reaction_count}/{round.suggestion_count} rated
                    </span>
                    {incomplete && (
                      <span className="badge badge-primary badge-sm">Incomplete</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
