// Greedy A4 packer (same model FlowCV uses): each block has a measured height,
// blocks fill a column top-down, a heading is never left alone at a page bottom.
// columns: { [col]: [{ key, kind, height }] }, capacity: { [col]: px per page }
// firstPageOffset: px taken from page 1 of every column (a full-width header band)
// returns: [{ [col]: [key, ...] }, ...] one object per page
export function paginate(columns, capacity, firstPageOffset = 0) {
  const pages = [];
  for (const [col, blocks] of Object.entries(columns)) {
    let page = 0;
    let used = 0;
    blocks.forEach((b, i) => {
      const next = b.kind === 'heading' ? blocks[i + 1] : null;
      const need = b.height + (next ? next.height : 0);
      const cap = capacity[col] - (page === 0 ? firstPageOffset : 0);
      // 0.5px slack absorbs sub-pixel rounding between measure and render
      if (used > 0 && used + need > cap + 0.5) {
        page++;
        used = 0;
      }
      pages[page] ??= {};
      (pages[page][col] ??= []).push(b.key);
      used += b.height;
    });
  }
  return pages.length ? Array.from(pages, (p) => p ?? {}) : [{}];
}
