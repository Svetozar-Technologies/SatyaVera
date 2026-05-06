# Case Study: Mirroring the Statutes of India as Markdown on GitHub

**Issue:** [#1](https://github.com/Svetozar-Technologies/Gandhi-AI/issues/1) — Research if it possible to get copy of all sources for all active laws in India
**Target repository:** [Svetozar-Technologies/indian-law](https://github.com/Svetozar-Technologies/indian-law) (planned)
**Status:** Research complete. No bulk crawl performed.

## 1. Problem statement

The issue asks whether it is **legal** and **practical** to keep a copy of every Act of Parliament of India (and the rules, regulations, and orders made under them) inside a public GitHub repository as Markdown files, served via GitHub Pages, with each file linking back to the original public source.

The goal is a planning artifact, not a production crawl: enumerate the requirements, verify legality, identify the upstream sources and existing components we can reuse, and prototype a few `.mjs` scripts that prove the pipeline shape end-to-end.

## 2. Requirements (extracted verbatim from the issue)

| #   | Requirement                                                                                              | Source                                                       |
| --- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| R1  | Determine whether having a copy of Indian laws in a GitHub repository is **legal**.                      | "We need to know if it legal"                                |
| R2  | Determine whether it is **technically possible** to obtain the sources of all active laws.               | "and actually possible to have copy"                         |
| R3  | The copy must be stored as **Markdown** files.                                                           | "as markdown files"                                          |
| R4  | The copy must be **publishable as GitHub Pages**.                                                        | "show them as GitHub Pages"                                  |
| R5  | Every file must include a **reference link to the original public law**.                                 | "give reference to them, with links to original public laws" |
| R6  | Plan how to **collect** the data.                                                                        | "plan how to collect and process the data"                   |
| R7  | Plan how to **process** the data into the target Markdown shape.                                         | "plan how to collect and process the data"                   |
| R8  | The eventual output lives at `https://github.com/Svetozar-Technologies/indian-law` — _not_ in this repo. | "later placed at ..."                                        |
| R9  | **No actual full data collection** in this PR; only test ideas and prepare `.mjs` scripts.               | "No actual full data collection ... should be done"          |
| R10 | Compile collected research into `./docs/case-studies/issue-1`.                                           | "compile that data to `./docs/case-studies/issue-{id}`"      |
| R11 | Do a **deep case study analysis** including online research.                                             | "use it to do deep case study analysis"                      |
| R12 | Produce an explicit **list of every requirement** from the issue.                                        | "list of each and all requirements"                          |
| R13 | **Propose possible solutions and solution plans for each requirement**.                                  | "propose possible solutions and solution plans"              |
| R14 | Check **existing components/libraries** that solve similar problems.                                     | "check known existing components/libraries"                  |
| R15 | Plan and execute everything in **a single pull request**.                                                | "plan and execute everything in a single pull request"       |

The remainder of this document addresses each requirement in order.

## 3. Legal analysis (R1)

Short answer: **Yes — bare statutory text of Indian Central Acts can be reproduced lawfully**, with three caveats spelled out below.

### 3.1 Statutory basis

Section 52(1)(q) of the [Copyright Act, 1957](https://www.indiacode.nic.in/handle/123456789/1367) lists the reproductions that **do not constitute infringement of copyright**. The text retrieved verbatim from the official India Code AJAX endpoint (saved to [`research/copyright-act-section-52-raw.txt`](research/copyright-act-section-52-raw.txt)) reads:

> **(q)** the reproduction or publication of —
>
> **(i)** any matter which has been published in any Official Gazette except an Act of a Legislature;
>
> **(ii)** any Act of a Legislature subject to the condition that such Act is reproduced or published together with any commentary thereon or any other original matter;
>
> **(iii)** the report of any committee, commission, council, board or other like body appointed by the Government if such report has been laid on the Table of the Legislature, unless the reproduction or publication of such report is prohibited by the Government;
>
> **(iv)** any judgment or order of a court, tribunal or other judicial authority, unless the reproduction or publication of such judgment or order is prohibited by the court, the tribunal or other judicial authority, as the case may be;
>
> **(r)** the production or publication of a translation in any Indian language of an Act of a Legislature and of any rules or orders made thereunder — [...] Provided that such translation contains a statement at a prominent place to the effect that the translation has not been authorised or accepted as authentic by the Government[.]

### 3.2 What this means for the planned repository

1. **Acts must be republished with original commentary or other original matter** — clause (q)(ii). A bare verbatim mirror of the Act, with nothing else, is technically _not_ covered by the exception. Adding a per-section editorial header (citation, source link, last-verified date, version notes), a side-by-side plain-language summary, or cross-references to other Acts is enough to satisfy the "commentary or other original matter" condition. The plan in §6 builds this in.
2. **Translations require a non-authenticity disclaimer** — clause (r) proviso. If the corpus ever offers translated text, every translated page must carry a prominent banner stating the translation is not authorised by the Government.
3. **Rules, regulations, notifications, orders** — most are covered as Official Gazette content (clause (q)(i)) or as committee/board outputs (clause (q)(iii)). Both subclauses carry a "unless prohibited by the Government" carve-out, so the workflow must check for any reproduction prohibition notice on the source page before mirroring.

### 3.3 Crown copyright in government works

Section 17(d) of the same Act vests first ownership of "Government work" in the Government for **sixty years** from publication. That ownership is real, but Section 52(1)(q) creates an explicit non-infringement carve-out for the four categories above, so it does not block this project. India does not yet operate a UK-style Open Government Licence; the equivalent is the [Government Open Data License – India (GODL-India)](https://data.gov.in/Godl), which grants a worldwide royalty-free licence with attribution. GODL-India applies to datasets explicitly licensed under it; it is not the licence under which India Code is published, but it confirms the policy direction.

### 3.4 Source-side terms

`indiacode.nic.in` is operated by the Legislative Department, Ministry of Law and Justice, and content is "Provided by the Ministries/Departments in the Government of India" (footer text saved on every page; reproduced in `research/copyright-act-section-52-raw.txt` for the Act used as a reference). The site does not publish a per-page reproduction restriction for Acts, so clause (q)(ii) governs.

### 3.5 Recommended legal posture

- License the **derivative repository** under a permissive licence for its original matter (suggested: [CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/) for prose and Markdown structure; [CC0](https://creativecommons.org/publicdomain/zero/1.0/) for raw fetched text already covered by §52(1)(q)).
- Add a top-level `LEGAL.md` quoting Section 52(1)(q)–(r) and explaining the project's reliance on it.
- Stamp every Act page with: the source URL on India Code, the `actid`, the section number, the last-verified timestamp, and a short editorial note (this is the "commentary or other original matter").
- For any translated text: prominently mark it "Unofficial translation — not authorised by the Government of India" per the §52(1)(r) proviso.

> **Disclaimer:** this is a structured engineering analysis informed by the public statutory text, **not** legal advice. Before publishing the production corpus, the indian-law repository should obtain a written opinion from an Indian copyright lawyer.

## 4. Source feasibility (R2)

Yes — at least four upstream sources expose the full text of Central Acts in machine-fetchable form.

### 4.1 Primary upstream: India Code (`indiacode.nic.in`)

India Code is the official digital repository of all Central and State Acts (operated by NIC, Government of India). It exposes:

- A **per-act handle page**, e.g. `https://www.indiacode.nic.in/handle/123456789/1367` for the Copyright Act, 1957. This page lists every section with `actid`, `sectionId`, `sectionno`, and `orderno` parameters.
- A **per-act PDF**, linked from the handle page, e.g. `/bitstream/123456789/1367/5/a1957-14.pdf`.
- A **per-section AJAX endpoint** at `/SectionPageContent?actid=...&sectionID=...` that returns JSON with two HTML fields: `content` (the section body) and `footnote` (amendments / source provenance).
- A **simple-search listing** at `/handle/123456789/1362/simple-search?searchradio=acts&rpp=N` that paginates over every Central Act with handle, enactment date, act number, and short title.

The two endpoints used by the prototype scripts — `/handle/123456789/<id>` and `/SectionPageContent` — were verified end-to-end while writing this case study. See §5.

### 4.2 Secondary corpora

| Source                                                                | What it offers                                                                      | License                                      | Usability                                                                                                                                                                                                                          |
| --------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`nyaayaIN/laws-of-india`](https://github.com/nyaayaIN/laws-of-india) | Central Laws categorised by subject, in transition from Akoma Ntoso XML to Markdown | CC BY-NC-SA 4.0                              | **Important precedent** — already a markdown mirror, but the NC clause forbids commercial use. Useful as a reference for taxonomy and section structure, **cannot be vendored** if the indian-law repo wants a permissive licence. |
| [Indian Kanoon](https://indiankanoon.org/)                            | Aggregated full-text search over Acts plus judgments                                | Open access; site terms forbid bulk scraping | **Cross-check source**, not a primary source. Use only for spot-checking parsed text.                                                                                                                                              |
| [OpenNyAI](https://opennyai.org/datasets)                             | Indian legal NLP datasets (judgment summarisation, NER, translation)                | Open                                         | **Useful for the AI layer** but not for raw statutes.                                                                                                                                                                              |
| [`d0r1h/ILC`](https://github.com/d0r1h/ILC)                           | Indian Legal Corpus for Summarisation                                               | MIT                                          | Judgments, not Acts; reference only.                                                                                                                                                                                               |
| [`Legal-NLP-EkStep/ILDC`](https://github.com/Legal-NLP-EkStep/ILDC)   | Indian Legal Documents Corpus                                                       | Open                                         | Judgments, not Acts; reference only.                                                                                                                                                                                               |

**Conclusion:** India Code is the only practical primary source. `nyaayaIN/laws-of-india` is the closest existing GitHub mirror and a useful comparison point; we cannot relicense its files but we can cite it.

## 5. Prototype scripts (R6, R7, R9, R14)

Two `.mjs` scripts have been added under [`experiments/`](../../../experiments). They are deliberately minimal — they prove the pipeline shape on **one** act and on **one** page of the act listing, then stop.

### 5.1 [`experiments/issue-1-discover-acts.mjs`](../../../experiments/issue-1-discover-acts.mjs)

Fetches one page of the India Code "simple-search" listing and emits a JSON manifest of acts:

```json
{
  "handle": "1367",
  "url": "https://www.indiacode.nic.in/handle/123456789/1367",
  "enactmentDate": "04-Jun-1957",
  "actNumber": "14",
  "shortTitle": "The Copyright Act, 1957"
}
```

Verified output for page 1 is committed at [`research/samples/acts-page-1.json`](research/samples/acts-page-1.json).

### 5.2 [`experiments/issue-1-fetch-act-sections.mjs`](../../../experiments/issue-1-fetch-act-sections.mjs)

Fetches the act handle page, parses out every `(sectionId, sectionno, orderno)` triple, then calls `/SectionPageContent` for the first three sections and emits Markdown:

```markdown
# India Code: Copyright Act, 1957

Act ID: `AC_CEN_9_30_00006_195714_1517807321712`

## Section 1

(1) This Act may be called the Copyright Act, 1957.
(2) It extends to the whole of India.
...

### Footnotes

1. 21st January, 1958, vide notification No. 269 ...
```

Verified Markdown output is committed at [`research/samples/copyright-act-1957-first-3-sections.md`](research/samples/copyright-act-1957-first-3-sections.md).

### 5.3 What is intentionally **not** in scope

Per R9, the experiments do **not**:

- crawl the entire India Code listing (would be hundreds of pages × hundreds of sections),
- write to disk into `indian-law/` layout,
- run on a schedule,
- handle PDF fallback,
- emit Akoma Ntoso XML,
- diff against previous runs.

Those belong to the production crawler that the indian-law repo will own. §6 sketches its design.

## 6. Solutions per requirement (R12, R13)

For each requirement R1–R15 below, the table gives a chosen solution, an alternative considered, and the artifact in this PR that closes the requirement.

| #   | Solution                                                                                                                                                                             | Alternative considered                                                              | Artifact                                               |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- | ------------------------------------------------------ |
| R1  | Rely on Section 52(1)(q)(ii) of the Copyright Act 1957 + add original editorial matter to every page; obtain a written legal opinion before launch.                                  | Apply for a licence from the Legislative Department.                                | §3 of this README                                      |
| R2  | Use India Code's handle pages + `/SectionPageContent` AJAX endpoint as the primary source.                                                                                           | Scrape `nyaayaIN/laws-of-india` (NC license blocks reuse).                          | §4 + experiments                                       |
| R3  | Strip HTML to plain text, normalise whitespace, render as Markdown with `## Section <n>` headings and `### Footnotes` for amendments.                                                | Convert to Akoma Ntoso XML and render Markdown from XML (more rigorous, more work). | `experiments/issue-1-fetch-act-sections.mjs`           |
| R4  | Publish via GitHub Pages from `/docs/` using a static-site config (Jekyll default or Just-the-Docs theme); one Markdown file per Act with anchor links per Section.                  | Build with VuePress / Docusaurus (heavier, JS toolchain).                           | §6.1 plan                                              |
| R5  | Embed `Source:` link to the canonical India Code handle URL and `actid` on every page; embed per-section anchor URLs.                                                                | Footer-only attribution.                                                            | §6.1 plan + Section 5.2 sample                         |
| R6  | Two-stage pipeline: (1) discovery walks `simple-search` paginated listing; (2) fetcher resolves every `actid → sectionId[]` and pulls each section JSON.                             | One-shot crawler (less restartable).                                                | `experiments/issue-1-discover-acts.mjs`                |
| R7  | Convert each section's HTML to Markdown by stripping tags, mapping `<br>` → newline, `</p>` → blank line, `&nbsp;` → space, `&amp;` → `&`. Footnotes become a `### Footnotes` block. | Run through `turndown` (extra dependency for a regular structure).                  | `experiments/issue-1-fetch-act-sections.mjs:stripTags` |
| R8  | indian-law repo will be created separately. This PR only delivers research and prototypes.                                                                                           | Combine research and corpus in this repo (mixes concerns).                          | §6.1 plan                                              |
| R9  | Experiments cap at 3 sections / 1 listing page.                                                                                                                                      | Full crawl behind a flag.                                                           | Both experiment scripts                                |
| R10 | All artifacts under `docs/case-studies/issue-1/`.                                                                                                                                    | Loose files at repo root (would conflict with template).                            | This folder                                            |
| R11 | Deep analysis: legal text retrieved verbatim from the source-of-truth, GODL-India cross-checked, four secondary corpora compared, two prototypes written and run.                    | Surface-level summary.                                                              | This README + `research/`                              |
| R12 | Numbered requirement table in §2.                                                                                                                                                    | Bullet list (less mappable to artifacts).                                           | §2                                                     |
| R13 | This table.                                                                                                                                                                          | Per-requirement subsections (more verbose).                                         | §6                                                     |
| R14 | Components surveyed: nyaayaIN, Indian Kanoon, OpenNyAI, ILC, ILDC, Akoma Ntoso. Reuse strategy in §4.2.                                                                              | Build everything from scratch with no comparison.                                   | §4.2                                                   |
| R15 | Single PR ([#2](https://github.com/Svetozar-Technologies/Gandhi-AI/pull/2)) on branch `issue-1-558f4a65aa2b`.                                                                        | Multiple PRs (against the issue's instruction).                                     | This branch                                            |

### 6.1 End-to-end plan for the indian-law repository

```
indian-law/
├── README.md                          # project overview + license posture
├── LEGAL.md                           # Section 52(1)(q) quote, attribution policy, disclaimer
├── _config.yml                        # GitHub Pages (Just-the-Docs)
├── manifest.json                      # generated: { acts: [...] }
├── docs/
│   ├── index.md                       # browse by year / ministry / subject
│   └── acts/
│       └── 1957/
│           └── 14-the-copyright-act-1957.md   # per-Act markdown
└── scripts/
    ├── 01-discover.mjs                # paginated listing → manifest.json
    ├── 02-fetch-act.mjs               # actid → sections.json
    ├── 03-render-markdown.mjs         # sections.json → docs/acts/.../*.md
    ├── 04-verify-links.mjs            # lychee-style check
    └── lib/
        ├── indiacode-client.mjs       # http + html parser + AJAX wrapper
        └── markdown-renderer.mjs      # html → markdown (with §52(q) header injection)
```

Each Markdown file has a stable header that satisfies §52(q)(ii)'s "commentary or other original matter" requirement:

```markdown
---
title: The Copyright Act, 1957
act_number: 14 of 1957
enacted: 1957-06-04
last_verified: 2026-05-06
sources:
  - https://www.indiacode.nic.in/handle/123456789/1367
  - https://www.indiacode.nic.in/bitstream/123456789/1367/5/a1957-14.pdf
license: CC-BY-4.0 (commentary); statute text is in Public Domain in India under §52(1)(q)(ii) of the Copyright Act, 1957
---

> **Editorial note.** This is a verbatim reproduction of the Act as published on India
> Code, with section anchors added, footnotes inlined, and the source URL recorded. The
> reproduction relies on Section 52(1)(q)(ii) of the Copyright Act, 1957. See `LEGAL.md`.

# The Copyright Act, 1957

[...]
```

### 6.2 Operational concerns

- **Politeness**: serial requests, ≥ 1 s sleep between calls, descriptive `User-Agent`, conditional `If-Modified-Since` on the act handle page.
- **Restartability**: write a `manifest.json` after every successful section so a crash can resume.
- **Idempotence**: render to Markdown only when the source `content` hash changes.
- **Drift detection**: weekly scheduled GitHub Action that re-fetches each act, diffs against the committed Markdown, opens an issue if drift > 0.
- **Link integrity**: this template's existing `lychee` workflow (see [`docs/BEST-PRACTICES.md`](../../BEST-PRACTICES.md)) already covers Markdown link checking — reuse it in indian-law.

## 7. References

- **Statutory text** — [Copyright Act, 1957, §52](https://www.indiacode.nic.in/show-data?actid=AC_CEN_9_30_00006_195714_1517807321712&sectionId=14572&sectionno=52&orderno=70) (raw fetched text in `research/copyright-act-section-52-raw.txt`)
- **India Code home** — https://www.indiacode.nic.in/
- **Government Open Data License – India** — https://data.gov.in/Godl
- **`nyaayaIN/laws-of-india`** — https://github.com/nyaayaIN/laws-of-india (CC BY-NC-SA 4.0)
- **Indian Kanoon** — https://indiankanoon.org/
- **OpenNyAI datasets** — https://opennyai.org/datasets
- **`openlegaldata/awesome-legal-data`** — https://github.com/openlegaldata/awesome-legal-data
- **Akoma Ntoso (legal XML standard)** — http://www.akomantoso.org/
- **CC BY 4.0** — https://creativecommons.org/licenses/by/4.0/
- **CC0 1.0** — https://creativecommons.org/publicdomain/zero/1.0/

## 8. Files in this case study

- [`README.md`](README.md) — this document
- [`research/copyright-act-section-52-raw.txt`](research/copyright-act-section-52-raw.txt) — verbatim §52 text fetched from India Code
- [`research/copyright-act-section-52-footnotes.txt`](research/copyright-act-section-52-footnotes.txt) — verbatim §52 footnotes
- [`research/samples/acts-page-1.json`](research/samples/acts-page-1.json) — sample output of the discovery script
- [`research/samples/copyright-act-1957-first-3-sections.md`](research/samples/copyright-act-1957-first-3-sections.md) — sample Markdown output of the fetcher

## 9. Files added outside this folder

- [`experiments/issue-1-discover-acts.mjs`](../../../experiments/issue-1-discover-acts.mjs) — discovery prototype
- [`experiments/issue-1-fetch-act-sections.mjs`](../../../experiments/issue-1-fetch-act-sections.mjs) — fetcher prototype

No changeset is added: per [`docs/CONTRIBUTING.md`](../../CONTRIBUTING.md), docs-only changes (and changes inside `experiments/`) are excluded from the "any-code-changed" detection in [`scripts/detect-code-changes.mjs`](../../../scripts/detect-code-changes.mjs), so the `changeset-check` CI job is skipped.
