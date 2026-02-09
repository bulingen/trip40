1. Play: Swipe (thumbs up/down)
Flow: Game mode shows one suggestion at a time; user taps up or down; store and show next until you’ve gone through the set (or a subset).
Storage: One row per user per suggestion, e.g.
swipe_votes(trip_id, user_id, suggestion_id, vote) with vote in ('up','down').
If the same user plays again, upsert (last vote wins).
Ranking: Score = number of “up” votes (or up − down). Sort suggestions by that score.
With multiple users, sum (or average) per suggestion, then sort.
2. Play: Head 2 head
Flow: Show two suggestions “A or B?”; user picks one; store and show next pair. Pairs can be random or systematic (e.g. round-robin so each suggestion is shown similar times).
Storage: One row per comparison, e.g.
head2head_comparisons(trip_id, user_id, winner_id, loser_id)
(winner_id/loser_id = suggestion_id).
Ranking:
Simple: For each suggestion, score = number of times it was chosen. Sort by that.
Fancier: Bradley–Terry or Elo so strength is estimated from the whole comparison graph; still ends in a ranking.
Start with “wins” and add a proper model later if you want.
3. Play: Rate (1–5 stars)
Flow: One suggestion at a time; user gives 1–5 stars; store and next.
Storage: One row per user per suggestion, e.g.
ratings(trip_id, user_id, suggestion_id, stars)
Upsert if they rate again.
Ranking: Score = average stars per suggestion. Sort by that.
Optionally multiply by log(1 + count) or similar so suggestions with more ratings aren’t penalized for being “controversial.”
Unified “game mode” idea
One route per game, e.g. /trips/:id/play/swipe, /trips/:id/play/head2head, /trips/:id/play/rate.
Shared UX: load trip + suggestions (and for head2head, maybe precompute pairs). One “challenge” per screen (one suggestion for swipe/rate, two for head2head). On submit: write to the right table, then either next challenge or “done” → redirect to list/map.
“Results” can be a view that sorts suggestions by that game’s score (and later by a combined score if you want).
Feasibility
All three are feasible and simple: one or two tables, clear scoring rules, straightforward “game mode” flow.
Storing results is trivial; ranking is a single query (count/avg) per game. Combining games later (e.g. weighted blend of swipe score, head2head wins, and star average) is optional and also straightforward.

4. Eliminator / bracket
Show 4 (or 8) at a time; “pick your favourite” → that one advances, rest drop out. Repeat in rounds until you have a small shortlist.
Storage: just the round outcomes (e.g. bracket_round(trip_id, user_id, round, suggestion_ids, winner_id)). Ranking = how far each suggestion got (finalist > semi > quarter, etc.).
5. “Top 3” / forced ranking
“Pick your top 3 from this set” (or drag to order).
Storage: rankings(trip_id, user_id, suggestion_id, position 1..n). Score = average position (lower = better) or points (1st=3, 2nd=2, 3rd=1).
6. Budget / constraint sliders
“How much would you spend on a day here?” or “How many days would you want here?” (1–5).
Storage: constraint_answers(trip_id, user_id, suggestion_id, question_key, value). Not a “game” but gives you a score (e.g. total budget or total days) and filters (e.g. “only show where I said 3+ days”).
7. “Would remove”
Single question: “Which one would you definitely not want?” Pick one (or more).
Storage: removals(trip_id, user_id, suggestion_id). Ranking = exclude these, or rank the rest by other games.
8. Pairwise “same or different?”
“Are these two similar for you?” (same vibe / different vibe).
Storage: pairs + same/different. Use for clustering (“these 5 are similar”) or to avoid putting two “same vibe” options in a head2head later.
9. Quick “heat” check
One screen: all suggestions with “Cold / OK / Hot” (or 1–3).
Storage: like swipe but three-way. Score = count(Hot) or 3×Hot + 2×OK + 1×Cold. Very fast to run and easy to combine with Swipe/Rate later.
10. “If we could only do one”
Single question: “If the trip could only include one of these, which would it be?”
Storage: one row per user (trip_id, user_id, suggestion_id). Score = votes. Good as a final tie-breaker or sanity check.
Easiest to add later:
Top 3 (one screen, clear ranking).
Heat check (one screen, 3 levels).
Would remove (complements Swipe by explicitly marking “no”.
Most informative for ranking:
Head 2 head and Swipe already give a lot.
Top 3 or “If we could only do one” give a clear order when you have few options.
I can turn any of these into a short “flow + storage + ranking” block like in Game-modes.md so you can paste them in.