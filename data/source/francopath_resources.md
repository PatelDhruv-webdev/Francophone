# FrancoPath — Master Resources Document

> Every free/freemium API, dataset, content source, and tool you can pull from to build the platform without paying for content. Organized by what you'll use it for. Last updated for the v1 build.

---

## Table of Contents

1. [Vocabulary & Word Lists (CEFR-aligned)](#1-vocabulary--word-lists-cefr-aligned)
2. [Dictionaries & Definitions](#2-dictionaries--definitions)
3. [Conjugation Data](#3-conjugation-data)
4. [Example Sentences](#4-example-sentences)
5. [Grammar References](#5-grammar-references)
6. [Reading — Graded & Authentic](#6-reading--graded--authentic)
7. [Listening — Podcasts, News, Video](#7-listening--podcasts-news-video)
8. [Audio: Pronunciation & TTS](#8-audio-pronunciation--tts)
9. [Speech-to-Text (for speaking practice)](#9-speech-to-text-for-speaking-practice)
10. [Translation APIs](#10-translation-apis)
11. [Images for Picture Vocabulary](#11-images-for-picture-vocabulary)
12. [Open NLP/ML Datasets](#12-open-nlpml-datasets)
13. [Anki Shared Decks (free reusable content)](#13-anki-shared-decks-free-reusable-content)
14. [Writing Feedback & Grammar Checking](#14-writing-feedback--grammar-checking)
15. [Speaking Practice Communities](#15-speaking-practice-communities)
16. [Academic & Linguistic Sources](#16-academic--linguistic-sources)
17. [Existing Apps to Study (Competitor Inspiration)](#17-existing-apps-to-study-competitor-inspiration)
18. [Canadian / Quebec French Resources](#18-canadian--quebec-french-resources)
19. [Free Tools You'll Use While Building](#19-free-tools-youll-use-while-building)
20. [License & Attribution Cheat Sheet](#20-license--attribution-cheat-sheet)

---

## 1. Vocabulary & Word Lists (CEFR-aligned)

The single hardest content task is getting clean, CEFR-graded vocabulary. These are your starting points.

| Source                                       | What it gives you                                          | License                              | Notes                                                                         |
| -------------------------------------------- | ---------------------------------------------------------- | ------------------------------------ | ----------------------------------------------------------------------------- |
| **CEFRLex / FLELex**                         | Frequency-graded French vocab tagged A1–C2                 | CC BY (academic)                     | Gold-standard for graded vocab. Download CSV from cental.uclouvain.be/cefrlex |
| **Lexique 3 (lexique.org)**                  | 140k+ French words with frequency, syllables, phonemes     | CC BY-NC-SA                          | Required for any frequency-based ordering                                     |
| **Français Fondamental (Gougenheim)**        | Classic 1500-word A1/A2 list                               | Public domain                        | Old but battle-tested core vocab                                              |
| **Kelly List (French)**                      | ~9000 words by CEFR level (KEy Lexical items for Learners) | CC BY                                | Built specifically for language learners                                      |
| **OpenSubtitles word frequency**             | What people actually say in French films                   | Open                                 | Skews colloquial — pair with formal lists                                     |
| **French Wiktionary frequency lists**        | fr.wiktionary.org/wiki/Wiktionnaire:Listes_de_fréquence    | CC BY-SA                             | Great free fallback                                                           |
| **Routledge Frequency Dictionary of French** | 5000 most common words with examples                       | NOT free, but reference-only is fine | The canonical sequence — skim a library copy for ordering ideas               |

**Build action:** Start with FLELex as your A1/A2 word source. Cross-reference Lexique 3 for frequency. Tag each word with CEFR level + theme + part of speech in your `lessons` table.

---

## 2. Dictionaries & Definitions

| Source                                                             | API?                       | Use                                           |
| ------------------------------------------------------------------ | -------------------------- | --------------------------------------------- |
| **Wiktionary REST API** (`https://fr.wiktionary.org/api/rest_v1/`) | Yes, free, no key          | Definitions, etymology, IPA, example uses     |
| **DBnary** (kaiko.getalp.org/about-dbnary)                         | RDF/SPARQL endpoint        | Wiktionary as structured linked data          |
| **WordNet (WOLF — French WordNet)**                                | Download                   | Synonyms, hypernyms, semantic relations       |
| **Le Dictionnaire des Synonymes (CRISCO)**                         | Scrape sparingly / cache   | crisco2.unicaen.fr — best French synonym tool |
| **TLFi (Trésor de la Langue Française informatisé)**               | Public access via atilf.fr | Authoritative scholarly definitions           |
| **Reverso Context**                                                | No public API; link out    | Show users contextual translations            |
| **Larousse / Le Robert**                                           | Paid APIs; link out only   | Cite as references                            |

**Build action:** Use Wiktionary REST API for definitions on hover/click. Cache aggressively in your DB so you're not hitting it on every word click.

---

## 3. Conjugation Data

| Source                                         | How                                                    | Notes                                                                 |
| ---------------------------------------------- | ------------------------------------------------------ | --------------------------------------------------------------------- |
| **Verbiste** (sarrazip.com/dev/verbiste.html)  | Open-source XML database of ~7000 French verbs         | GPL — best free conjugation engine. Bundle the XML, parse server-side |
| **DELA-fr**                                    | Electronic dictionary with full inflection             | Academic license                                                      |
| **French Verb Conjugator (npm: french-verbs)** | npm packages like `french-verbs-lefff`, `french-verbs` | MIT — drop into Node easily                                           |
| **Wiktionary conjugation tables**              | Scrape via REST API                                    | Each verb page has full conjugation                                   |
| **Le Conjugueur (leconjugueur.lefigaro.fr)**   | Reference only — no API                                | Link out for users who want a deeper view                             |

**Build action:** Bundle Verbiste's XML or use the `french-verbs-lefff` npm package. Pre-compute conjugations into your DB so quizzes are instant.

---

## 4. Example Sentences

Crucial for "use the word in context" — the difference between memorization and actual learning.

| Source                                   | License                      | Notes                                                                                     |
| ---------------------------------------- | ---------------------------- | ----------------------------------------------------------------------------------------- |
| **Tatoeba** (tatoeba.org)                | CC BY 2.0 FR                 | 400k+ FR sentences, many with English translations and audio. Download SQL dumps directly |
| **OPUS Parallel Corpora** (opus.nlpl.eu) | Mixed, mostly free           | Massive parallel EN-FR text from EU docs, books, subtitles                                |
| **OpenSubtitles dataset (via OPUS)**     | Open                         | Colloquial spoken French — gold for listening                                             |
| **Linguee / DeepL examples**             | No API, scraping discouraged | Reference quality benchmark                                                               |
| **Reverso Context**                      | No public API                | Link out only                                                                             |
| **Glosbe API** (glosbe.com/a-api)        | Free with rate limits        | Multilingual example sentences                                                            |

**Build action:** Download the Tatoeba French + English SQL dumps once, import locally, and serve sentences from your own DB. This avoids any API dependency and is fast.

---

## 5. Grammar References

For your grammar lesson content (write in your own words, but reference these for accuracy):

| Resource                                       | Strength                                                               |
| ---------------------------------------------- | ---------------------------------------------------------------------- |
| **Lawless French** (lawlessfrench.com)         | Best free grammar explanations in English, by Laura K. Lawless         |
| **Le Point du FLE** (lepointdufle.net)         | Massive free exercise + lesson directory                               |
| **français facile** (francaisfacile.com)       | Free graded exercises, good lesson structure inspiration               |
| **Bonjour de France** (bonjourdefrance.com)    | Free interactive lessons by level                                      |
| **Académie française** (academie-francaise.fr) | Authoritative on usage rules                                           |
| **BDL (Banque de dépannage linguistique)**     | Quebec — vetdotedu.gouv.qc.ca/bdl — incredible grammar reference, free |
| **Wikipedia: French grammar**                  | Solid overview; cite as starting point                                 |

**Build action:** Use these to fact-check your lesson content. Don't copy — paraphrase and write your own examples.

---

## 6. Reading — Graded & Authentic

Texts your users will actually read inside the app or click out to.

### Public domain / CC-licensed (you can host the text)

| Source                         | What                                                                 |
| ------------------------------ | -------------------------------------------------------------------- |
| **Project Gutenberg (French)** | gutenberg.org/browse/languages/fr — 3000+ public-domain French books |
| **Wikisource (French)**        | fr.wikisource.org — proofread literary texts                         |
| **OpenClassrooms**             | Some technical articles are CC BY                                    |
| **VikiDia**                    | vikidia.org/wiki/Wikijunior — Wikipedia for kids, simpler French     |
| **Vikidia + Wikimini**         | Simpler-French encyclopedias for B1/B2                               |

### Authentic news (link out, don't copy)

| Source                             | Level                                         |
| ---------------------------------- | --------------------------------------------- |
| **RFI Journal en français facile** | A2–B1 — free, with transcripts and slow audio |
| **News in Slow French**            | A2–B2 (free preview, paid full)               |
| **Le Monde**                       | C1+                                           |
| **Le Figaro**                      | B2+                                           |
| **20 Minutes** (20minutes.fr)      | B1+ free                                      |
| **France Info / France Inter**     | All levels                                    |
| **TV5Monde Apprendre**             | Graded video + reading exercises              |
| **1jour1actu**                     | News for kids — perfect A2/B1 reading         |

**Build action:** Host public-domain texts (Gutenberg) inside your reading module. Link out for current news.

---

## 7. Listening — Podcasts, News, Video

| Resource                                | Level | Notes                                                                       |
| --------------------------------------- | ----- | --------------------------------------------------------------------------- |
| **RFI Savoirs**                         | A2–C2 | Best free listening hub — graded by level                                   |
| **Coffee Break French**                 | A1–B2 | Beloved podcast, free episodes                                              |
| **Inner French (Hugo Cotton)**          | B1–B2 | Slow, clear, intermediate gold standard                                     |
| **Français Authentique (Johan Tekfak)** | B1–B2 | Free podcast                                                                |
| **News in Slow French**                 | A2–B2 | Free + paid tiers                                                           |
| **Easy French (YouTube)**               | A1–C1 | Street interviews with subtitles — ideal listening                          |
| **Piece of French (YouTube)**           | A1–B1 |                                                                             |
| **TV5Monde "7 jours sur la planète"**   | B1–C1 | Weekly news with exercises                                                  |
| **France Culture podcasts**             | C1–C2 | Documentaries, deep                                                         |
| **Common Voice (Mozilla)**              | All   | commonvoice.mozilla.org/fr — open dataset of native French audio clips, CC0 |
| **LibriVox (French)**                   | All   | Free public-domain audiobooks                                               |

**Build action:** Embed YouTube videos directly (with transcripts you generate or extract). For original audio, Common Voice is CC0 gold — you can use it freely.

---

## 8. Audio: Pronunciation & TTS

| Service                                | Cost                       | Notes                                                                               |
| -------------------------------------- | -------------------------- | ----------------------------------------------------------------------------------- |
| **Web Speech API (`speechSynthesis`)** | Free, browser-native       | Decent French voices on Chrome/Safari/Edge. No backend needed. Quality varies by OS |
| **Forvo API**                          | Free tier ~500/day         | Native-speaker pronunciations of single words. apifree.forvo.com                    |
| **Common Voice (Mozilla)**             | CC0                        | Pre-recorded French sentences from real speakers                                    |
| **Coqui TTS** (open-source)            | Self-host                  | Run locally if you want full control                                                |
| **Piper TTS**                          | Free, runs in browser/Node | Lightweight neural TTS, has French voices                                           |
| **ElevenLabs**                         | Generous free tier         | Best quality but limited free chars/month                                           |
| **Google Cloud TTS**                   | $4/M chars, 1M free/month  | High quality, French Studio voices excellent                                        |
| **Azure Speech (Neural TTS)**          | 500k free/month            | Great French voices                                                                 |
| **Amazon Polly**                       | 5M free chars/year         | "Léa" voice is solid                                                                |

**Build action:**

- v1: Use Web Speech API for everything. Free, works in browser.
- v2: When users complain about robotic voice, switch core lessons to pre-rendered Azure/Polly audio (cache in S3/Supabase Storage).
- For single-word pronunciations: Forvo API on demand, then cache.

---

## 9. Speech-to-Text (for speaking practice)

| Service                                  | Cost                 | Notes                                                                      |
| ---------------------------------------- | -------------------- | -------------------------------------------------------------------------- |
| **Web Speech API (`SpeechRecognition`)** | Free                 | Works in Chrome/Edge. Decent French accuracy. Privacy: it sends to Google. |
| **Whisper (OpenAI, open-source)**        | Self-host or via API | Best accuracy. `whisper-small` runs on most servers. Multilingual.         |
| **whisper.cpp / Faster-Whisper**         | Free                 | Run in browser via WASM or on your server                                  |
| **Vosk** (alphacephei.com/vosk)          | Free, offline        | Lightweight on-device — great for privacy                                  |
| **Azure Speech-to-Text**                 | Free tier 5h/month   | Good French accuracy                                                       |
| **Deepgram**                             | $200 free credit     | Fast, good French model                                                    |

**Build action:** Web Speech API for v1. If you want offline/privacy, Whisper.cpp via WASM in browser is ~free and impressive.

---

## 10. Translation APIs

| Service                                     | Cost                          | Notes                                                         |
| ------------------------------------------- | ----------------------------- | ------------------------------------------------------------- |
| **LibreTranslate**                          | Free self-host or paid hosted | Open-source, decent quality. Self-host on Render/Fly for free |
| **Argos Translate**                         | Free, on-device               | Python lib — works offline                                    |
| **MyMemory** (mymemory.translated.net/doc/) | Free 5000 words/day           | No key for low usage                                          |
| **DeepL API**                               | Free 500k chars/month         | Best quality FR↔EN                                            |
| **Google Cloud Translation**                | $20/M chars, 500k free/month  | Reliable                                                      |
| **Lingva Translate**                        | Free, no key                  | Privacy-friendly Google Translate frontend                    |

**Build action:** DeepL free tier (500k chars/month) handles a small user base. Beyond that, self-host LibreTranslate.

---

## 11. Images for Picture Vocabulary

| Source                        | License                                                     | API?                                     |
| ----------------------------- | ----------------------------------------------------------- | ---------------------------------------- |
| **Unsplash**                  | Free for any use, no attribution required (but appreciated) | Yes — generous free API                  |
| **Pexels**                    | Free, no attribution required                               | Yes — free API                           |
| **Pixabay**                   | Free, no attribution                                        | Yes — free API                           |
| **Openverse** (openverse.org) | Aggregates CC content from Flickr, Wikimedia, etc.          | Yes — free API                           |
| **Wikimedia Commons**         | CC / public domain                                          | Yes — free                               |
| **Flaticon (free tier)**      | Attribution required                                        | Limited free downloads                   |
| **Noun Project**              | Attribution required                                        | Icons, not photos                        |
| **The Met Open Access**       | CC0                                                         | Art images — useful for cultural lessons |

**Build action:** For ~3000 A1/A2 vocab words, batch-curate images via Unsplash/Pexels APIs. Store URLs in your `vocabulary` table — don't proxy or rehost.

**Pro tip:** Have an admin script that, given a French word, fetches 4 candidate images and lets you (or contributors) pick the best one. This is faster than curating manually.

---

## 12. Open NLP/ML Datasets

For when you want to build smarter features (auto-grading, level detection, sentence generation):

| Dataset                                | Use                                          |
| -------------------------------------- | -------------------------------------------- |
| **Universal Dependencies (UD French)** | Parse trees, POS tags — for grammar feedback |
| **WikiText-FR**                        | Language modeling                            |
| **FrenchQA / FQuAD**                   | Question-answering training data             |
| **French Treebank (FTB)**              | Syntactic parses                             |
| **CCMatrix / OPUS**                    | Parallel sentences                           |
| **HuggingFace Datasets**               | Search "french" — hundreds of options        |
| **CoNLL-U French**                     | Tokenized, lemmatized text                   |

**Build action:** You probably won't touch these in v1. Bookmark for v2 features (auto-grading writing, generating distractors for MCQs).

---

## 13. Anki Shared Decks (free reusable content)

This is a goldmine. People have already built and refined CEFR vocab decks.

| Deck                                 | Find at                         |
| ------------------------------------ | ------------------------------- |
| **5000 Most Common French Words**    | ankiweb.net/shared/decks/french |
| **Fluent Forever French (deck)**     | Many shared versions            |
| **Assimil French (community decks)** | Search Anki Shared              |
| **TV5Monde-derived decks**           | Various                         |

**License caveat:** Anki decks are user-shared — many include copyrighted images/audio from textbooks. Use as **reference for word ordering and example structure**, not as direct content imports.

**Build action:** Export an Anki deck, parse the .apkg (it's just SQLite), study the ordering and difficulty curve, then build your own list.

---

## 14. Writing Feedback & Grammar Checking

For the writing module:

| Tool                                | Cost                     | Notes                                                                                       |
| ----------------------------------- | ------------------------ | ------------------------------------------------------------------------------------------- |
| **LanguageTool** (languagetool.org) | Free self-host or hosted | Open-source grammar checker, excellent French rules. **The single best free tool here.**    |
| **BonPatron / Antidote**            | Paid only — link out     | The "professional" tools                                                                    |
| **Grammalecte**                     | Free, open-source        | French-only grammar/style checker, runs in Firefox/LibreOffice                              |
| **Hemingway-style readability**     | Build your own           | Use Lexique 3 frequency to estimate reading level                                           |
| **Anthropic Claude API**            | $$                       | For richer "explain your mistake" feedback. Use sparingly — only on user request, not auto. |
| **OpenAI GPT-4o-mini**              | $$ cheap                 | Alternative                                                                                 |

**Build action:** Self-host LanguageTool on a free Render/Fly instance. It's a Java app but easy to deploy. Hit it from your Next.js API routes.

---

## 15. Speaking Practice Communities

For users who want real conversation (link out, don't try to build this):

- **Tandem** (tandem.net) — language exchange app
- **HelloTalk** (hellotalk.com) — text/voice exchange
- **iTalki** (italki.com) — paid tutors, freemium community
- **Conversation Exchange** (conversationexchange.com) — old but free
- **r/French** on Reddit
- **Discord: Learn French servers** — many active ones, free
- **Meetup: French language meetups** — local in-person

**Build action:** Add a "Practice with humans" page that links out, with a short note about each. Don't try to be Tandem.

---

## 16. Academic & Linguistic Sources

For when you need deep accuracy or want advanced features:

- **CNRTL** (cnrtl.fr) — Centre National de Ressources Textuelles et Lexicales. Free corpora, lexicons, etymology.
- **ATILF** (atilf.fr) — Analyse et Traitement Informatique de la Langue Française. Hosts TLFi.
- **OPUS** (opus.nlpl.eu) — Open parallel corpora hub.
- **CLARIN-FR** — Research infrastructure with French corpora.
- **Ortolang** (ortolang.fr) — French open language resource portal. Treasure trove.
- **HAL Open Archive** (hal.science) — Search "FLE" or "didactique du français" for academic research on teaching French.

**Build action:** Bookmark for the future. Ortolang in particular has high-quality datasets you'll want when adding advanced features.

---

## 17. Existing Apps to Study (Competitor Inspiration)

Don't copy — but understand what works and what doesn't:

| App                    | What to steal (conceptually)                                   |
| ---------------------- | -------------------------------------------------------------- |
| **Duolingo**           | Streak/XP gamification, micro-lessons, ruthless onboarding     |
| **Babbel**             | Adult-oriented dialogues, grammar-first lessons                |
| **Busuu**              | Community feedback on writing                                  |
| **Memrise**            | Real native-speaker video clips, mnemonic-driven vocab         |
| **LingQ**              | Reader with click-to-translate, vocab tracking                 |
| **Anki / Mochi**       | SRS done right                                                 |
| **Clozemaster**        | Cloze deletion at scale, gamified                              |
| **Rocket French**      | Long-form audio dialogues with breakdowns                      |
| **TV5Monde Apprendre** | Free, well-structured graded video lessons                     |
| **Lingoda**            | Live class structure (you won't replicate, but observe pacing) |

**Build action:** Make a "feature audit" spreadsheet: each app, each feature, your score 1–5. Steal patterns, not pixels.

---

## 18. Canadian / Quebec French Resources

Since you're in Ontario, you may want Canadian French content too:

- **OQLF (Office québécois de la langue française)** — oqlf.gouv.qc.ca — official Quebec French reference
- **BDL (Banque de dépannage linguistique)** — vetdotedu.gouv.qc.ca/bdl — best Quebec-French grammar Q&A
- **Radio-Canada / ICI Première** — Canadian French audio/news, free
- **Télé-Québec / TV5 Québec Canada** — video content
- **Le Devoir, La Presse, Le Soleil** — Quebec newspapers
- **TermiumPlus** — btb.termiumplus.gc.ca — Government of Canada terminology bank, free, bilingual

**Build action:** Add a "Quebec French" toggle to lessons later — it's a real differentiator for Canadian learners and there are huge accent/vocabulary differences worth teaching.

---

## 19. Free Tools You'll Use While Building

| Tool                    | For                                              |
| ----------------------- | ------------------------------------------------ |
| **Supabase**            | DB + Auth + Storage, free tier generous          |
| **Vercel**              | Hosting, free for hobby                          |
| **Render / Fly.io**     | For hosting LanguageTool, LibreTranslate         |
| **Cloudflare R2**       | Cheap audio storage if Supabase Storage runs out |
| **Resend**              | Email (3000/month free)                          |
| **PostHog**             | Analytics (1M events/month free)                 |
| **Plausible self-host** | Privacy-friendly analytics                       |
| **Sentry**              | Error tracking, free tier                        |
| **GitHub Actions**      | CI/CD, free for public repos                     |
| **Figma**               | Design                                           |
| **Excalidraw**          | Quick diagrams                                   |
| **Audacity**            | Audio editing if you record yourself             |
| **Whisper.cpp**         | Local transcription for content prep             |

---

## 20. License & Attribution Cheat Sheet

A quick reference so you don't accidentally violate licenses:

| License                 | Can you use it commercially?                    | Must attribute? | Must share-alike?                      |
| ----------------------- | ----------------------------------------------- | --------------- | -------------------------------------- |
| **CC0 / Public Domain** | Yes                                             | No              | No                                     |
| **CC BY**               | Yes                                             | Yes             | No                                     |
| **CC BY-SA**            | Yes                                             | Yes             | Yes (your derivative must be CC BY-SA) |
| **CC BY-NC**            | **No** (free apps may be okay; check carefully) | Yes             | No                                     |
| **CC BY-NC-SA**         | **No** for commercial                           | Yes             | Yes                                    |
| **GPL**                 | Yes (with conditions)                           | Yes             | Yes (open-source your code)            |
| **MIT / Apache 2.0**    | Yes                                             | Yes             | No                                     |

**Critical rules:**

1. **Tatoeba is CC BY 2.0 FR** — you can use sentences but must credit "© Tatoeba contributors, CC BY 2.0 FR" somewhere visible.
2. **Lexique 3 is CC BY-NC-SA** — non-commercial. If you ever monetize, replace it with CEFRLex or build your own.
3. **Wikipedia/Wiktionary is CC BY-SA 3.0** — using definitions is fine, but if you reproduce significant text, you'd technically need to share-alike. Paraphrase and credit instead.
4. **Project Gutenberg** — public domain in the US; check French copyright (life + 70 years) for each text.
5. **Common Voice is CC0** — use freely, no strings.
6. **Unsplash/Pexels/Pixabay** — free even for commercial; attribution appreciated, not required.

When in doubt: paraphrase, credit the source, and link out.

---

## Quick-Start Picks (the 10 you'll actually use first)

If this list is overwhelming, here are the ten resources to set up before you write a single line of code:

1. **Tatoeba sentence dump** (download SQL, import to Supabase)
2. **CEFRLex / FLELex** for graded vocab CSV
3. **Verbiste XML** or `french-verbs-lefff` npm package for conjugations
4. **Wiktionary REST API** for definitions on hover
5. **Web Speech API** for TTS + STT in v1
6. **Unsplash API** for vocabulary images
7. **LanguageTool** (self-hosted) for writing feedback
8. **Common Voice** for native audio samples
9. **Project Gutenberg French** for B1+ reading content
10. **RFI Savoirs** (link out) for graded listening

Build the loop with these ten. Everything else in this doc is for v2+.

---

_This is your living resource library. Add to it as you discover new sources. Mark anything you've integrated with ✅ so you can see your content stack growing._
