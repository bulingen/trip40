import { SuggestionCard } from "./SuggestionCard";
import { SuggestionDetail } from "./SuggestionDetail";
import type { Suggestion } from "../lib/database.types";

type SuggestionWithProfile = Suggestion & {
  profiles?: { display_name: string } | null;
};

export function SuggestionList({
  suggestions,
  selectedId,
  onSelect,
  onBack,
}: {
  suggestions: SuggestionWithProfile[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onBack: () => void;
}) {
  const selected = selectedId
    ? suggestions.find((s) => s.id === selectedId)
    : null;

  return (
    <div className="flex flex-col gap-3">
      {selected ? (
        <SuggestionDetail suggestion={selected} onBack={onBack} />
      ) : (
        <>
          {suggestions.length === 0 ? (
            <p className="text-base-content/60 text-center py-8">
              No suggestions yet.
            </p>
          ) : (
            suggestions.map((s) => (
              <SuggestionCard
                key={s.id}
                suggestion={s}
                isSelected={selectedId === s.id}
                onSelect={() => onSelect(s.id)}
              />
            ))
          )}
          <button className="btn btn-outline btn-primary btn-sm mt-2" disabled>
            + Add suggestion
          </button>
        </>
      )}
    </div>
  );
}
