import { useState } from "react";
import { Link } from "react-router-dom";
import type { Suggestion } from "../lib/database.types";
import { ExternalLinkIcon } from "./ExternalLinkIcon";
import { LeftChevronIcon } from "./LeftChevronIcon";

type SuggestionWithProfile = Suggestion & {
  profiles?: { display_name: string } | null;
};

const TRUNCATE_LEN = 120;

function SuggestionImage({ url, className }: { url: string; className?: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="relative w-full max-w-[280px] min-h-[120px]">
      {!loaded && (
        <div className="absolute inset-0 animate-pulse rounded-lg bg-base-300" aria-hidden />
      )}
      <img
        src={url}
        alt=""
        className={`${className ?? ""} ${!loaded ? "opacity-0" : "opacity-100"} transition-opacity relative`}
        loading="lazy"
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}

function streetViewUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps?layer=c&cbll=${lat},${lng}`;
}

function restaurantsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/search/restaurants/@${lat},${lng},15z`;
}

export function SuggestionDetail({
  suggestion,
  onBack,
  editLink,
}: {
  suggestion: SuggestionWithProfile;
  onBack: () => void;
  editLink?: string;
}) {
  const hasCoords = suggestion.lat != null && suggestion.lng != null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <button
          type="button"
          className="btn btn-ghost btn-sm -ml-2 flex items-center gap-2"
          onClick={onBack}
        >
          <LeftChevronIcon /> Back to all
        </button>
        {editLink && (
          <Link to={editLink} className="btn btn-outline btn-sm">
            Edit
          </Link>
        )}
      </div>

      <h2 className="text-xl font-bold">{suggestion.title}</h2>

      <p className="text-sm opacity-60">
        {suggestion.author_label ?? suggestion.profiles?.display_name ?? "Unknown"} &middot;{" "}
        {new Date(suggestion.created_at).toLocaleDateString()}
      </p>

      {suggestion.main_image_url && (
        <SuggestionImage url={suggestion.main_image_url} className="rounded-lg object-cover max-h-48 w-full sm:max-w-[280px]" />
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
            className="btn btn-outline btn-sm flex items-center gap-2"
          >
            Street View
            <ExternalLinkIcon />
          </a>
          <a
            href={restaurantsUrl(suggestion.lat!, suggestion.lng!)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline btn-sm flex items-center gap-2"
          >
            Restaurants nearby
            <ExternalLinkIcon />
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
