import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { LeftChevronIcon } from "../components/LeftChevronIcon";
import type { Suggestion } from "../lib/database.types";

interface Trip {
  id: string;
  name: string;
}

export function CreateReactionsRoundPage() {
  const { id: tripId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [name, setName] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tripId) return;
    Promise.all([
      supabase.from("trips").select("id, name").eq("id", tripId).single(),
      supabase.from("suggestions").select("id, title").eq("trip_id", tripId).order("title"),
    ]).then(([tripRes, suggRes]) => {
      setTrip(tripRes.data ?? null);
      setSuggestions((suggRes.data as Suggestion[]) ?? []);
      setLoading(false);
    });
  }, [tripId]);

  const toggle = (suggestionId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(suggestionId)) next.delete(suggestionId);
      else next.add(suggestionId);
      return next;
    });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripId || selectedIds.size === 0) return;
    setSubmitting(true);
    const { data: round, error: roundErr } = await supabase
      .from("reactions_rounds")
      .insert({ trip_id: tripId, name: name.trim() || null })
      .select("id")
      .single();
    if (roundErr || !round) {
      setSubmitting(false);
      return;
    }
    const rows = Array.from(selectedIds).map((suggestion_id) => ({
      reactions_round_id: round.id,
      suggestion_id,
    }));
    const { error: suggErr } = await supabase.from("reactions_round_suggestions").insert(rows);
    setSubmitting(false);
    if (suggErr) return;
    navigate(`/trips/${tripId}/reactions/${round.id}`);
  };

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
          <Link to={`/trips/${tripId}/reactions`} className="btn btn-ghost btn-sm flex items-center gap-2">
            <LeftChevronIcon />
          </Link>
          <span className="text-lg font-bold">New voting round</span>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-6">
        <form onSubmit={submit} className="flex flex-col gap-4">
          <label className="form-control w-full">
            <span className="label-text">Round name (optional)</span>
            <input
              type="text"
              className="input input-bordered w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Round 1"
            />
          </label>
          <div>
            <span className="label-text block mb-2">Suggestions to include</span>
            <p className="text-sm opacity-70 mb-2">Select at least one.</p>
            <ul className="flex flex-col gap-2 max-h-64 overflow-y-auto border border-base-300 rounded-lg p-2">
              {suggestions.map((s) => (
                <li key={s.id}>
                  <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-base-300">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm"
                      checked={selectedIds.has(s.id)}
                      onChange={() => toggle(s.id)}
                    />
                    <span className="text-sm">{s.title}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting || selectedIds.size === 0}
          >
            {submitting ? "Creating…" : "Create round"}
          </button>
        </form>
      </div>
    </div>
  );
}
