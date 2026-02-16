import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { LeftChevronIcon } from "../components/LeftChevronIcon";
import { getReactionSvgPath, roundAverageToNearestScore } from "../lib/reactions";
import type { ReactionsRound } from "../lib/database.types";
import type { Suggestion } from "../lib/database.types";

interface Trip {
  id: string;
  name: string;
}

interface Row {
  suggestion: Suggestion & { title: string };
  average: number;
  reactions: { user_id: string; display_name: string | null; score: number }[];
}

function initials(name: string | null): string {
  if (!name || !name.trim()) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
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
      const userIds = [...new Set(reactions.map((r) => r.user_id))];
      const { data: profiles } = await supabase.from("profiles").select("id, display_name").in("id", userIds);
      const nameByUser = new Map((profiles ?? []).map((p: { id: string; display_name: string | null }) => [p.id, p.display_name]));
      const bySuggestion: Record<string, { user_id: string; display_name: string | null; score: number }[]> = {};
      for (const r of reactions) {
        if (!bySuggestion[r.suggestion_id]) bySuggestion[r.suggestion_id] = [];
        bySuggestion[r.suggestion_id].push({
          user_id: r.user_id,
          display_name: nameByUser.get(r.user_id) ?? null,
          score: r.score,
        });
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
              <th>Average</th>
              <th>Votes</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const roundedScore = roundAverageToNearestScore(row.average);
              return (
                <tr key={row.suggestion.id}>
                  <td>
                    <Link
                      to={`/trips/${tripId}/reactions/${roundId}/results/suggestions/${row.suggestion.id}`}
                      className="link link-hover font-medium"
                    >
                      {row.suggestion.title}
                    </Link>
                  </td>
                  <td>
                    <span className="flex items-center gap-2">
                      <span>{row.average.toFixed(1)}</span>
                      <img src={getReactionSvgPath(roundedScore)} alt="" className="w-6 h-6" />
                    </span>
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-1 items-center">
                      {row.reactions.map((r) => (
                        <span
                          key={r.user_id}
                          className="flex items-center gap-1"
                          title={r.display_name ?? undefined}
                        >
                          <span className="sm:hidden flex items-center justify-center w-7 h-7 rounded-full bg-base-300 text-xs font-medium">
                            {initials(r.display_name)}
                          </span>
                          <span className="hidden sm:inline text-sm truncate max-w-[120px]">
                            {r.display_name ?? "—"}
                          </span>
                          <img src={getReactionSvgPath(r.score as -1 | 0 | 1 | 2)} alt="" className="w-5 h-5" />
                        </span>
                      ))}
                    </div>
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
