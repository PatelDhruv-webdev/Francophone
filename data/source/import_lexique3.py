#!/usr/bin/env python3
"""
import_lexique3.py — Pull vocabulary from Lexique 3 into Supabase.

Lexique 3 is a free French lexical database with 142,000+ word forms.
Each word includes lemma, POS, gender, frequency (book + film), syllabic structure, etc.

LICENSE WARNING:
  Lexique 3 is CC BY-NC-SA 4.0 → free for non-commercial use only.
  If FrancoPath stays free and educational, you're fine.
  If you ever monetize, swap to CEFRLex (CC BY 4.0) instead.

Source: http://www.lexique.org/
Direct download: http://www.lexique.org/databases/Lexique383/Lexique383.tsv

Usage:
  pip install supabase pandas
  export SUPABASE_URL=https://your-project.supabase.co
  export SUPABASE_SERVICE_KEY=your-service-role-key
  python import_lexique3.py
"""

import os
import csv
import sys
from pathlib import Path
from urllib.request import urlretrieve

# pip install supabase
from supabase import create_client

LEXIQUE_URL = "http://www.lexique.org/databases/Lexique383/Lexique383.tsv"
LEXIQUE_FILE = Path("Lexique383.tsv")

# Map Lexique POS codes to our schema
POS_MAP = {
    "NOM": "noun",
    "VER": "verb",
    "ADJ": "adjective",
    "ADV": "adverb",
    "PRO:per": "pronoun",
    "PRO:pos": "determiner",
    "PRO:dem": "pronoun",
    "PRO:ind": "pronoun",
    "PRO:int": "pronoun",
    "PRO:rel": "pronoun",
    "PRE": "preposition",
    "CON": "conjunction",
    "ART:def": "determiner",
    "ART:ind": "determiner",
    "ONO": "interjection",
    "AUX": "verb",
    "ADJ:dem": "determiner",
    "ADJ:pos": "determiner",
    "ADJ:ind": "determiner",
    "ADJ:int": "determiner",
    "ADJ:num": "number",
}


def download_lexique():
    """Download Lexique 3 if not present."""
    if LEXIQUE_FILE.exists():
        print(f"✓ {LEXIQUE_FILE} already present, skipping download.")
        return
    print(f"Downloading Lexique 3 from {LEXIQUE_URL}...")
    urlretrieve(LEXIQUE_URL, LEXIQUE_FILE)
    print("✓ Download complete.")


def estimate_cefr_level(freq_film, freq_book):
    """
    Rough CEFR mapping based on combined frequency.
    Lexique uses occurrences-per-million. Higher = more common = lower CEFR level.

    These thresholds are approximate. Calibrate with CEFRLex if you want precise levels.
    """
    combined = (float(freq_film or 0) + float(freq_book or 0)) / 2

    if combined > 100:
        return "A1"
    elif combined > 30:
        return "A2"
    elif combined > 10:
        return "B1"
    elif combined > 3:
        return "B2"
    elif combined > 0.5:
        return "C1"
    else:
        return "C2"


def normalize_pos(lexique_pos):
    """Convert Lexique POS code to our schema."""
    # Try exact match first, then prefix
    if lexique_pos in POS_MAP:
        return POS_MAP[lexique_pos]
    prefix = lexique_pos.split(":")[0]
    return POS_MAP.get(prefix, "other")


def normalize_gender(lexique_gender):
    """m / f / empty → m / f / null."""
    if lexique_gender == "m":
        return "m"
    elif lexique_gender == "f":
        return "f"
    return None


def parse_lexique():
    """
    Parse Lexique 3 TSV. Yields dicts ready for our schema.

    Lexique 3 columns we use:
      ortho:        spelling form (e.g., "chats")
      phon:         IPA-like phonetics
      lemme:        dictionary form (e.g., "chat")
      cgram:        POS code (e.g., "NOM", "VER", "ADJ")
      genre:        gender ("m", "f", or empty)
      nombre:       number ("s" singular, "p" plural)
      freqlemfilms2: lemma frequency in films (per million)
      freqlemlivres: lemma frequency in books (per million)
      infover:      verb tense info (only for verbs)
    """
    seen_lemmas = set()  # one entry per lemma+POS combo

    with open(LEXIQUE_FILE, encoding="utf-8") as f:
        reader = csv.DictReader(f, delimiter="\t")
        for row in reader:
            lemma = row.get("lemme", "").strip()
            pos = normalize_pos(row.get("cgram", ""))
            ortho = row.get("ortho", "").strip()
            number = row.get("nombre", "")

            # Only take the singular base form to avoid duplicates from inflections
            if not lemma or not pos:
                continue
            if number == "p":  # skip plural inflections
                continue

            key = (lemma, pos)
            if key in seen_lemmas:
                continue
            seen_lemmas.add(key)

            yield {
                "id": f"lex_{lemma.replace(' ', '_').replace(\"'\", '_')}_{pos}",
                "fr": lemma,
                "pos": pos,
                "ipa": row.get("phon", "").strip() or None,
                "gender": normalize_gender(row.get("genre", "")),
                "level": estimate_cefr_level(
                    row.get("freqlemfilms2", 0),
                    row.get("freqlemlivres", 0),
                ),
                "freq_film": float(row.get("freqlemfilms2") or 0),
                "freq_book": float(row.get("freqlemlivres") or 0),
                "source": "lexique3",
            }


def upsert_to_supabase(entries, batch_size=500):
    """Push entries to Supabase in batches."""
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_KEY")
    if not url or not key:
        print("ERROR: Set SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables.")
        sys.exit(1)

    client = create_client(url, key)

    batch = []
    total = 0
    for entry in entries:
        batch.append(entry)
        if len(batch) >= batch_size:
            client.table("vocabulary").upsert(batch, on_conflict="id").execute()
            total += len(batch)
            print(f"  Imported {total}...")
            batch = []

    if batch:
        client.table("vocabulary").upsert(batch, on_conflict="id").execute()
        total += len(batch)

    print(f"✓ Imported {total} entries total.")


def main():
    download_lexique()
    print("Parsing Lexique 3...")
    entries = list(parse_lexique())
    print(f"✓ Parsed {len(entries)} unique lemma+POS combinations.")

    # Show distribution
    from collections import Counter
    by_level = Counter(e["level"] for e in entries)
    by_pos = Counter(e["pos"] for e in entries)
    print(f"  By level: {dict(by_level)}")
    print(f"  By POS: {dict(by_pos)}")

    upsert_to_supabase(entries)


if __name__ == "__main__":
    main()