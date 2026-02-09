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
  tripId,
}: {
  suggestions: SuggestionWithProfile[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onBack: () => void;
  tripId?: string;
}) {
  const selected = selectedId
    ? suggestions.find((s) => s.id === selectedId)
    : null;

  const editLink =
    tripId && selected ? `/trips/${tripId}/suggestions/${selected.id}/edit` : undefined;

  return (
    <div className="flex flex-col gap-3">
      {selected ? (
        <SuggestionDetail
          suggestion={selected}
          onBack={onBack}
          editLink={editLink}
        />
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
        </>
      )}
    </div>
  );
}
