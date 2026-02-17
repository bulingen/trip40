/**
 * Play: Reactions — 1–5 star rating with emojis.
 * Uses Twemoji SVGs (https://github.com/twitter/twemoji) via jsDelivr CDN.
 * 1: screaming, 2: thinking, 3: slightly smiling, 4: smiling with smiling eyes, 5: heart eyes
 */

export const REACTION_SCORES = [1, 2, 3, 4, 5] as const;
export type ReactionScore = (typeof REACTION_SCORES)[number];

const TWEMOJI_CDN = "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg";
const TWEMOJI_URLS: Record<ReactionScore, string> = {
  1: `${TWEMOJI_CDN}/1f631.svg`,  // face screaming in fear
  2: `${TWEMOJI_CDN}/1f914.svg`,  // thinking face
  3: `${TWEMOJI_CDN}/1f642.svg`,  // slightly smiling face
  4: `${TWEMOJI_CDN}/1f60a.svg`,  // smiling face with smiling eyes
  5: `${TWEMOJI_CDN}/1f60d.svg`,  // heart eyes
};

export function getReactionSvgPath(score: ReactionScore): string {
  return TWEMOJI_URLS[score];
}

/** Round an average (e.g. 3.4) to the nearest 1–5 for display. */
export function roundAverageToNearestScore(average: number): ReactionScore {
  const n = Math.round(average);
  if (n <= 1) return 1;
  if (n >= 5) return 5;
  return n as ReactionScore;
}

export function isValidReactionScore(n: number): n is ReactionScore {
  return Number.isInteger(n) && n >= 1 && n <= 5;
}
