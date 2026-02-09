import { useState } from "react";
import type { Suggestion } from "../lib/database.types";
import { truncatePitch } from "./SuggestionDetail";

type SuggestionWithProfile = Suggestion & {
  profiles?: { display_name: string } | null;
};

const CARD_IMAGE_CLASS = "absolute inset-0 w-full h-full object-cover rounded-t-lg";

export function SuggestionCard({
  suggestion,
  isSelected,
  onSelect,
}: {
  suggestion: SuggestionWithProfile;
  isSelected?: boolean;
  onSelect?: () => void;
}) {
  const [imgLoaded, setImgLoaded] = useState(false);
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
      className={`card bg-base-100 shadow-sm cursor-pointer transition-all overflow-hidden ${
        isSelected ? "ring-2 ring-primary" : "hover:shadow-md"
      }`}
    >
      {suggestion.main_image_url && (
        <figure className="relative w-full aspect-[2/1] bg-base-300 shrink-0">
          {!imgLoaded && (
            <div className="absolute inset-0 animate-pulse bg-base-300 rounded-t-lg" aria-hidden />
          )}
          <img
            src={suggestion.main_image_url}
            alt=""
            className={`${CARD_IMAGE_CLASS} ${!imgLoaded ? "opacity-0" : "opacity-100"} transition-opacity`}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
          />
        </figure>
      )}
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
