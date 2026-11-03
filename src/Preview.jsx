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
  const { tpl, cols } = buildBlocks(data);
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
  const page = (fill, extra = '', ref = undefined) => (
    <div ref={ref} className={`page tpl-${tpl.id} photo-${st.photoShape} ${extra}`} style={vars}>
      {tpl.cols.map((c) => (
        <div key={c} className={`col col-${c}`} data-col={c}>
          {fill(c)}
        </div>
      ))}
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
      setPages(paginate(measured, capacity));
    };
    run();
    document.fonts?.ready.then(run); // re-pack once web/system fonts settle
    return () => {
      alive = false;
    };
  }, [data]);

  useLayoutEffect(() => {
    const ro = new ResizeObserver(([e]) => setScale(Math.min(1, (e.contentRect.width - 48) / PAGE_PX)));
    ro.observe(paneRef.current);
    return () => ro.disconnect();
  }, []);

  const shown = pages ?? [Object.fromEntries(Object.entries(cols).map(([c, l]) => [c, l.map((b) => b.key)]))];

  return (
    <div className="preview" ref={paneRef}>
      <div className="measure" aria-hidden="true">
        {page((c) => cols[c].map((b) => <Blk key={b.key} b={b} />), 'measuring', measureRef)}
        {page(() => null, '', probeRef)}
      </div>
      <div className="page-count" role="status">
        {shown.length} page{shown.length > 1 ? 's' : ''}
      </div>
      <div className="pages" style={{ '--s': scale }}>
        {shown.map((pg, i) => (
          <div className="page-box" key={i}>
            {page((c) => (pg[c] ?? []).map((k) => byKey[k]).filter(Boolean).map((b) => <Blk key={b.key} b={b} />))}
          </div>
        ))}
      </div>
    </div>
  );
}
