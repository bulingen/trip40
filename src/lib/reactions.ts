/**
 * Play: Reactions — score scale -1 to +2 and SVG assets.
 * SVGs live in public/reactions/ and are served at /reactions/{name}.svg.
 */

export const REACTION_SCORES = [-1, 0, 1, 2] as const;
export type ReactionScore = (typeof REACTION_SCORES)[number];

const PATHS = [
  "/reactions/badscore.svg",    // -1
  "/reactions/neutralscore.svg", // 0
  "/reactions/goodscore.svg",    // 1
  "/reactions/topscore.svg",     // 2
];

export function getReactionSvgPath(score: ReactionScore): string {
  return PATHS[score + 1];
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
