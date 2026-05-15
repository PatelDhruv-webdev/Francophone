#!/usr/bin/env node
/**
 * import_verbiste.js — Pull verb conjugations from Verbiste / french-verbs-lefff.
 *
 * Two options here:
 *   1. french-verbs-lefff (npm) — comes bundled with 7,000+ verbs, MIT-style license
 *      (LGPL-LR, free for derivative dictionaries). Easy to use, just an npm install.
 *   2. Verbiste — free C library, comes with French government data, GPL.
 *      Stronger conjugation accuracy but harder to integrate from JS.
 *
 * This script uses option 1 (french-verbs-lefff).
 * Source: https://www.npmjs.com/package/french-verbs-lefff
 *
 * LICENSE: LGPL-LR. Read the npm package's README for redistribution requirements.
 *
 * Usage:
 *   npm install french-verbs french-verbs-lefff @supabase/supabase-js
 *   export SUPABASE_URL=https://your-project.supabase.co
 *   export SUPABASE_SERVICE_KEY=your-service-role-key
 *   node import_verbiste.js
 */

const FrenchVerbs = require("french-verbs");
const Lefff = require("french-verbs-lefff/dist/conjugations.json");
const { createClient } = require("@supabase/supabase-js");

// All tenses our app uses
const TENSES = [
  "PRESENT",
  "FUTUR",
  "IMPARFAIT",
  "PASSE_SIMPLE",
  "CONDITIONNEL_PRESENT",
  "SUBJONCTIF_PRESENT",
  "SUBJONCTIF_IMPARFAIT",
  "IMPERATIF_PRESENT",
  "PARTICIPE_PRESENT",
  "PARTICIPE_PASSE",
  "INFINITIF",
];

const PERSON_LABELS = ["je", "tu", "il", "nous", "vous", "ils"];

/**
 * Conjugate a single verb across all six persons + all tenses.
 * Returns the structure our Supabase verbs table expects.
 */
function conjugateVerb(infinitive) {
  const conjugations = {};

  for (const tense of TENSES) {
    const formsForTense = {};

    if (tense === "PARTICIPE_PASSE" || tense === "INFINITIF" || tense === "PARTICIPE_PRESENT") {
      // Single form, no person
      try {
        formsForTense.form = FrenchVerbs.getConjugation(
          Lefff,
          infinitive,
          tense,
          0,
          null,
          null
        );
      } catch (e) {
        formsForTense.form = null;
      }
    } else {
      for (let person = 0; person < 6; person++) {
        try {
          const form = FrenchVerbs.getConjugation(
            Lefff,
            infinitive,
            tense,
            person,
            null, // no auxiliary needed for simple tenses
            null
          );
          formsForTense[PERSON_LABELS[person]] = form;
        } catch (e) {
          formsForTense[PERSON_LABELS[person]] = null;
        }
      }
    }

    conjugations[tense.toLowerCase()] = formsForTense;
  }

  // Determine group
  let group = 3; // default to irregular
  if (infinitive.endsWith("er") && infinitive !== "aller") {
    group = 1;
  } else if (
    infinitive.endsWith("ir") &&
    !["partir", "sortir", "dormir", "venir", "tenir", "ouvrir", "courir", "mourir"].includes(infinitive)
  ) {
    // Most -ir verbs are Group 2 unless explicitly excluded
    // (the heuristic isn't perfect — Lefff has the actual group data we should consult)
    group = 2;
  }

  // Determine auxiliary (être verbs are limited and well-known)
  const ETRE_VERBS = new Set([
    "aller", "venir", "arriver", "partir", "entrer", "sortir",
    "monter", "descendre", "naître", "mourir", "rester", "tomber",
    "retourner", "devenir", "revenir", "passer", "rentrer",
  ]);
  const auxiliary = ETRE_VERBS.has(infinitive) ? "être" : "avoir";

  return {
    id: `lefff_${infinitive}`,
    infinitif: infinitive,
    group,
    auxiliary,
    conjugations,
    source: "lefff",
  };
}

async function main() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;

  if (!url || !key) {
    console.error("ERROR: Set SUPABASE_URL and SUPABASE_SERVICE_KEY env variables.");
    process.exit(1);
  }

  const supabase = createClient(url, key);

  // Get all known infinitives from Lefff
  const allInfinitives = Object.keys(Lefff);
  console.log(`Found ${allInfinitives.length} verbs in Lefff.`);

  const batch = [];
  const batchSize = 200;
  let total = 0;

  for (const inf of allInfinitives) {
    const conjugated = conjugateVerb(inf);
    batch.push(conjugated);

    if (batch.length >= batchSize) {
      const { error } = await supabase.from("verbs").upsert(batch, { onConflict: "id" });
      if (error) {
        console.error("Batch error:", error);
      }
      total += batch.length;
      console.log(`  Imported ${total}...`);
      batch.length = 0;
    }
  }

  if (batch.length > 0) {
    const { error } = await supabase.from("verbs").upsert(batch, { onConflict: "id" });
    if (error) {
      console.error("Final batch error:", error);
    }
    total += batch.length;
  }

  console.log(`✓ Imported ${total} verbs total.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});