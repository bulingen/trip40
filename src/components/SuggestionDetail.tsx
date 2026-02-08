import type { Suggestion } from "../lib/database.types";

type SuggestionWithProfile = Suggestion & {
  profiles?: { display_name: string } | null;
};

const TRUNCATE_LEN = 120;

function streetViewUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps?layer=c&cbll=${lat},${lng}`;
}

function restaurantsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/search/restaurants/@${lat},${lng},15z`;
}

export function SuggestionDetail({
  suggestion,
  onBack,
}: {
  suggestion: SuggestionWithProfile;
  onBack: () => void;
}) {
  const hasCoords = suggestion.lat != null && suggestion.lng != null;

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        className="btn btn-ghost btn-sm self-start -ml-2"
        onClick={onBack}
      >
        &larr; Back to all
      </button>

      <h2 className="text-xl font-bold">{suggestion.title}</h2>

      {suggestion.profiles && (
        <p className="text-sm opacity-60">
          {suggestion.profiles.display_name} &middot;{" "}
          {new Date(suggestion.created_at).toLocaleDateString()}
        </p>
      )}

      <div className="prose prose-sm max-w-none">
        <p className="whitespace-pre-wrap">{suggestion.description || "—"}</p>
      </div>

      {hasCoords && (
        <div className="flex flex-wrap gap-2 mt-2">
          <a
            href={streetViewUrl(suggestion.lat!, suggestion.lng!)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline btn-sm"
          >
            Street View
          </a>
          <a
            href={restaurantsUrl(suggestion.lat!, suggestion.lng!)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline btn-sm"
          >
            Restaurants nearby
          </a>
        </div>
      )}
    </div>
  );
}

export function truncatePitch(text: string | null, maxLen: number = TRUNCATE_LEN): string {
  if (!text) return "";
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen).trim() + "…";
}

export { TRUNCATE_LEN };
