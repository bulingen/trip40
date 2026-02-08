import type { Suggestion } from "../lib/database.types";

type SuggestionWithProfile = Suggestion & {
  profiles?: { display_name: string } | null;
};

export function SuggestionCard({ suggestion }: { suggestion: SuggestionWithProfile }) {
  return (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body p-4">
        <h3 className="card-title text-base">{suggestion.title}</h3>
        {suggestion.description && (
          <p className="text-sm opacity-70">{suggestion.description}</p>
        )}
        <div className="text-xs opacity-40 mt-1">
          {suggestion.profiles?.display_name ?? "Unknown"} &middot;{" "}
          {new Date(suggestion.created_at).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}
