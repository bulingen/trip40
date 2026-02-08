import type { Suggestion } from "../lib/database.types";
import { truncatePitch } from "./SuggestionDetail";

type SuggestionWithProfile = Suggestion & {
  profiles?: { display_name: string } | null;
};

export function SuggestionCard({
  suggestion,
  isSelected,
  onSelect,
}: {
  suggestion: SuggestionWithProfile;
  isSelected?: boolean;
  onSelect?: () => void;
}) {
  const truncated = truncatePitch(suggestion.description);

  return (
    <div
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onKeyDown={
        onSelect
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect();
              }
            }
          : undefined
      }
      onClick={onSelect}
      className={`card bg-base-100 shadow-sm cursor-pointer transition-all ${
        isSelected ? "ring-2 ring-primary" : "hover:shadow-md"
      }`}
    >
      <div className="card-body p-4">
        <h3 className="card-title text-base">{suggestion.title}</h3>
        {truncated && (
          <p className="text-sm opacity-70">{truncated}</p>
        )}
        <div className="text-xs opacity-40 mt-1">
          {suggestion.author_label ?? suggestion.profiles?.display_name ?? "Unknown"} &middot;{" "}
          {new Date(suggestion.created_at).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}
