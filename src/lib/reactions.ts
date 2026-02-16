/**
 * Play: Reactions — score scale -1 to +2.
 * Uses Twemoji SVGs (https://github.com/twitter/twemoji) via jsDelivr CDN.
 * -1: face screaming in fear, 0: handshake, 1: smiling face with smiling eyes, 2: heart
 */

export const REACTION_SCORES = [-1, 0, 1, 2] as const;
export type ReactionScore = (typeof REACTION_SCORES)[number];

const TWEMOJI_CDN = "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg";
// Twemoji filenames are lowercase hex: 1f631 screaming, 1f91d handshake, 1f604 smiling, 2764 heart
const TWEMOJI_URLS = [
  `${TWEMOJI_CDN}/1f631.svg`,  // -1 face screaming in fear
  `${TWEMOJI_CDN}/1f91d.svg`,  // 0 handshake
  `${TWEMOJI_CDN}/1f604.svg`,  // 1 smiling face with smiling eyes
  `${TWEMOJI_CDN}/2764.svg`,   // 2 heart
];

export function getReactionSvgPath(score: ReactionScore): string {
  return TWEMOJI_URLS[score + 1];
}

/** Round an average (e.g. 1.2) to the nearest valid reaction score for display. */
export function roundAverageToNearestScore(average: number): ReactionScore {
  if (average <= -0.5) return -1;
  if (average < 0.5) return 0;
  if (average < 1.5) return 1;
  return 2;
}

export function isValidReactionScore(n: number): n is ReactionScore {
  return REACTION_SCORES.includes(n as ReactionScore);
}
