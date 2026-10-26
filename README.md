# Nethesis Design System

Rules shared by the user interfaces of all Nethesis products (NethServer 8, NethSecurity,
NethVoice, NethService, Neth360 and My Nethesis), whatever technology they are built with:
writing guidelines, the glossary of terms with their Italian translations, the visual foundations
and the guidance for each component.

The Vue implementation of the components, with their props and live examples, is in the
[vue-components Storybook](https://nethesis.github.io/vue-components/). The designs are in the
[NDS Figma file](https://www.figma.com/design/ZRZzzlqb9GfB9Xdz6iGufh/NDS).

Read it at https://nethesis.github.io/design-system/.

## Files

| File | Purpose |
| --- | --- |
| `glossary.yaml` | The glossary: single source of truth, edited through pull requests. The comment at the top describes the fields |
| `content/*.md` | The text pages (introduction, writing guidelines): plain markdown, no HTML or images. Tables with a "Do \| Don't" header are shown with check and cross marks. Link other pages with `?page=<id>`, for example `[glossary](?page=glossary)` |
| `content/components/*.md` | One page per component, in the Components group: the first paragraph is the summary shown in the header and in the overview, the second is the `Code:` line with the Storybook and Figma links |
| `glossary/it.tbx` | Italian glossary for Weblate, generated from `glossary.yaml` (do not edit) |
| `scripts/build-data.mjs` | Validates `glossary.yaml` and generates the TBX files and the page data |
| `scripts/vite-plugin-markdown.mjs` | Compiles each `content/*.md` into a Vue component, rejecting raw HTML and unsafe links (tests in `vite-plugin-markdown.test.mjs`) |
| `scripts/vite-plugin-glossary-watch.mjs` | Dev server only: reruns `build-data.mjs` when `glossary.yaml` is saved |
| `src/pages.ts` | The pages of the site and their sidebar groups |
| `data/colors.json` | Color tokens exported from the NDS Figma file (do not edit): see "Colors" below |
| `scripts/figma/export-colors.js`, `scripts/import-colors.mjs` | Export the color variables from Figma, then validate them and write `data/colors.json` |
| `src/foundations.ts` | Values of the foundations pages (typography, spacing and border, elevation and shadow), copied from the NDS Figma file: update them when Figma changes |
| `src/` | The web site (Vue, `@nethesis/vue-components`), published on GitHub Pages |

## Workflow

1. Edit `glossary.yaml` or a page in `content/`.
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
   on the NDS file, and save the returned JSON to a file.
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

The dev server runs on http://localhost:5179 and regenerates the glossary data whenever
`glossary.yaml` is saved: validation errors appear in the terminal and in the browser.

In development only, each glossary entry has a "Reviewed" checkbox and the list has a Review
filter: the marks are saved in the browser and an entry edited after its review shows "Changed
since review".

`npm test` runs the tests of the markdown plugin, including the security ones. `npm run build` builds the page
into `dist/`.
