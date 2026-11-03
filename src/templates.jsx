// Template definitions + turning CV data into measurable blocks per column.
import { sanitize, isBlank } from './richtext.js';

export const TEMPLATES = {
  clean: { id: 'clean', name: 'Clean', cols: ['main'] },
  sidebar: { id: 'sidebar', name: 'Sidebar', cols: ['side', 'main'] },
  banner: { id: 'banner', name: 'Banner', cols: ['main'] },
};

export function Desc({ html }) {
  if (isBlank(html)) return null;
  return <div className="desc" dangerouslySetInnerHTML={{ __html: sanitize(html) }} />;
}

function Photo({ p }) {
  return p.photo ? <img className="photo" src={p.photo} alt="" /> : null;
}

function Contact({ p }) {
  const items = [p.email, p.phone, p.location, p.website].filter(Boolean);
  return <div className="contact">{items.map((t, i) => <span key={i}>{t}</span>)}</div>;
}

function Entry({ e }) {
  return (
    <div className="entry">
      <div className="e-meta">
        <span className="e-date">{e.date}</span>
        <span className="e-loc">{e.location}</span>
      </div>
      <div className="e-body">
        <div className="e-title">{e.title}</div>
        <div className="e-sub">{e.subtitle}</div>
        <Desc html={e.description} />
      </div>
    </div>
  );
}

// Returns { tpl, cols: { [col]: [{ key, kind, last, node }] } }
export function buildBlocks(data) {
  const tpl = TEMPLATES[data.template] ?? TEMPLATES.clean;
  const p = data.personal;
  const cols = Object.fromEntries(tpl.cols.map((c) => [c, []]));
  const add = (col, key, kind, node, last = false) => cols[col].push({ key, kind, node, last });
  const heading = (col, key, text) => add(col, key, 'heading', <h2>{text}</h2>);

  const title = (
    <>
      <h1>{p.name}</h1>
      {p.title && <div className="role">{p.title}</div>}
    </>
  );
  if (tpl.id === 'sidebar') {
    add('main', 'header', 'header', <div className="hdr"><div className="hdr-text">{title}</div></div>);
    if (p.photo) add('side', 'photo', 'header', <Photo p={p} />);
    heading('side', 'contact-h', 'Contact');
    add('side', 'contact', 'entry', <Contact p={p} />, true);
  } else {
    add(
      'main',
      'header',
      'header',
      <div className="hdr">
        <Photo p={p} />
        <div className="hdr-text">
          {title}
          <Contact p={p} />
        </div>
      </div>,
    );
  }

  if (!isBlank(p.summary)) {
    heading('main', 'summary-h', 'Profile');
    add('main', 'summary', 'entry', <Desc html={p.summary} />, true);
  }

  for (const s of data.sections) {
    if (!s.entries.length) continue;
    const col = s.side && cols.side ? 'side' : 'main';
    heading(col, `${s.id}-h`, s.title);
    s.entries.forEach((e, i) => add(col, `${s.id}-${e.id}`, 'entry', <Entry e={e} />, i === s.entries.length - 1));
  }
  return { tpl, cols };
}
