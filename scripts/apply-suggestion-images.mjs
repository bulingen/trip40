#!/usr/bin/env node
/**
 * Reads scripts/suggestion-images.json and prints SQL to update public.suggestions
 * with main_image_url by title. Each value: one URL (string) or array → first element.
 *
 * Usage: node scripts/apply-suggestion-images.mjs
 * Run the output in Supabase SQL Editor.
 */

import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const data = JSON.parse(readFileSync(join(__dirname, "suggestion-images.json"), "utf8"));

function escapeSql(str) {
  return str.replace(/'/g, "''");
}

console.log("-- Apply main_image_url from suggestion-images.json. Run in Supabase SQL Editor.\n");

for (const [title, value] of Object.entries(data)) {
  const url = typeof value === "string" ? value : Array.isArray(value) ? value[0] : null;
  if (!url) continue;
  const escapedTitle = escapeSql(title);
  const escapedUrl = escapeSql(url);
  console.log(`update public.suggestions set main_image_url = '${escapedUrl}' where title = '${escapedTitle}';`);
}

console.log("\n-- Done.");
