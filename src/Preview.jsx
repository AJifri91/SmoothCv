import { useLayoutEffect, useRef, useState } from 'react';
import { buildBlocks } from './templates.jsx';
import { paginate } from './paginate.js';

const PAGE_PX = 210 * (96 / 25.4); // A4 width in CSS px

function Blk({ b }) {
  return (
    <div className={`blk blk-${b.kind}${b.last ? ' last' : ''}`} data-key={b.key}>
      {b.node}
    </div>
  );
}

export default function Preview({ data }) {
  const { tpl, cols, top } = buildBlocks(data);
  const byKey = Object.fromEntries(Object.values(cols).flat().map((b) => [b.key, b]));
  const [pages, setPages] = useState(null);
  const [scale, setScale] = useState(1);
  const paneRef = useRef(null);
  const measureRef = useRef(null);
  const probeRef = useRef(null);

  // Plain function, not a component: an inline component would remount on every render.
  const st = data.style;
  const vars = {
    '--accent': data.accent,
    '--fs': `${st.fontSize}pt`,
    '--lh': st.lineHeight,
    '--section-gap': `${st.sectionGap}mm`,
    '--entry-gap': `${st.entryGap}mm`,
    '--mx': `${st.marginX}mm`,
    '--my': `${st.marginY}mm`,
    '--indent': `${st.indent}mm`,
    '--photo': `${st.photoSize}mm`,
  };
  // withTop: render the full-width header band (page 1 only); pnum: "n/total" footer text
  const page = (fill, { extra = '', ref, withTop = false, pnum } = {}) => (
    <div ref={ref} className={`page tpl-${tpl.id} photo-${st.photoShape} ${extra}`} style={vars}>
      {withTop && top.length > 0 && (
        <div className="top" data-top>
          {top.map((b) => <Blk key={b.key} b={b} />)}
        </div>
      )}
      <div className="cols">
        {tpl.cols.map((c) => (
          <div key={c} className={`col col-${c}`} data-col={c}>
            {fill(c)}
          </div>
        ))}
      </div>
      {pnum && <div className="pnum">{pnum}</div>}
    </div>
  );

  // Measure every block off-screen at real size, then pack into A4 pages.
  useLayoutEffect(() => {
    let alive = true;
    const run = () => {
      if (!alive || !measureRef.current) return;
      const capacity = {};
      probeRef.current.querySelectorAll('[data-col]').forEach((el) => {
        const cs = getComputedStyle(el);
        capacity[el.dataset.col] = el.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
      });
      const heights = {};
      measureRef.current.querySelectorAll('[data-key]').forEach((el) => {
        heights[el.dataset.key] = el.getBoundingClientRect().height;
      });
      const measured = Object.fromEntries(
        Object.entries(cols).map(([c, list]) => [c, list.map((b) => ({ key: b.key, kind: b.kind, height: heights[b.key] }))]),
      );
      const topEl = measureRef.current.querySelector('[data-top]');
      setPages(paginate(measured, capacity, topEl ? topEl.getBoundingClientRect().height : 0));
    };
    run();
    // Re-pack when fonts arrive: each template's font loads the first time that template is shown.
    document.fonts?.ready.then(run);
    document.fonts?.addEventListener('loadingdone', run);
    return () => {
      alive = false;
      document.fonts?.removeEventListener('loadingdone', run);
    };
  }, [data]);

  // Fit the page to the pane width. Measured up front and on window resize as well,
  // because ResizeObserver callbacks can be delayed (background tabs, some mobile browsers).
  useLayoutEffect(() => {
    const fit = () => setScale(Math.min(1, (paneRef.current.clientWidth - 64) / PAGE_PX));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(paneRef.current);
    window.addEventListener('resize', fit);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', fit);
    };
  }, []);

  const shown = pages ?? [Object.fromEntries(Object.entries(cols).map(([c, l]) => [c, l.map((b) => b.key)]))];

  return (
    <div className="preview" ref={paneRef}>
      <div className="measure" aria-hidden="true">
        {page((c) => cols[c].map((b) => <Blk key={b.key} b={b} />), { extra: 'measuring', ref: measureRef, withTop: true })}
        {page(() => null, { ref: probeRef })}
      </div>
      <div className="page-count" role="status">
        {shown.length} page{shown.length > 1 ? 's' : ''}
      </div>
      <div className="pages" style={{ '--s': scale }}>
        {shown.map((pg, i) => (
          <div className="page-box" key={i}>
            {page((c) => (pg[c] ?? []).map((k) => byKey[k]).filter(Boolean).map((b) => <Blk key={b.key} b={b} />), {
              withTop: i === 0,
              pnum: st.pageNumbers ? `${i + 1}/${shown.length}` : undefined,
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
