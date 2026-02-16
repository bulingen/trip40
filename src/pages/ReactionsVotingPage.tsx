import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { LeftChevronIcon } from "../components/LeftChevronIcon";
import { REACTION_SCORES, getReactionSvgPath, isValidReactionScore } from "../lib/reactions";
import type { ReactionsRound } from "../lib/database.types";
import type { Suggestion } from "../lib/database.types";

interface Trip {
  id: string;
  name: string;
}

type SuggestionWithProfile = Suggestion & {
  profiles?: { display_name: string } | null;
};

function SuggestionImage({ url, className }: { url: string; className?: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="relative w-full max-w-[280px] min-h-[120px]">
      {!loaded && (
        <div className="absolute inset-0 animate-pulse rounded-lg bg-base-300" aria-hidden />
      )}
      <img
        src={url}
        alt=""
        className={`${className ?? ""} ${!loaded ? "opacity-0" : "opacity-100"} transition-opacity relative`}
        loading="lazy"
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}

export function ReactionsVotingPage() {
  const { id: tripId, roundId, suggestionId } = useParams<{ id: string; roundId: string; suggestionId: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [round, setRound] = useState<ReactionsRound | null>(null);
  const [suggestion, setSuggestion] = useState<SuggestionWithProfile | null>(null);
  const [suggestionIds, setSuggestionIds] = useState<string[]>([]);
  const [myScore, setMyScore] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tripId || !roundId || !suggestionId) return;
    let cancelled = false;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const [tripRes, roundRes, rsRes] = await Promise.all([
        supabase.from("trips").select("id, name").eq("id", tripId).single(),
        supabase.from("reactions_rounds").select("*").eq("id", roundId).single(),
        supabase.from("reactions_round_suggestions").select("suggestion_id").eq("reactions_round_id", roundId).order("suggestion_id"),
      ]);
      if (cancelled) return;
      setTrip(tripRes.data ?? null);
      setRound(roundRes.data as ReactionsRound | null);
      const ids = (rsRes.data ?? []).map((r: { suggestion_id: string }) => r.suggestion_id);
      setSuggestionIds(ids);
      if (!roundRes.data || !ids.includes(suggestionId)) {
        setSuggestion(null);
        setLoading(false);
        return;
      }
      const [suggRes, reactionRes] = await Promise.all([
        supabase.from("suggestions").select("*, profiles(display_name)").eq("id", suggestionId).eq("trip_id", tripId).single(),
        user ? supabase.from("reactions").select("score").eq("reactions_round_id", roundId).eq("suggestion_id", suggestionId).eq("user_id", user.id).maybeSingle() : Promise.resolve({ data: null }),
      ]);
      if (cancelled) return;
      setSuggestion(suggRes.data as SuggestionWithProfile | null);
      const r = reactionRes.data as { score: number } | null;
      setMyScore(r && isValidReactionScore(r.score) ? r.score : null);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [tripId, roundId, suggestionId]);

  const setReaction = async (score: number) => {
    if (!roundId || !suggestionId || !round?.is_open) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setSaving(true);
    await supabase.from("reactions").upsert(
      { reactions_round_id: roundId, suggestion_id: suggestionId, user_id: user.id, score },
      { onConflict: "reactions_round_id,suggestion_id,user_id" }
    );
    setSaving(false);
    setMyScore(score);
  };

  const idx = suggestionIds.indexOf(suggestionId ?? "");
  const prevId = idx > 0 ? suggestionIds[idx - 1] : null;
  const nextId = idx >= 0 && idx < suggestionIds.length - 1 ? suggestionIds[idx + 1] : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (!trip || !round || !suggestion) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <p className="text-lg">Suggestion not found.</p>
        <Link to={tripId && roundId ? `/trips/${tripId}/reactions/${roundId}` : "/"} className="btn btn-primary btn-sm">
          Back to round
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <div className="navbar bg-base-100 shadow-sm">
        <div className="flex items-center gap-2 px-4">
          <Link to={`/trips/${tripId}/reactions/${roundId}`} className="btn btn-ghost btn-sm flex items-center gap-2">
            <LeftChevronIcon />
          </Link>
          <span className="text-lg font-bold truncate">{suggestion.title}</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-6 flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold">{suggestion.title}</h2>
          <p className="text-sm opacity-60">
            {suggestion.author_label ?? suggestion.profiles?.display_name ?? "Unknown"} &middot;{" "}
            {new Date(suggestion.created_at).toLocaleDateString()}
          </p>
          {suggestion.main_image_url && (
            <SuggestionImage url={suggestion.main_image_url} className="rounded-lg object-cover max-h-48 w-full sm:max-w-[280px]" />
          )}
          <div className="prose prose-sm max-w-none">
            <p className="whitespace-pre-wrap">{suggestion.description || "—"}</p>
          </div>
        </div>

        {round.is_open && (
          <div className="flex flex-col gap-2">
            <span className="label-text">Your reaction</span>
            <div className="flex flex-wrap gap-2">
              {REACTION_SCORES.map((score) => (
                <button
                  key={score}
                  type="button"
                  className={`btn btn-circle flex items-center justify-center w-16 h-16 min-w-16 min-h-16 ${myScore === score ? "btn-primary" : "btn-outline"}`}
                  onClick={() => setReaction(score)}
                  disabled={saving}
                  title={`Score ${score}`}
                >
                  <img src={getReactionSvgPath(score)} alt="" className="w-14 h-14" />
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between gap-2 pt-4">
          {prevId ? (
            <Link to={`/trips/${tripId}/reactions/${roundId}/suggestions/${prevId}`} className="btn btn-outline">
              Previous
            </Link>
          ) : (
            <Link to={`/trips/${tripId}/reactions/${roundId}`} className="btn btn-ghost">
              Back to round
            </Link>
          )}
          {nextId ? (
            <Link to={`/trips/${tripId}/reactions/${roundId}/suggestions/${nextId}`} className="btn btn-primary">
              Next
            </Link>
          ) : (
            <Link to={`/trips/${tripId}/reactions/${roundId}`} className="btn btn-primary">
              Done
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
