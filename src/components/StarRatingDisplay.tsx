import type { ReactionScore } from "../lib/reactions";

/** Read-only star rating (1–5 whole stars). Uses daisyUI rating. */
export function StarRatingDisplay({ value, size = "rating-md" }: { value: ReactionScore; size?: "rating-xs" | "rating-sm" | "rating-md" | "rating-lg" | "rating-xl" }) {
  return (
    <div className={`rating gap-0.5 ${size}`}>
      {([1, 2, 3, 4, 5] as const).map((star) => (
        <div
          key={star}
          className={`mask mask-star-2 bg-warning shrink-0 ${star <= value ? "opacity-100" : "opacity-20"}`}
          aria-hidden
        />
      ))}
    </div>
  );
}
