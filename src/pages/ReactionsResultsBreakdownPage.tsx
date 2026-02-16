import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { LeftChevronIcon } from "../components/LeftChevronIcon";
import { getReactionSvgPath } from "../lib/reactions";
import type { Suggestion } from "../lib/database.types";

interface Trip {
  id: string;
  name: string;
}

type SuggestionWithProfile = Suggestion & {
  profiles?: { display_name: string } | null;
};

interface ReactionRow {
  user_id: string;
  display_name: string | null;
  score: number;
}

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

export function ReactionsResultsBreakdownPage() {
  const { id: tripId, roundId, suggestionId } = useParams<{ id: string; roundId: string; suggestionId: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [suggestion, setSuggestion] = useState<SuggestionWithProfile | null>(null);
  const [reactions, setReactions] = useState<ReactionRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tripId || !roundId || !suggestionId) return;
    (async () => {
      const [tripRes, suggRes, reactionsRes] = await Promise.all([
        supabase.from("trips").select("id, name").eq("id", tripId).single(),
        supabase.from("suggestions").select("*, profiles(display_name)").eq("id", suggestionId).eq("trip_id", tripId).single(),
        supabase.from("reactions").select("user_id, score").eq("reactions_round_id", roundId).eq("suggestion_id", suggestionId),
      ]);
      setTrip(tripRes.data ?? null);
      setSuggestion(suggRes.data as SuggestionWithProfile | null);
      const reacs = (reactionsRes.data ?? []) as { user_id: string; score: number }[];
      if (reacs.length === 0) {
        setReactions([]);
        setLoading(false);
        return;
      }
      const { data: profiles } = await supabase.from("profiles").select("id, display_name").in("id", reacs.map((r) => r.user_id));
      const nameByUser = new Map((profiles ?? []).map((p: { id: string; display_name: string | null }) => [p.id, p.display_name]));
      setReactions(
        reacs.map((r) => ({
          user_id: r.user_id,
          display_name: nameByUser.get(r.user_id) ?? null,
          score: r.score,
        }))
      );
      setLoading(false);
    })();
  }, [tripId, roundId, suggestionId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (!trip || !suggestion) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <p className="text-lg">Suggestion not found.</p>
        <Link to={tripId && roundId ? `/trips/${tripId}/reactions/${roundId}/results` : "/"} className="btn btn-primary btn-sm">
          Back to results
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <div className="navbar bg-base-100 shadow-sm">
        <div className="flex items-center gap-2 px-4">
          <Link to={`/trips/${tripId}/reactions/${roundId}/results`} className="btn btn-ghost btn-sm flex items-center gap-2">
            <LeftChevronIcon />
          </Link>
          <span className="text-lg font-bold truncate">{suggestion.title}</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-6 flex flex-col gap-6">
        <h2 className="text-xl font-bold">{suggestion.title}</h2>
        {suggestion.main_image_url && (
          <SuggestionImage url={suggestion.main_image_url} className="rounded-lg object-cover max-h-48 w-full sm:max-w-[280px]" />
        )}

        <div>
          <h3 className="font-semibold mb-2">Scores</h3>
          <ul className="flex flex-col gap-2">
            {reactions.map((r) => (
              <li key={r.user_id} className="flex items-center gap-3 p-2 rounded-lg bg-base-100 border border-base-300">
                <span className="font-medium">{r.display_name ?? "Unknown"}</span>
                <img src={getReactionSvgPath(r.score as -1 | 0 | 1 | 2)} alt="" className="w-8 h-8" />
                <span className="text-sm opacity-70">({r.score})</span>
              </li>
            ))}
          </ul>
        </div>

        <Link to={`/trips/${tripId}/suggestions/${suggestionId}`} className="btn btn-outline btn-sm w-fit">
          Full suggestion detail
        </Link>
      </div>
    </div>
  );
}
