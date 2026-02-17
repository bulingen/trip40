import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { LeftChevronIcon } from "../components/LeftChevronIcon";
import { StarRatingDisplay } from "../components/StarRatingDisplay";
import { getReactionSvgPath, roundAverageToNearestScore } from "../lib/reactions";
import type { ReactionScore } from "../lib/reactions";
import type { ReactionsRound } from "../lib/database.types";
import type { Suggestion } from "../lib/database.types";

interface Trip {
  id: string;
  name: string;
}

interface Row {
  suggestion: Suggestion & { title: string };
  average: number;
  reactions: { user_id: string; score: number }[];
}

export function ReactionsResultsPage() {
  const { id: tripId, roundId } = useParams<{ id: string; roundId: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [round, setRound] = useState<ReactionsRound | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tripId || !roundId) return;
    (async () => {
      const [tripRes, roundRes, rsRes] = await Promise.all([
        supabase.from("trips").select("id, name").eq("id", tripId).single(),
        supabase.from("reactions_rounds").select("*").eq("id", roundId).single(),
        supabase.from("reactions_round_suggestions").select("suggestion_id").eq("reactions_round_id", roundId).order("suggestion_id"),
      ]);
      setTrip(tripRes.data ?? null);
      setRound(roundRes.data as ReactionsRound | null);
      const suggIds = (roundRes.data ? (rsRes.data ?? []).map((r: { suggestion_id: string }) => r.suggestion_id) : []) as string[];
      if (suggIds.length === 0) {
        setRows([]);
        setLoading(false);
        return;
      }
      const [suggRes, reactionsRes] = await Promise.all([
        supabase.from("suggestions").select("id, title").in("id", suggIds),
        supabase.from("reactions").select("reactions_round_id, suggestion_id, user_id, score").eq("reactions_round_id", roundId),
      ]);
      const suggestions = (suggRes.data ?? []) as (Suggestion & { title: string })[];
      const reactions = (reactionsRes.data ?? []) as { suggestion_id: string; user_id: string; score: number }[];
      const bySuggestion: Record<string, { user_id: string; score: number }[]> = {};
      for (const r of reactions) {
        if (!bySuggestion[r.suggestion_id]) bySuggestion[r.suggestion_id] = [];
        bySuggestion[r.suggestion_id].push({ user_id: r.user_id, score: r.score });
      }
      const suggestionById = new Map(suggestions.map((s) => [s.id, s]));
      const rowsList: Row[] = suggIds.map((id) => {
        const sugg = suggestionById.get(id);
        const list = bySuggestion[id] ?? [];
        const sum = list.reduce((a, x) => a + x.score, 0);
        const average = list.length ? sum / list.length : 0;
        return {
          suggestion: sugg ?? { id, title: "—" } as Suggestion & { title: string },
          average,
          reactions: list,
        };
      });
      rowsList.sort((a, b) => b.average - a.average);
      setRows(rowsList);
      setLoading(false);
    })();
  }, [tripId, roundId]);

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

  return (
    <div className="min-h-screen bg-base-200">
      <div className="navbar bg-base-100 shadow-sm">
        <div className="flex items-center gap-2 px-4">
          <Link to={`/trips/${tripId}/reactions/${roundId}`} className="btn btn-ghost btn-sm flex items-center gap-2">
            <LeftChevronIcon />
          </Link>
          <span className="text-lg font-bold">Results</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 overflow-x-auto">
        <table className="table table-zebra">
          <thead>
            <tr>
              <th>Suggestion</th>
              <th>Score</th>
              <th className="hidden sm:table-cell">Votes</th>
              <th className="w-0" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const roundedScore = roundAverageToNearestScore(row.average);
              const detailsUrl = `/trips/${tripId}/reactions/${roundId}/results/suggestions/${row.suggestion.id}`;
              return (
                <tr key={row.suggestion.id}>
                  <td>
                    <span className="font-medium">{row.suggestion.title}</span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2 flex-wrap">
                      <StarRatingDisplay value={roundedScore} size="rating-sm" />
                      <span>{row.average.toFixed(1)}</span>
                    </div>
                  </td>
                  <td className="hidden sm:table-cell">
                    <div className="flex flex-wrap gap-1 items-center">
                      {row.reactions.map((r) => (
                        <img
                          key={r.user_id}
                          src={getReactionSvgPath(r.score as ReactionScore)}
                          alt=""
                          className="w-8 h-8"
                        />
                      ))}
                    </div>
                  </td>
                  <td>
                    <Link
                      to={detailsUrl}
                      className="btn btn-ghost btn-sm btn-square"
                      aria-label="View details"
                    >
                      <span className="rotate-180 inline-block">
                        <LeftChevronIcon />
                      </span>
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
