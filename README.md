# Occupational Toxic Exposure & Heritable Genetic Disease

An interactive research document mapping the connections between occupational chemical and radiation exposure and heritable genetic diseases across generations. Built as a single-page web application with animated starfield background and three interactive SVG data visualizations.

---

## What This Is

A parent or grandparent worked in nuclear energy, aerospace, chemical manufacturing, or military service. They were exposed to some combination of ionizing radiation, hexavalent chromium, ammonium perchlorate, hydrazine-based rocket fuel, dioxin (Agent Orange), and naturally occurring asbestos. Their children or grandchildren now have one or more of a specific cluster of conditions — tuberous sclerosis complex, polycystic kidney disease, neurofibromatosis, brain tumors, white matter disease, pseudotumor cerebri, scoliosis, degenerative disk disease, spina bifida, endometriosis, arthritis, cognitive or psychiatric disorders, vision problems, reproductive difficulties, or limb/digit abnormalities.

This document answers two questions:
1. **Are these conditions connected to each other?**
2. **Could parental occupational exposure have caused or contributed to them?**

The answer to both, supported by published peer-reviewed research, is yes. The diseases share overlapping molecular pathways (mTOR, Ras-MAPK, Wnt, Sonic Hedgehog), and the exposures damage DNA through mechanisms known to disrupt those exact pathways. This project maps those connections visually and interactively, grades the strength of evidence behind each link, explains transgenerational inheritance mechanisms, catalogs available and experimental treatments, and lists legal and financial resources for affected families.

---

## Interactive Visualizations

### 1. Disease Network
An SVG force diagram showing 15 conditions as nodes, connected by color-coded edges representing the biological pathway that links them (mTOR pathway, chromosome 16p13.3, tumor suppressor / phakomatosis, neural tube / brain development, inflammatory / autoimmune, skeletal / structural, hormone disruption, brain pressure). Click any node for a plain-language description of the disease. Click any edge for published research supporting that specific connection. Click legend items to isolate a single pathway type.

### 2. Exposure Pathways
A tabbed radial diagram. Each tab represents one toxic substance (Agent Orange/Dioxin, Hexavalent Chromium, Ammonium Perchlorate, Naturally Occurring Asbestos, Ionizing Radiation, Hydrazine/UDMH). Selecting a tab draws connection lines from the exposure to every disease it is linked to. Line thickness and color encode evidence strength:
- **Red / thick** — Strong evidence (large epidemiological studies, VA-recognized presumptive conditions)
- **Orange / medium** — Moderate evidence (smaller cohort studies, animal dose-response data)
- **Blue / thin** — Emerging evidence (case reports, biological plausibility, animal-only data)

Click any line or disease name for a summary of the evidence with citations.

### 3. Multi-Hit Convergence Model
A static SVG flowchart showing the complete chain: toxic substances → three damage routes (direct DNA mutation, epigenetic reprogramming, hormone disruption) → inherited genetic vulnerability (TSC2/PKD1 on chromosome 16, NF1 on chromosome 17, mTOR pathway, folate/MTHFR genes) → disease clusters. Illustrates Knudson's two-hit hypothesis in the context of combined occupational and inherited risk.

---

## Written Sections

| Section | Content |
|---|---|
| **How these diseases connect** | Molecular pathway overlap between all 15 conditions |
| **What each toxic exposure does** | Mechanism of action for each substance at the cellular level |
| **Multi-hit model** | How combined exposures and inherited mutations compound risk |
| **How substances damage genes** | Detailed biochemistry: Cr(VI) crosslinks, radiation double-strand breaks, dioxin AhR/epigenetic reprogramming, hydrazine alkylation, perchlorate thyroid blockade, asbestos NF-kB activation |
| **How this causes birth defects** | Embryonic DNA replication vulnerability, paternal sperm damage, transgenerational epigenetic inheritance |
| **Why multiple exposures compound** | Combined-exposure data void, overwhelmed DNA repair systems |
| **Other comorbidities** | Cardiovascular, endocrine/metabolic, hearing/peripheral nerve, cancer, mental health, and chronic fatigue |
| **Available treatments** | mTOR inhibitors (everolimus, sirolimus, tolvaptan), MEK inhibitors (selumetinib, NFX-179), bevacizumab, gene therapy/CRISPR pipeline, pseudotumor cerebri management, endometriosis surgical and pharmacological options, NF1 dystrophic scoliosis surgery, fetal myelomeningocele repair |
| **Legal resources** | PACT Act, VA presumptive conditions, Camp Lejeune Justice Act, toxic tort litigation, SSFL/Rocketdyne case law, attorney referrals |
| **Financial assistance** | TSC Alliance, Children's Tumor Foundation, PKD Foundation, Endometriosis Foundation, Spina Bifida Association, IH Research Foundation, clinical trial enrollment, manufacturer patient assistance programs |
| **References** | 30+ cited peer-reviewed publications with PubMed links |

