<div align="center">

![Contributing](https://img.shields.io/badge/CONTRIBUTING-E8622A?style=for-the-badge&labelColor=0B0B0C)

</div>

# Contributing

This is a medical reference that people bring to doctors and attorneys. The bar for adding a claim is higher than the bar for adding a feature.

---

## The evidence bar

Every exposure-to-disease link on this page carries a strength rating. A new link needs a citation that clears the bar for the rating you give it.

| Rating | What it requires |
|---|---|
| **Strong** | A large cohort study, a meta-analysis, or a VA-recognized presumptive service connection. Sample size and effect size stated. |
| **Moderate** | A smaller cohort study, an animal study with a dose-response curve, or a consistent series of cases across independent groups. |
| **Emerging** | A case report, animal-only data, or a mechanistic argument for biological plausibility with no large human study yet. |

Rules that are not negotiable:

- **Cite a primary source.** A PubMed ID, a DOI, or a government publication. Not a news article about a study, not a law firm's landing page, not an AI summary.
- **Grade honestly.** An emerging link labelled emerging is useful. An emerging link labelled strong makes the whole page untrustworthy.
- **Name the study in the text.** Every `info` and `note` field states the author and year inside the prose, so a reader sees the provenance without leaving the panel.
- **Plain language.** Assume a reader with a high-school education and a sick child. Define the jargon on first use, then use it.
- **No causal claims about individuals.** Epidemiology describes populations. Write "associated with" and "elevated risk", not "causes".

---

## Adding a disease

Edit the `nodes` array in [`src/script.js`](src/script.js).

```js
{
  id: 'newcondition',            // lowercase, no spaces, unique
  label: 'Condition name',       // short enough to sit under a circle
  x: 400, y: 300, r: 18,         // position in the 680×520 viewBox
  cat: 'neuro',                  // genetic | neoplastic | neuro | structural | inflammatory
  desc: 'Two to four sentences: what it is, what causes it, how common, how it presents.'
}
```

A node with no edges is an orphan circle. Add at least one edge in the same change.

## Adding a connection

Edit the `edges` array.

```js
{
  from: 'newcondition',
  to: 'tsc',
  path: 'mtor',                  // must be a key of `pathways`
  info: 'Plain-language explanation of the shared biology, ending with (Author et al., YEAR).'
}
```

If your connection needs a pathway that does not exist yet, add it to `pathways` **and** give it at least one edge. The legend only renders pathways that connect something.

## Adding an exposure or a target

Edit the `exposures` array.

```js
{
  id: 'benzene',
  short: 'Benzene',
  mechanism: 'How it damages DNA, in two or three sentences.',
  targets: [
    { d: 'brain', s: 'moderate', note: 'Summary of the evidence, ending with (Author et al., YEAR).' }
  ]
}
```

`d` must match an existing node `id`. `s` is `strong`, `moderate` or `emerging`.

## Adding a reference

Add the full citation to the References section of [`src/index.html`](src/index.html), alphabetically by first author, with a PubMed link where one exists.

---

## Resource links

Legal, financial and clinical resource links go stale. If you find a dead link or an outdated program, open an issue or send the replacement. Include the date you checked it.

Links currently verified as of **March 2026**.

---

## Before you open a pull request

```bash
node --check src/script.js     # syntax
node tools/build.js            # rebuild dist/ and commit the result
```

Commit `dist/` alongside `src/`. The deploy workflow warns when the two have drifted.

If you changed the palette or the page title, regenerate the imagery:

```bash
pip install pillow
python tools/make_assets.py
```

---

## What is welcome without a citation

- Typos, broken links, dead resources
- Accessibility fixes
- Translations
- Print and mobile layout fixes
- Making an explanation clearer without changing what it claims

---

## Conduct

Families reading this page are often frightened and often angry, sometimes at institutions that deserve it. Keep discussion in issues factual and about the evidence. Bad-faith argument, harassment, or using this repository to advertise legal services will be removed.
