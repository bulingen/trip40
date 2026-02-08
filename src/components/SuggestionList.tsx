import { SuggestionCard } from "./SuggestionCard";
import type { Suggestion } from "../lib/database.types";

type SuggestionWithProfile = Suggestion & {
  profiles?: { display_name: string } | null;
};

export function SuggestionList({
  suggestions,
}: {
  suggestions: SuggestionWithProfile[];
}) {
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
