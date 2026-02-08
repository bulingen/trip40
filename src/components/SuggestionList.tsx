import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { SuggestionCard } from "./SuggestionCard";
import type { Suggestion } from "../lib/database.types";

type SuggestionWithProfile = Suggestion & {
  profiles: { display_name: string } | null;
};

export function SuggestionList({ tripId }: { tripId: string }) {
  const [suggestions, setSuggestions] = useState<SuggestionWithProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("suggestions")
      .select("*, profiles(display_name)")
      .eq("trip_id", tripId)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setSuggestions((data as SuggestionWithProfile[]) ?? []);
        setLoading(false);
      });
  }, [tripId]);

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <span className="loading loading-spinner loading-md" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {suggestions.length === 0 ? (
        <p className="text-base-content/60 text-center py-8">
          No suggestions yet.
        </p>
      ) : (
        suggestions.map((s) => <SuggestionCard key={s.id} suggestion={s} />)
      )}
      <button className="btn btn-outline btn-primary btn-sm mt-2" disabled>
        + Add suggestion
      </button>
    </div>
  );
}
