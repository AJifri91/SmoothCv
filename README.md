# SmoothCv

A small CV builder that runs entirely in the browser. Live: https://ajifri91.github.io/SmoothCv/

- Five templates: Clean, Minimal, Sidebar, Banner, Duo (header band + two columns)
- Inline sections (e.g. skills as "A | B | C"), extra header lines, optional page numbers
- Rich text descriptions (bold, italic, underline, lists, links) and an optional photo
- Live A4 preview that paginates automatically
- Layout & spacing sliders (font size, line height, section/entry spacing, margins, bullet indent) to make content fit the pages you want
- Download PDF via the browser's print dialog ("Save as PDF"), so the PDF matches the preview
- Everything is saved in your browser's localStorage; nothing is sent to a server

## Develop

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # unit tests for pagination and rich text helpers
npm run deploy   # build and publish dist/ to the gh-pages branch
```

## How pagination works

Every CV piece (header, section heading, entry) is rendered once off-screen at real A4 size and measured.
`src/paginate.js` then fills each column top-down, starting a new page when the next block will not fit
and never leaving a section heading alone at the bottom of a page. Changing any content or spacing re-runs this.
