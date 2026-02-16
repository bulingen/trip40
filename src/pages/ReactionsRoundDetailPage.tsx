import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { LeftChevronIcon } from "../components/LeftChevronIcon";
import { getReactionSvgPath } from "../lib/reactions";
import type { ReactionsRound } from "../lib/database.types";
import type { Suggestion } from "../lib/database.types";

interface Trip {
  id: string;
  name: string;
}

interface SuggestionInRound extends Suggestion {
  profiles?: { display_name: string } | null;
}

export function ReactionsRoundDetailPage() {
  const { id: tripId, roundId } = useParams<{ id: string; roundId: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [round, setRound] = useState<ReactionsRound | null>(null);
  const [suggestions, setSuggestions] = useState<SuggestionInRound[]>([]);
  const [myReactionBySuggestion, setMyReactionBySuggestion] = useState<Record<string, number>>({});
  const [canCreate, setCanCreate] = useState(false);
  const [closing, setClosing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tripId || !roundId) return;
    let cancelled = false;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const [tripRes, roundRes, profileRes] = await Promise.all([
        supabase.from("trips").select("id, name").eq("id", tripId).single(),
        supabase.from("reactions_rounds").select("*").eq("id", roundId).single(),
        user ? supabase.from("profiles").select("can_create_voting_round").eq("id", user.id).single() : Promise.resolve({ data: null }),
      ]);
      if (cancelled) return;
      setTrip(tripRes.data ?? null);
      setRound(roundRes.data as ReactionsRound | null);
      setCanCreate(!!(profileRes.data as { can_create_voting_round?: boolean } | null)?.can_create_voting_round);
      if (!roundRes.data) {
        setLoading(false);
        return;
      }
      const { data: rsRows } = await supabase
        .from("reactions_round_suggestions")
        .select("suggestion_id")
        .eq("reactions_round_id", roundId)
        .order("suggestion_id");
      if (cancelled || !rsRows?.length) {
        setSuggestions([]);
        setMyReactionBySuggestion({});
        setLoading(false);
        return;
      }
      const suggIds = rsRows.map((r) => r.suggestion_id);
      const [suggRes, myReactionsRes] = await Promise.all([
        supabase.from("suggestions").select("*, profiles(display_name)").in("id", suggIds),
        user ? supabase.from("reactions").select("suggestion_id, score").eq("reactions_round_id", roundId).eq("user_id", user.id) : Promise.resolve({ data: [] }),
      ]);
      if (cancelled) return;
      const suggList = (suggRes.data ?? []) as SuggestionInRound[];
      const orderMap = new Map(suggIds.map((id, i) => [id, i]));
      suggList.sort((a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0));
      setSuggestions(suggList);
      const bySuggestion: Record<string, number> = {};
      for (const r of myReactionsRes.data ?? []) {
        bySuggestion[(r as { suggestion_id: string; score: number }).suggestion_id] = (r as { suggestion_id: string; score: number }).score;
      }
      setMyReactionBySuggestion(bySuggestion);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [tripId, roundId]);

  const closeRound = async () => {
    if (!roundId || !canCreate) return;
    setClosing(true);
    await supabase.from("reactions_rounds").update({ is_open: false }).eq("id", roundId);
    setClosing(false);
    setRound((r) => (r ? { ...r, is_open: false } : null));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (!trip || !round) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <p className="text-lg">Round not found.</p>
        <Link to={tripId ? `/trips/${tripId}/reactions` : "/"} className="btn btn-primary btn-sm">
          Back
        </Link>
      </div>
    );
  }

  const suggestionCount = suggestions.length;
  const myReactionCount = Object.keys(myReactionBySuggestion).length;
  const canViewResults = suggestionCount > 0 && myReactionCount === suggestionCount;
  const incomplete = suggestionCount > 0 && myReactionCount < suggestionCount;

  return (
    <div className="min-h-screen bg-base-200">
      <div className="navbar bg-base-100 shadow-sm">
        <div className="flex items-center gap-2 px-4">
          <Link to={`/trips/${tripId}/reactions`} className="btn btn-ghost btn-sm flex items-center gap-2">
            <LeftChevronIcon />
          </Link>
          <span className="text-lg font-bold truncate">{round.name || "Voting round"}</span>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-sm">
            <span className="opacity-70">
              {myReactionCount}/{suggestionCount} rated
              {incomplete && " — rate all to view results"}
            </span>
          </div>
          <progress
            className="progress progress-primary w-full"
            value={myReactionCount}
            max={suggestionCount || 1}
          />
        </div>

        <div className="flex flex-col gap-2">
          {canViewResults ? (
            <Link to={`/trips/${tripId}/reactions/${roundId}/results`} className="btn btn-primary btn-lg w-full">
              View results
            </Link>
          ) : (
            <button type="button" className="btn btn-lg w-full btn-disabled" disabled>
              View results
            </button>
          )}
          {round.is_open && canCreate && (
            <button
              type="button"
              className="btn btn-outline"
              onClick={closeRound}
              disabled={closing}
            >
              {closing ? "Closing…" : "Close voting"}
            </button>
          )}
        </div>

        <div className="divider">Suggestions</div>
        <ul className="flex flex-col gap-2">
          {suggestions.map((s) => {
            const myScore = myReactionBySuggestion[s.id];
            const voted = myScore !== undefined;
            return (
              <li key={s.id}>
                <Link
                  to={`/trips/${tripId}/reactions/${roundId}/suggestions/${s.id}`}
                  className={`flex items-center justify-between gap-2 p-3 rounded-lg bg-base-100 shadow-sm border border-base-300 hover:border-primary/30 ${voted ? "border-primary/20" : ""}`}
                >
                  <span className="font-medium">{s.title}</span>
                  {voted ? (
                    <img src={getReactionSvgPath(myScore as -1 | 0 | 1 | 2)} alt="" className="w-8 h-8 shrink-0" title="Your vote" />
                  ) : (
                    <span className="text-xs opacity-50 shrink-0">Not rated</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
