import { createClient } from "@supabase/supabase-js";

// Configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "http://127.0.0.1:54321";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // We'll need to pass this or use the anonymous key if the function allows (it handles its own auth usually, but let's check)

// Note: The edge functions check for 'Authorization: Bearer <SECRET>'
// We will use fetch directly to the function URL.

const FUNCTION_BASE_URL = `${SUPABASE_URL}/functions/v1`;
const AUTH_HEADER = `Bearer ${process.argv[2]}`; // Pass key as arg

if (!process.argv[2]) {
  console.error(
    "Please provide the Supabase Service Role Key as the first argument."
  );
  process.exit(1);
}

const START_DATE = new Date("2026-01-01");
const END_DATE = new Date("2026-01-16"); // Generate up to today/tomorrow

async function generateForDate(dateStr) {
  console.log(`\nProcessing ${dateStr}...`);

  // 1. Generate
  console.log(`- Generating...`);
  const genRes = await fetch(`${FUNCTION_BASE_URL}/generate-daily-horoscopes`, {
    method: "POST",
    headers: {
      Authorization: AUTH_HEADER,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ date: dateStr }),
  });

  if (!genRes.ok) {
    console.error(
      `  X Generation failed: ${genRes.status} ${genRes.statusText}`
    );
    const text = await genRes.text();
    console.error("  ", text);
    return;
  }

  const genData = await genRes.json();
  console.log(`  ✓ Generated: ${genData.message} (${genData.persona})`);

  // 2. Publish
  console.log(`- Publishing...`);
  const pubRes = await fetch(`${FUNCTION_BASE_URL}/publish-horoscopes`, {
    method: "POST",
    headers: {
      Authorization: AUTH_HEADER,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ date: dateStr }),
  });

  if (!pubRes.ok) {
    console.error(`  X Publishing failed: ${pubRes.status}`);
    return;
  }

  const pubData = await pubRes.json();
  console.log(`  ✓ Published: ${pubData.message}`);
}

async function main() {
  let curr = new Date(START_DATE);
  while (curr <= END_DATE) {
    const dateStr = curr.toISOString().split("T")[0];
    await generateForDate(dateStr);

    // Advance date
    curr.setDate(curr.getDate() + 1);

    // Wait a bit to be nice to the API
    await new Promise((r) => setTimeout(r, 1000));
  }
}

main();