---

## Tech Stack

| Component | Implementation |
|---|---|
| Layout | Single HTML page, semantic markup, no build step |
| Styling | Custom CSS with CSS variables for theming, dark space aesthetic |
| Background | Canvas-based 3D starfield animation (500 particles, parallax mouse tracking) |
| Visualizations | Hand-coded SVG with JavaScript event handling — no charting library |
| Data | All disease nodes, pathway edges, exposure-disease links, and evidence text are embedded in `script.js` as structured JS objects |
| Dependencies | **None.** Zero external libraries, frameworks, or CDN imports |

---

## Project Structure

```
├── src/
│   ├── index.html              Main document — all written content and SVG containers
│   ├── script.js               Starfield animation + disease network + exposure pathway visualizations
│   └── style.css               Full stylesheet with CSS custom properties
├── disease_exposure_network_final.html       Standalone single-file build
├── disease_exposure_network_final (2).html   Copy of standalone build
├── LICENSE.txt
└── README.md
```

---

## Running Locally

No build step, no server required. Open `src/index.html` in any modern browser. Alternatively, open either standalone HTML file in the root directory.

For local development with live reload:
```bash
# Any static file server works
npx serve src
# or
python -m http.server 8000 --directory src
```

---

## Key Data Structures

### Disease Nodes (`script.js`)
Each node carries an `id`, display `label`, SVG coordinates, collision radius, disease category (`genetic`, `neoplastic`, `neuro`, `structural`, `inflammatory`), and a multi-paragraph plain-language `desc` field covering etiology, epidemiology, and clinical presentation.

### Pathway Edges (`script.js`)
Each edge connects two disease node IDs via a named pathway (`mtor`, `chr16`, `phako`, `neural`, `inflam`, `struct`, `endocrine`, `icp`) and carries an `info` field with the specific published evidence for that connection, including author names and publication years.

### Exposure Objects (`script.js`)
Each exposure carries a `mechanism` description and an array of `targets` — diseases linked to that exposure. Every target has an evidence `strength` rating (`strong`, `moderate`, `emerging`) and a `note` field summarizing the research with citations.

---

## Evidence Strength Ratings

| Rating | Criteria | Visual Encoding |
|---|---|---|
| **Strong** | Large cohort studies, meta-analyses, VA-recognized presumptive service connections | Red, thick lines |
| **Moderate** | Smaller cohort studies, animal studies with dose-response, consistent case series | Orange, medium lines |
| **Emerging** | Case reports, animal-only data, biological plausibility without large human studies | Blue, thin lines |

---

## Referenced Research (Partial List)

- Brook-Carter et al. (1994) — TSC2/PKD1 contiguous gene deletion syndrome
- Krueger et al. (2010) — Everolimus for TSC-associated SEGAs
- Manikkam et al. (2012) — Dioxin transgenerational epigenetic inheritance (3 generations deep)
- Rier et al. (1993) — Dioxin dose-dependent endometriosis in primates
- Preston et al. (2007) — Radiation and solid cancer incidence in atomic bomb survivors
- Adzick et al. (2011) — MOMS trial for fetal myelomeningocele repair
- Wall et al. (2014) — IIHTT trial for pseudotumor cerebri
- Cardis et al. (2005) — Radiation and thyroid cancer in children
- National Academies (2018) — Veterans and Agent Orange: Update 11

Full reference list with PubMed links is in the document itself.

---

## Browser Support

Tested on Chrome, Firefox, Safari, and Edge (all current versions). Requires JavaScript enabled. Canvas API for starfield, SVG for visualizations. No polyfills needed.

---

## License

See [LICENSE.txt](LICENSE.txt).

---

## Disclaimer

This is an informational research reference, not medical or legal advice. Bring it to a geneticist, occupational medicine specialist, or VA claims attorney who can apply it to a specific case. Clinical trial status and legal landscapes change — verify links before relying on them.

