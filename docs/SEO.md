<div align="center">

![SEO](https://img.shields.io/badge/SEO-SEARCH_STRATEGY-E8622A?style=for-the-badge&labelColor=0B0B0C)

</div>

# Search strategy

How this page gets found by the people it was written for.

**Prepared:** 2026-09-07 · **Second pass:** 2026-09-07

**Status:** Phases 1 and 4 shipped. Most of Phase 2 shipped on one URL; the
hub-and-spoke split is the main thing left. Phase 0 is still blocked on you.

---

## The honest constraint first

This is a **YMYL** page — Your Money or Your Life. Google applies its harshest quality
bar to medical, legal and financial content, and this page is all three at once. It is
also a single page, on a domain with no history, competing against `va.gov`, `cdc.gov`,
`ninds.nih.gov`, the Mayo Clinic and every disease foundation.

Two consequences that shape everything below:

1. **You will not outrank `va.gov` for "PACT Act".** Do not try. Head terms are lost
   before you start.
2. **You can own the questions nobody else answers.** The entire premise of this page —
   *multiple* exposures, compounding *across generations*, mapped to a *cluster* of
   conditions — is a question institutional sites do not address, because each of them
   owns one chemical or one disease. That is the opening, and it is a real one.

The strategy is therefore: **win the specific, not the general.**

---

## Phase 0 — Deploy. Nothing else counts until this is done

> [!CAUTION]
> As of this writing GitHub Pages reports `has_pages: false` for this repository and
> the `github.io` project URL returns 404, so there is no address a crawler can reach.
> If the site is live somewhere else, that is fine — point `DEFAULT_SITE_URL` in
> [`tools/build.js`](../tools/build.js) at it and rebuild, and every canonical, social
> and JSON-LD URL follows. Until the canonical points somewhere real, the rest of this
> plan cannot start.

1. **Settings → Pages → Source → GitHub Actions.** The workflow is already committed.
2. **Set the repository description, homepage and topics.** All three are empty. Topics
   to use: `public-health`, `toxicology`, `veterans`, `agent-orange`, `epigenetics`,
   `data-visualization`, `genetics`, `open-data`, `medical-reference`.
3. **Decide the canonical domain** (below). It is now a one-line change:
   `DEFAULT_SITE_URL` in `tools/build.js` drives all 21 absolute URLs across the
   document, the sitemap and robots.txt.
4. **Verify in Google Search Console and Bing Webmaster Tools**, submit the sitemap.

### On the domain

Everything currently points at the GitHub Pages project URL:

```
https://danieljtrujillo.github.io/military-chemical-exposure-and-multigenerational-genotoxic-compounding/
```

That works, and it inherits `github.io`'s domain authority — but the URL is 103
characters of slug, it is a subdirectory on a shared domain, and it does not read as an
authority to a person scanning a results page.

**Recommended:** a short dedicated domain — something like `genotoxic.org`,
`exposuremap.org`, `toxicinheritance.org`. A `.org` reads as non-commercial, which for
YMYL content is worth real trust. Point it at Pages with a `CNAME`; the switch is one
file and one DNS record.

**Not recommended:** a subdomain of `gantasmo.com`. GANTASMO is a music-technology
identity; the topical mismatch would dilute both, and it makes the connection loud in
exactly the way you asked it not to be. Keep the GANTASMO link at the level it is now —
publisher metadata, a colophon line, a footer credit.

Whatever you choose, **choose before you get indexed.** Migrating a URL after the fact
costs months.

---

## Phase 1 — On-page foundation ✅ shipped

| | Item | State |
|:--:|---|---|
| ✅ | `<title>` rewritten for search intent, 68 chars | "Military Toxic Exposure and Heritable Genetic Disease \| Evidence Map" |
| ✅ | Meta description, 157 chars | Fits the rendered snippet without truncation |
| ✅ | Canonical URL | Self-referencing |
| ✅ | Robots directives | `max-image-preview:large`, `max-snippet:-1` |
| ✅ | Open Graph + Twitter card | With a purpose-built 1200×630 social card |
| ✅ | JSON-LD | `MedicalWebPage` + `WebSite` + `Organization`, with `about`, `mentions`, `lastReviewed`, `medicalAudience` |
| ✅ | `robots.txt` and `sitemap.xml` | With image sitemap entry |
| ✅ | `site.webmanifest`, icons, favicon | |
| ✅ | Semantic landmarks, one `<h1>`, ordered headings | `<main>`, `<footer>`, `<figure>`/`<figcaption>` |
| ✅ | Source encoding repaired | Mojibake in indexable body text was actively harmful |
| ✅ | `FAQPage` structured data | 7 questions, targeting *People Also Ask* and AI summaries |
| ✅ | `Dataset` structured data | Opens Google Dataset Search, where no competitor for these terms appears |
| ✅ | `BreadcrumbList` structured data | |
| ✅ | Stable `id` on every section | 12 anchored headings, zero broken internal anchors |
| ✅ | Indexable body text raised | 17,555 → 23,235 characters |

### What Phase 1 deliberately did not change

The `<h1>` still reads *"Compounding heritable genetic disorders of military toxicant
exposure"*. It is clinical rather than conversational, but it is accurate and it is the
document's own voice. The `<title>` now carries the search-facing phrasing, which is the
right division of labour. Revisit only if Search Console shows the h1 phrasing losing
clicks.

---

## Phase 2 — Structure the content for how people actually search

This is where the real gains are, and it overlaps almost entirely with
[AUDIT.md](AUDIT.md) §2. Good SEO here *is* the content work.

**Shipped in the second pass, on the single URL:** the installation index (§2.3), the
action path, the glossary, the methodology section, two new exposures including the
Camp Lejeune solvents, question-shaped headings, and the full text of every condition
and connection as crawlable content. What remains in this phase is the split.

### 2.1 One page cannot rank for forty topics

The document now covers eight toxicants, sixteen conditions, treatments, VA law,
financial aid, an installation index, an action path and a glossary, on a single URL. Search engines will pick one topic for it
and ignore the rest.

**Split into a hub-and-spoke set**, keeping the interactive map as the hub:

```
/                                  Hub — the map, the argument, the evidence grading
/exposures/agent-orange/           One page per toxicant  (8 pages)
/exposures/trichloroethylene/
/conditions/tuberous-sclerosis/    One page per condition (16 pages)
/conditions/spina-bifida/
/sites/santa-susana/               One page per installation (7 written already)
/sites/camp-lejeune/
/resources/va-claims/              The action path
/resources/financial-assistance/
/glossary/
```

Each spoke targets one intent, links back to the hub and sideways to related spokes. The
hub accumulates authority from all of them. This is the single highest-leverage SEO
decision available, and the data model already supports it — every node and exposure
object has the content a spoke page needs.

> [!NOTE]
> This means a small build step rendering pages from the same JS data structures.
> `tools/build.js` is the right place for it, and two things now make it tractable that
> did not before: exposure targets carry a node `id` rather than a display string, so
> conditions and exposures can be cross-referenced reliably; and `tools/test-data.js`
> will catch a broken reference before it ships.

### 2.2 Target the questions, not the terms

Institutional sites answer "what is Agent Orange". Nobody authoritative answers these:

| Query | Currently answered by | Volume |
|---|---|:--:|
| does agent orange affect grandchildren | Forums, law firm pages | High |
| can my father's radiation exposure cause my birth defects | Almost nothing | Medium |
| multiple chemical exposure combined effects | Nothing good | Medium |
| tuberous sclerosis and polycystic kidney together | Clinical literature only | Low, very high intent |
| santa susana field lab health effects | Local news, litigation pages | Medium |
| hexavalent chromium birth defects | Fragmented | Medium |
| perchlorate thyroid pregnancy | EPA, technical | Medium |
| camp lejeune water contamination birth defects | Law firm ad pages | Very high |
| TSC2 PKD1 contiguous deletion | Genetics literature | Low, extremely high intent |
| what tests to ask for after parental toxic exposure | Nothing | Medium |
| nexus letter toxic exposure claim | Law firm pages | High |

The bottom rows matter most. Low-volume, high-intent queries from people in an acute
situation convert into the thing this page is for: someone bringing it to a clinician.
And the "law firm ad pages" rows are an opening — those pages exist to generate leads,
not to inform. A genuinely useful page can beat them on engagement.

**Tactic:** give each of these a real heading and a direct answer in the first two
sentences beneath it. Question-shaped `<h2>` and `<h3>` text is how you surface in *People
Also Ask* and AI summaries.

**✅ Done for seven of them.** The page now carries question-shaped headings answering
*does Agent Orange affect grandchildren*, *what chemicals contaminated the water at Camp
Lejeune*, *what tests should I ask for*, *what is a nexus letter*, *why would several
unrelated conditions appear in one family*, *can a parent's exposure cause genetic
disease in their children*, and *why does combined exposure matter more than each one
alone*. All seven are mirrored in `FAQPage` structured data. Each answer leads with the
answer rather than building to it.

### 2.3 The site index is the best-performing thing you could build

Repeating [AUDIT.md](AUDIT.md) §2.4 because it is as much an SEO point as a content one:
people search by **place**. "Rocketdyne", "Hanford", "Rocky Flats", "Camp Lejeune",
"Nevada Test Site". Those queries have volume, sustained intent, weak incumbents, and
map directly onto the exposures already documented.

**✅ Done — seven sites**, as *Where these exposures happened*, each with an anchor id
(`#site-camp-lejeune`, `#site-ssfl`, `#site-hanford` and so on) so they can be linked
and shared individually. When the hub-and-spoke split happens these are the first
spokes, and they are already written.

### 2.4 Add the structured data the content already earns

`MedicalWebPage` is in place. Still available:

- **✅ `FAQPage`** — 7 questions, shipped
- **✅ `Dataset`** — shipped, with keywords, licence and measurement technique
- **✅ `BreadcrumbList`** — shipped
- **`MedicalCondition`** per condition spoke, with `signOrSymptom`, `riskFactor`,
  `possibleTreatment`. Needs the spoke pages first
- **`Drug`** on the treatments — everolimus, sirolimus, tolvaptan, selumetinib, bevacizumab
- **`ScholarlyArticle` / `citation`** linking the 37 references to DOIs

`CITATION.cff` is already committed, which gets the work into citation tooling.

---

## Phase 3 — Authority

For YMYL, trust signals matter more than keywords. This page has an unusual asset: it is
*more* transparent about its evidence than most medical sites, because every claim is
graded and cited. Make that visible.

### 3.1 Show the credentials the page already deserves

- **An "About this document" section** — who compiled it, what the method was, what the
  evidence bar is, when it was last reviewed, and how to challenge a claim. Currently the
  footer disclaimer is doing this job in two sentences.
- **A named reviewer.** One geneticist or occupational-medicine physician willing to be
  listed as having reviewed it would move this page's trust profile more than any
  technical change in this document. Add `reviewedBy` to the JSON-LD when you have one.
- **A visible changelog.** "Last reviewed" per section, with a dated revision history.
  Cheap to produce, disproportionately trusted.
- **✅ A corrections policy** — shipped in *How this document was compiled*, along with
  the method, the evidence-grading criteria, and an explicit statement of what the
  page cannot tell you. That last part is unusual and is itself a trust signal.

### 3.2 Links, earned honestly

Do not buy links, do not run a guest-post campaign. For this subject the durable sources are:

| Source | Approach |
|---|---|
| **Disease foundations** — TSC Alliance, Children's Tumor Foundation, PKD Foundation, Spina Bifida Association | The page already links to all of them. Tell them it exists. Patient-resource pages link back to good free tools. |
| **Veteran service organizations** — VFW, DAV, American Legion posts, Vietnam Veterans of America | High-authority `.org` domains, and exactly the right readership. |
| **University occupational health and genetic counselling programs** | Reading-list and patient-resource pages. |
| **Wikipedia** | Where a claim is genuinely well-sourced, this page can be a legitimate external link on articles like *Santa Susana Field Laboratory* or *Agent Orange*. Follow the rules; do not self-promote. |
| **r/VeteransBenefits, r/Agentorange, NF and TSC communities** | Answer questions properly, link when actually relevant. This is where the audience already is. |
| **Local journalism** near affected sites | Reporters covering SSFL or Camp Lejeune want a clear explainer to link to. |

### 3.3 Be citable

Give every section a stable `id` and a visible anchor link, so someone quoting the page in
a forum or a claim can link precisely. Add a "cite this page" block. Deep links get shared;
shares get indexed.

---

## Phase 4 — Technical performance

Mostly healthy, because the page has no framework and no third-party requests.

| | Item |
|:--:|---|
| ✅ | Zero external requests — no CDN, no fonts, no analytics, no trackers |
| ✅ | Self-contained 120 KB build, one request for the document |
| ✅ | `prefers-reduced-motion` honoured; starfield stops when the tab is hidden |
| ✅ | Print stylesheet |
| ✅ | **Mobile legibility** — below 700px the page serves a full text view instead of a diagram scaled to illegibility. Under mobile-first indexing this is what Google actually indexes. |
| ✅ | **Keyboard operability** on both interactive figures |
| ✅ | **Contrast** — all text tokens clear WCAG AA |
| ⬜ | **CLS from the starfield canvas** — measure; give the canvas fixed dimensions early |
| ⬜ | **Compression** — Pages serves gzip; confirm Brotli on whatever host you land on |
| ⬜ | **`Cache-Control` and security headers** — not configurable on Pages. If headers matter, Cloudflare Pages or Netlify give you them for free |
| ⬜ | **Consider splitting `script.js`** — the data is inlined into the document, which is right for a single page but wrong once spokes exist. The build is now 173 KB |
| ⬜ | **Monthly link sweep** — shipped as CI, but it has not run yet; the first run is the 1st of next month |

Run PageSpeed Insights against the live URL once deployed. Expect a strong score; the
mobile item above is the one that will hold it back.

---

## Phase 5 — Measure

Vanity metrics are a trap here. Traffic is not the goal; the goal is that a family finds
the page and brings it to a doctor.

**Track:**

- Search Console impressions and clicks **per query cluster** — which questions surface
- Position for the long-tail intent queries in §2.2, not for head terms
- Scroll depth to the treatments and legal sections
- Interaction rate with the diagrams
- Outbound clicks to `clinicaltrials.gov`, `va.gov` and the foundations — the closest
  measurable proxy for the page doing its job
- Print and PDF-save events — someone printing this is taking it to an appointment

**Analytics:** the page currently ships with none, which is a genuine trust asset for a
medical page — no cookie banner, nothing to disclose. If you need numbers, use something
cookieless and self-hosted (Plausible, GoatCounter, or just Search Console alone). Do not
put Google Analytics on a page people read about their children's illnesses.

---

## Sequence

| Phase | Work | Blocked on | Payoff |
|:--:|---|---|---|
| **0** | Deploy, set repo metadata, pick the domain | **You** | Everything |
| **1** | On-page foundation | ✅ Done | Indexable, shareable |
| **2a** | Question headings, site index, action path, glossary | ✅ Done | The content that earns the traffic |
| **2b** | Hub-and-spoke page split | Phase 0 | The bulk of the traffic |
| **3** | Named reviewer, changelog, outreach | Phase 2b | YMYL trust; the ceiling on everything |
| **4** | Mobile legibility, Core Web Vitals | ✅ Done | Ranking factor + the actual readers |
| **5** | Search Console, intent metrics | Phase 0 | Knowing which of the above worked |

**Realistic timeline:** a new domain on a YMYL topic takes six to twelve months to
establish. Phase 0 is an afternoon and it is the only thing standing between this page
and being findable at all. Phase 2b is where the compounding starts.

Everything shipped so far was the same work as making the page better, which is the only
kind of SEO worth doing on a page like this one. Phase 3 is not an engineering task: one
named clinician willing to be listed as having reviewed this would move it further than
anything left on the list.
