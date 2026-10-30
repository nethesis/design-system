# Nebula Design System

The Nebula Design System is made of three parts, to use together:

- **This repository**, published at https://nethesis.github.io/nebula-design-system/: the rules
  shared by all products, whatever technology they are built with. Writing guidelines, the
  glossary of terms with their Italian translations and the visual foundations.
- **[vue-components](https://github.com/nethesis/vue-components)**: the Vue components and
  patterns, with their props and live examples in the
  [Storybook](https://nethesis.github.io/vue-components/).
- **[Nebula Figma file](https://www.figma.com/design/ZRZzzlqb9GfB9Xdz6iGufh/Nebula-Design-System)**: the designs.

Unlike the other products, NethServer 8 uses the Carbon Design System: only the writing guidelines
and the glossary apply to it.

- [Carbon Design System v10](https://v10.carbondesignsystem.com/): the design system.
- [ns8-ui-lib Storybook](https://nethserver.github.io/ns8-ui-lib/): the NethServer 8 components.
- [Carbon Components Vue Storybook](https://vue.carbondesignsystem.com/vue2/): the Carbon
  components for Vue 2.

## Files

| File | Purpose |
| --- | --- |
| `glossary.yaml` | The glossary: single source of truth, edited through pull requests. The comment at the top describes the fields |
| `icons.yaml` | The icon dictionary: which icon to use for each meaning, shown on the Iconography page. The comment at the top describes the fields |
| `content/*.md` | The text pages (introduction, writing guidelines): plain markdown, no HTML or images. Tables with a "Do \| Don't" header are shown with check and cross marks. Link other pages with `?page=<id>`, for example `[glossary](?page=glossary)` |
| `glossary/it.tbx` | Italian glossary for Weblate, generated from `glossary.yaml` (do not edit) |
| `scripts/build-data.mjs` | Validates `glossary.yaml` and `icons.yaml` with `scripts/validate-data.mjs` (every icon must exist in its package; tests in `validate-data.test.mjs`) and generates the TBX files and the page data |
| `scripts/vite-plugin-markdown.mjs` | Compiles each `content/*.md` into a Vue component, rejecting raw HTML and unsafe links, and gives the search the text of each section (tests in `vite-plugin-markdown.test.mjs`) |
| `scripts/vite-plugin-glossary-watch.mjs` | Dev server only: reruns `build-data.mjs` when `glossary.yaml` or `icons.yaml` is saved |
| `src/pages.ts` | The pages of the site and their sidebar groups |
| `src/search.ts` | The search in the top bar: pages, sections, glossary terms, color tokens, text styles, icon meanings and custom icons. Loaded the first time the search gets the focus. Headings of the Vue pages are found only when they have a fixed `id` and text |
| `data/colors.json` | Color tokens exported from the Nebula Figma file (do not edit): see "Colors" below |
| `scripts/figma/export-colors.js`, `scripts/import-colors.mjs` | Export the color variables from Figma, then validate them and write `data/colors.json` |
| `src/foundations.ts` | Values of the foundations pages (typography, spacing and border, elevation and shadow), copied from the Nebula Figma file: update them when Figma changes |
| `scripts/vite-plugin-sources.ts` | Publishes the content as plain files for coding agents: see "Files for coding agents" below |
| `src/` | The web site (Vue, `@nethesis/vue-components`), published on GitHub Pages |
| `figma-fixes.md` | Changes to make in the Nebula Figma file so that it agrees with this guide |

## Files for coding agents

The pages of the site are built in the browser, so fetching them returns no content. The build
also publishes the content as plain files, next to the site, generated from the same sources as
the pages:

| File | Content |
| --- | --- |
| [`llms.txt`](https://nethesis.github.io/nebula-design-system/llms.txt) | Index of the files below, and of the `components.json` of the vue-components Storybook |
| [`writing-guidelines.md`](https://nethesis.github.io/nebula-design-system/writing-guidelines.md) | The writing guidelines |
| [`glossary.json`](https://nethesis.github.io/nebula-design-system/glossary.json) | The glossary |
| [`icons.json`](https://nethesis.github.io/nebula-design-system/icons.json) | Which icon to use for each meaning, the icons to avoid, and the custom icons with no meaning yet |
| [`colors.json`](https://nethesis.github.io/nebula-design-system/colors.json) | The color tokens, with their Tailwind CSS classes |
| [`foundations.json`](https://nethesis.github.io/nebula-design-system/foundations.json) | Typography, iconography, spacing, border, focus ring, elevation and shadow |
| [`introduction.md`](https://nethesis.github.io/nebula-design-system/introduction.md) | The introduction |

Each file has a `source`, the page of the site it comes from, and each glossary term, icon meaning and color token has a `link` to its anchor in the site. In the markdown files, the links to other pages point to the matching file, such as `glossary.json`. `index.html` links `llms.txt` too, for tools that fetch the site without running it. The dev server serves the files as well, for example http://localhost:5179/llms.txt; restart it after changing `scripts/vite-plugin-sources.ts`.

## Workflow

1. Edit `glossary.yaml`, `icons.yaml` or a page in `content/`.
2. Regenerate `glossary/it.tbx` with `npm run build:data` (the dev server does it on save), and
   commit it.
3. Open a pull request. CI validates the glossary and the guidelines, and fails if the TBX files
   are not up to date.
4. On merge, CI publishes the page and Weblate reads the new `glossary/it.tbx`.

`glossary.yaml` contains approved terms only: every entry is exported to Weblate, so add a term
once it has been agreed. Translations listed under `avoid.it` become forbidden translations.

## Colors

The Colors page reads `data/colors.json`. To update it after a change in Figma:

1. Run the code of `scripts/figma/export-colors.js` with the `use_figma` tool of the Figma MCP server,
   on the Nebula Figma file, and save the returned JSON to a file.
2. Run `npm run import:colors -- <file>`: it validates the export and rewrites `data/colors.json`.
3. Review the diff and commit it.

## Weblate

The glossary is a component of the `ns8` project on hosted.weblate.org, so it applies to every
Nethesis component there.

- File format: TermBase eXchange file
- File mask: `glossary/*.tbx`
- Monolingual base language file: empty
- "Use as a glossary": on
- Lock the component, or restrict its permissions: changes come from this repository only.

## Development

```sh
npm install
npm run dev
```

The dev server runs on http://localhost:5179 and regenerates the data whenever
`glossary.yaml` or `icons.yaml` is saved: validation errors appear in the terminal and in the browser.

In development only, each glossary entry has a "Reviewed" checkbox and the list has a Review
filter: the marks are saved in the browser and an entry edited after its review shows "Changed
since review".

`npm test` runs the tests of the markdown plugin, including the security ones, and of the files for coding agents (`scripts/sources.test.mjs`): every file listed in `llms.txt` exists, the JSON files parse, and every link points to a page and an anchor of the site. `npm run build` builds the page
into `dist/`.
