# Graph Report - .  (2026-09-18)

## Corpus Check
- 56 files · ~184,039 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 409 nodes · 765 edges · 18 communities (14 shown, 4 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 18 edges (avg confidence: 0.53)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Komponen UI Bersama
- Pembuat Paparan PPT
- Perkakas Lint & Build
- Shell Aplikasi & Auth
- View Dashboard & Matriks
- Dependensi Pihak Ketiga
- Parsing Excel & Orkestrasi
- Konfigurasi TS App
- Konfigurasi TS Node
- Tab Legacy (Peta/Proyek)
- Kontrak Tipe Data
- Kartu Statistik
- Tab Analitik Legacy
- Kartu Ringkasan
- Referensi Tsconfig

## God Nodes (most connected - your core abstractions)
1. `UnifiedProjectData` - 27 edges
2. `PaparanView()` - 24 edges
3. `fShort()` - 22 edges
4. `Theme` - 18 edges
5. `compilerOptions` - 17 edges
6. `Filters` - 16 edges
7. `fNum()` - 16 edges
8. `compilerOptions` - 16 edges
9. `AllProyekRow` - 15 edges
10. `DashboardApp()` - 13 edges

## Surprising Connections (you probably didn't know these)
- `PaparanView()` --references--> `pptxgenjs`  [EXTRACTED]
  src/components/views/PaparanView.tsx → package.json
- `ParticlesBg()` --references--> `react`  [EXTRACTED]
  src/components/Auth.tsx → package.json
- `DashboardApp()` --references--> `react`  [EXTRACTED]
  src/components/Dashboard.tsx → package.json
- `DetailMatrixView()` --references--> `react`  [EXTRACTED]
  src/components/views/DetailMatrixView.tsx → package.json
- `DashboardApp()` --references--> `xlsx`  [EXTRACTED]
  src/components/Dashboard.tsx → package.json

## Import Cycles
- None detected.

## Communities (18 total, 4 thin omitted)

### Community 0 - "Komponen UI Bersama"
Cohesion: 0.06
Nodes (55): react, react, AnimatedNumber(), AnimatedNumberProps, ParticlesBg(), FilterBar(), FilterBarProps, HIDDEN_SEGMENTS (+47 more)

### Community 1 - "Pembuat Paparan PPT"
Cohesion: 0.07
Nodes (53): idPotret(), PaparanCapture(), Props, SECTION_POTRET, BarisMatrix, BarisProyek, fPct(), hitungAnalitik() (+45 more)

### Community 2 - "Perkakas Lint & Build"
Cohesion: 0.04
Nodes (46): @babel/core, babel-plugin-react-compiler, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, devDependencies (+38 more)

### Community 3 - "Shell Aplikasi & Auth"
Cohesion: 0.07
Nodes (31): react-dom, react-dom, App(), PageTransitionOverlayProps, AuthGate(), AuthGateProps, graphConfig, graphFilesRequest (+23 more)

### Community 4 - "View Dashboard & Matriks"
Cohesion: 0.11
Nodes (31): DashboardOverview(), formatShortRupiah(), Props, DetailMatrixView(), fPct(), hitungBaris(), MatrixRow, nilaiSort() (+23 more)

### Community 5 - "Dependensi Pihak Ketiga"
Cohesion: 0.05
Nodes (37): axios, @azure/msal-browser, @azure/msal-react, framer-motion, html2canvas, leaflet, lucide-react, dependencies (+29 more)

### Community 6 - "Parsing Excel & Orkestrasi"
Cohesion: 0.15
Nodes (18): DashboardApp(), GraphProfile, MasterView, MONTH_ORDER, NAV_ITEMS, PaparanView, Props, SEG_QSHE_ONLY (+10 more)

### Community 7 - "Konfigurasi TS App"
Cohesion: 0.09
Nodes (22): DOM, src, vite/client, compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib (+14 more)

### Community 8 - "Konfigurasi TS Node"
Cohesion: 0.10
Nodes (20): node, vite.config.ts, compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection (+12 more)

### Community 9 - "Tab Legacy (Peta/Proyek)"
Cohesion: 0.26
Nodes (4): GeospatialTabProps, OverviewTabProps, ProyekTabProps, DataRKAP

### Community 10 - "Kontrak Tipe Data"
Cohesion: 0.17
Nodes (11): Filters, HistoriBulanan, KumulatifFinancials, MonthlyTrend, NkbTrendPoint, RawMaster, RawRKAP, SortDir (+3 more)

## Knowledge Gaps
- **130 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+125 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `Dependensi Pihak Ketiga` to `Komponen UI Bersama`, `Perkakas Lint & Build`, `Shell Aplikasi & Auth`?**
  _High betweenness centrality (0.262) - this node is a cross-community bridge._
- **Why does `react` connect `Komponen UI Bersama` to `View Dashboard & Matriks`, `Dependensi Pihak Ketiga`, `Parsing Excel & Orkestrasi`?**
  _High betweenness centrality (0.134) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `PaparanView()` (e.g. with `PaparanView.tsx` and `susunanAwal()`) actually correct?**
  _`PaparanView()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _130 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Komponen UI Bersama` be split into smaller, more focused modules?**
  _Cohesion score 0.06259780907668232 - nodes in this community are weakly interconnected._
- **Should `Pembuat Paparan PPT` be split into smaller, more focused modules?**
  _Cohesion score 0.06875 - nodes in this community are weakly interconnected._
- **Should `Perkakas Lint & Build` be split into smaller, more focused modules?**
  _Cohesion score 0.0425531914893617 - nodes in this community are weakly interconnected._