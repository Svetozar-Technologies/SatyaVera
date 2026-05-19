# SatyaVera

**AI Legal Assistant for India** — Know Your Rights. Protect Your Future.

An AI-powered legal assistant that explains your rights in plain Hindi and English with cited law sections and case references.

## Features

- **GandhiAI Chat** — Conversational legal Q&A with cited BNS/BNSS/BSA sections
- **846 Indian Central Acts** — Full text of 34,853 sections, browsable by category
- **Document Drafter** — FIR, RTI, bail applications, notices in proper legal format
- **Rights Guides** — Step-by-step playbooks for common legal situations
- **Lawyer Marketplace** — Find bar-council-verified advocates near you
- **Legal Dictionary** — 4,200+ terms in English and Hindi
- **Emergency SOS** — Helpline numbers and instant rights during arrest/detention
- **Bilingual** — Full English and Hindi support with JSON-based i18n

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS v4 |
| Auth | Firebase Authentication (Email, Google, Phone OTP) |
| Database | Cloud Firestore |
| AI | Vercel AI SDK — Claude, OpenAI, Gemini (swappable via env) |
| i18n | JSON-based (en/hi) with language dropdown |
| Laws Data | 846 acts from [indian-law](https://github.com/Svetozar-Technologies/indian-law) repo |

## Project Structure

```
src/
  app/                    # Next.js pages (21 pages, 27 routes)
    (public)/             # Landing, login, signup, pricing
    (dashboard)/          # Auth-guarded citizen & lawyer dashboards
    api/                  # Chat streaming, document generation
  components/
    ui/                   # Button, Card, Chip, Icon, Field, etc.
    layout/               # PublicNav, AppNav, Sidebar, Footer
  lib/
    firebase/             # config, admin, auth, firestore helpers
    ai/                   # Multi-provider AI service, law search (RAG)
    i18n/                 # Context + translation JSONs (en, hi)
  contexts/               # AuthProvider
  types/                  # TypeScript interfaces
scripts/
  ingest-laws.ts          # Parse .lino files → Firestore (846 acts)
  parse-lino.ts           # Links Notation parser
  law-categories.ts       # Auto-categorization (13 categories)
```

## Getting Started

```bash
# Install
npm install

# Set up environment
cp .env.example .env
# Edit .env with your Firebase and AI provider keys

# Run locally
npm run dev
```

Open http://localhost:3000

## Indian Laws Database

The app includes 846 Indian Central Acts with full section text, sourced from [India Code](https://www.indiacode.nic.in/) via the [indian-law](https://github.com/Svetozar-Technologies/indian-law) repository.

```bash
# Clone the laws repo
git clone https://github.com/Svetozar-Technologies/indian-law.git

# Ingest all laws into Firestore
npm run ingest-laws -- --repo-path ../indian-law

# Dry run (parse only, no Firestore writes)
npm run ingest-laws:dry

# Test with 5 laws
npm run ingest-laws:test

# Re-ingest (update existing)
npm run ingest-laws -- --repo-path ../indian-law --force
```

Laws are auto-categorized into: Criminal, Civil, Constitutional, Property, Family, Labour, Consumer, Women, Corporate, Tax, Environment, Cyber, General.

## AI Provider Configuration

Set `AI_PROVIDER` in `.env` to switch between providers:

| Provider | Value | Model |
|----------|-------|-------|
| Anthropic | `claude` | claude-sonnet-4-20250514 |
| OpenAI | `openai` | gpt-4o |
| Google | `gemini` | gemini-2.0-flash |

## Environment Variables

See `.env.example` for all required variables:
- `NEXT_PUBLIC_FIREBASE_*` — Firebase client config
- `FIREBASE_ADMIN_*` — Server-side Firestore/Auth access
- `AI_PROVIDER` — Which AI to use
- `ANTHROPIC_API_KEY` / `OPENAI_API_KEY` / `GOOGLE_GENERATIVE_AI_API_KEY`

## Firestore Collections

| Collection | Documents | Purpose |
|------------|-----------|---------|
| `laws` | 846 | Indian Central Acts metadata |
| `laws/{slug}/sections` | 34,853 | Full section text |
| `users` | per user | Profiles (citizen/advocate) |
| `conversations` | per user | GandhiAI chat history |
| `documents` | per user | Drafted legal documents |
| `subscriptions` | per user | Plan + daily query tracking |
| `guides` | admin-seeded | Rights situation guides |
| `templates` | admin-seeded | Legal document templates |
| `dictionaryEntries` | admin-seeded | Legal terms bilingual |
| `lawyerProfiles` | per advocate | Marketplace listings |

## Legal

This application provides legal **information**, not legal **advice**. Users should consult a qualified advocate for specific legal matters. Law text is sourced from official public sources ([India Code](https://www.indiacode.nic.in/)).
