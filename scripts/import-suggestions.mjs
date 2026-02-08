#!/usr/bin/env node
/**
 * Import suggestions from a JSON file into Supabase (e.g. production).
 *
 * Usage (do not commit .env or suggestions-input.json):
 *   SUPABASE_URL=https://xxx.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key \
 *   TRIP_ID=uuid-of-the-trip \
 *   CREATED_BY=uuid-of-your-profile \
 *   node scripts/import-suggestions.mjs
 *
 * Get CREATED_BY: Supabase Dashboard → Table Editor → profiles → your row → copy id.
 * Get SUPABASE_SERVICE_ROLE_KEY: Project Settings → API → service_role (secret).
 *
 * Input file: scripts/suggestions-input.json
 * Format: [ { "title": "...", "description": "...", "lat": 41.38, "lng": 2.16 }, ... ]
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const url = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const tripId = process.env.TRIP_ID;
const createdBy = process.env.CREATED_BY;

if (!url || !serviceRoleKey || !tripId || !createdBy) {
  console.error(
    "Missing env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, TRIP_ID, CREATED_BY"
  );
  process.exit(1);
}

const inputPath = join(__dirname, "suggestions-input.json");
let raw;
try {
  raw = readFileSync(inputPath, "utf8");
} catch (e) {
  console.error("Could not read", inputPath, e.message);
  process.exit(1);
}

let rows;
try {
  rows = JSON.parse(raw);
} catch (e) {
  console.error("Invalid JSON in", inputPath, e.message);
  process.exit(1);
}

if (!Array.isArray(rows)) {
  console.error("JSON must be an array of { title, description?, lat?, lng? }");
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey);

const toInsert = rows.map((r) => ({
  trip_id: tripId,
  created_by: createdBy,
  title: r.title ?? "",
  description: r.description ?? "",
  lat: r.lat ?? null,
  lng: r.lng ?? null,
}));

const { data, error } = await supabase.from("suggestions").insert(toInsert).select("id");

if (error) {
  console.error("Insert failed:", error.message);
  process.exit(1);
}

console.log("Inserted", data.length, "suggestions.");
