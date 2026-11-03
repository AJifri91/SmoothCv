import { useEffect, useRef, useState } from 'react';
import Preview from './Preview.jsx';
import { TEMPLATES } from './templates.jsx';
import { SAMPLE, DEFAULT_STYLE } from './sample.js';
import { textToHtml, sanitize } from './richtext.js';

const KEY = 'smoothcv:v1';
const uid = () => Math.random().toString(36).slice(2, 10);
const blankEntry = () => ({ id: uid(), title: '', subtitle: '', date: '', location: '', description: '' });
const toHtml = (s) => (s && !s.includes('<') ? textToHtml(s) : s ?? '');

// Fills in fields added after a CV was saved and converts old plain-text descriptions.
function normalize(d) {
  d = structuredClone(d);
  d.style = { ...DEFAULT_STYLE, ...d.style };
  d.personal.photo ??= '';
  d.personal.links ??= [];
  d.personal.summary = toHtml(d.personal.summary);
  for (const s of d.sections) for (const e of s.entries) e.description = toHtml(e.description);
  return d;
}

function load() {
  try {
    const d = JSON.parse(localStorage.getItem(KEY));
    if (d?.personal && Array.isArray(d.sections)) return normalize(d);
  } catch {}
  return normalize(SAMPLE);
}

// Downscale to keep localStorage (≈5 MB) comfortable: max 600px JPEG.
function readPhoto(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, 600 / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * k);
      c.height = Math.round(img.height * k);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(img.src);
      resolve(c.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => reject(new Error('Not a readable image'));
    img.src = URL.createObjectURL(file);
  });
}

// Four horizontal lines; widths and anchoring show the alignment.
function AlignIcon({ lines, center, right }) {
  return (
    <svg width="16" height="14" viewBox="0 0 16 14" aria-hidden="true">
      {lines.map((w, i) => {
        const x = right ? 15 - w : center ? (16 - w) / 2 : 1;
        return <rect key={i} x={x} y={1 + i * 3.4} width={w} height="1.6" rx="0.8" fill="currentColor" />;
      })}
    </svg>
  );
}

function RichText({ label, value, onChange }) {
  const ref = useRef(null);
  // Only push outside changes into the editor; re-setting our own HTML would reset the caret.
  useEffect(() => {
    if (ref.current.innerHTML !== value) ref.current.innerHTML = sanitize(value); // the editor is live DOM too
  }, [value]);
  const run = (cmd, arg) => {
    ref.current.focus();
    document.execCommand(cmd, false, arg); // deprecated but still the only native rich-text API
    onChange(ref.current.innerHTML);
  };
  const link = () => {
    let url = prompt('Link address (https://… or mailto:…)');
    if (!url) return;
    if (!/^(https?:|mailto:)/i.test(url)) url = `https://${url}`;
    run('createLink', url);
  };
  const btn = (title, onClick, children) => (
    <button type="button" title={title} aria-label={title} onMouseDown={(e) => e.preventDefault()} onClick={onClick}>
      {children}
    </button>
  );
  return (
    <div className="field">
      <span>{label}</span>
      <div className="rt">
        <div className="rt-bar">
          {btn('Bold', () => run('bold'), <b>B</b>)}
          {btn('Italic', () => run('italic'), <i>I</i>)}
          {btn('Underline', () => run('underline'), <u>U</u>)}
          {btn('Bullet list', () => run('insertUnorderedList'), '•≡')}
          {btn('Numbered list', () => run('insertOrderedList'), '1.')}
          <span className="rt-sep" />
          {btn('Align left', () => run('justifyLeft'), <AlignIcon lines={[14, 9, 14, 9]} />)}
          {btn('Align centre', () => run('justifyCenter'), <AlignIcon lines={[14, 8, 14, 8]} center />)}
          {btn('Align right', () => run('justifyRight'), <AlignIcon lines={[14, 9, 14, 9]} right />)}
          {btn('Justify', () => run('justifyFull'), <AlignIcon lines={[14, 14, 14, 14]} />)}
          <span className="rt-sep" />
          {btn('Link', link, '🔗')}
          {btn('Remove link', () => run('unlink'), '×🔗')}
          {btn('Clear formatting', () => run('removeFormat'), 'Tx')}
        </div>
        <div
          ref={ref}
          className="rt-area"
          contentEditable
          role="textbox"
          aria-multiline="true"
          aria-label={label}
          onInput={(e) => onChange(e.currentTarget.innerHTML)}
          onPaste={(e) => {
            e.preventDefault(); // paste as plain text so foreign styling never lands in the CV
            document.execCommand('insertText', false, e.clipboardData.getData('text/plain'));
          }}
        />
      </div>
    </div>
  );
}

function Slider({ label, unit, min, max, step, value, onChange }) {
  return (
    <label className="slider">
      <span>
        {label} <b>{value}{unit}</b>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  );
}

function move(arr, i, d) {
  const j = i + d;
  if (j >= 0 && j < arr.length) [arr[i], arr[j]] = [arr[j], arr[i]];
}

function Field({ label, value, onChange, multiline, placeholder }) {
  const Tag = multiline ? 'textarea' : 'input';
  return (
    <label className="field">
      <span>{label}</span>
      <Tag value={value ?? ''} placeholder={placeholder} rows={multiline ? 5 : undefined} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function Tools({ onUp, onDown, onDelete, what }) {
  // preventDefault: these sit inside <summary>, where a click would also toggle the card
  const btn = (fn, label, icon) => (
    <button type="button" aria-label={`${label} ${what}`} onClick={(e) => (e.preventDefault(), fn())}>{icon}</button>
  );
  return (
    <span className="tools">
      {btn(onUp, 'Move up', '↑')}
      {btn(onDown, 'Move down', '↓')}
      {btn(onDelete, 'Delete', '✕')}
    </span>
  );
}

export default function App() {
  const [data, setData] = useState(load);
  // Clone-and-mutate keeps every editor handler a one-liner.
  const edit = (fn) =>
    setData((d) => {
      const n = structuredClone(d);
      fn(n);
      return n;
    });

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch {}
  }, [data]);

  const p = data.personal;
  const st = data.style;
  const setP = (k) => (v) => edit((d) => (d.personal[k] = v));
  const setS = (k) => (v) => edit((d) => (d.style[k] = v));

  const onPhoto = async (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    try {
      setP('photo')(await readPhoto(file));
    } catch (err) {
      alert(err.message);
    }
  };

  const download = () => {
    const prev = document.title;
    document.title = `${p.name || 'CV'} – CV`; // browsers use the title as the PDF file name
    window.print();
    document.title = prev;
  };

  return (
    <div className="app">
      <header className="topbar">
        <strong className="brand">SmoothCv</strong>
        <div className="tpl-pick" role="radiogroup" aria-label="Template">
          {Object.values(TEMPLATES).map((t) => (
            <button
              key={t.id}
              type="button"
              role="radio"
              aria-checked={data.template === t.id}
              className={data.template === t.id ? 'on' : ''}
              onClick={() => edit((d) => (d.template = t.id))}
            >
              {t.name}
            </button>
          ))}
        </div>
        <label className="accent">
          Accent <input type="color" value={data.accent} onChange={(e) => edit((d) => (d.accent = e.target.value))} />
        </label>
        <span className="spacer" />
        <button
          type="button"
          className="ghost"
          onClick={() => confirm('Replace your CV with the sample? This cannot be undone.') && setData(normalize(SAMPLE))}
        >
          Reset
        </button>
        <button type="button" className="primary" onClick={download}>Download PDF</button>
      </header>

      <main className="editor">
        <details className="card">
          <summary>Layout &amp; spacing</summary>
          <p className="hint">Content spilling onto another page? Nudge these and watch the page count.</p>
          <div className="grid2">
            <Slider label="Font size" unit="pt" min={7} max={13} step={0.25} value={st.fontSize} onChange={setS('fontSize')} />
            <Slider label="Line height" unit="" min={1} max={2} step={0.05} value={st.lineHeight} onChange={setS('lineHeight')} />
            <Slider label="Space between sections" unit="mm" min={0} max={15} step={0.5} value={st.sectionGap} onChange={setS('sectionGap')} />
            <Slider label="Space between entries" unit="mm" min={0} max={10} step={0.25} value={st.entryGap} onChange={setS('entryGap')} />
            <Slider label="Left & right margin" unit="mm" min={4} max={35} step={1} value={st.marginX} onChange={setS('marginX')} />
            <Slider label="Top & bottom margin" unit="mm" min={4} max={35} step={1} value={st.marginY} onChange={setS('marginY')} />
            <Slider label="Bullet indent" unit="mm" min={2} max={12} step={0.5} value={st.indent} onChange={setS('indent')} />
            <Slider label="Photo size" unit="mm" min={15} max={50} step={1} value={st.photoSize} onChange={setS('photoSize')} />
          </div>
          <label className="check">
            <input type="checkbox" checked={!!st.pageNumbers} onChange={(e) => setS('pageNumbers')(e.target.checked)} />
            Page numbers
          </label>
          <button type="button" className="add" onClick={() => edit((d) => (d.style = { ...DEFAULT_STYLE, photoShape: d.style.photoShape, pageNumbers: d.style.pageNumbers }))}>
            Reset spacing
          </button>
        </details>

        <details open className="card">
          <summary>Personal details</summary>
          <div className="photo-row">
            {p.photo ? <img className={`photo-thumb ${st.photoShape}`} src={p.photo} alt="Your photo" /> : <div className="photo-thumb empty">No photo</div>}
            <div className="photo-actions">
              <label className="ghost file">
                {p.photo ? 'Change photo' : 'Upload photo'}
                <input type="file" accept="image/*" onChange={onPhoto} />
              </label>
              {p.photo && <button type="button" className="ghost" onClick={() => setP('photo')('')}>Remove</button>}
              <select value={st.photoShape} onChange={(e) => setS('photoShape')(e.target.value)} aria-label="Photo shape">
                <option value="circle">Circle</option>
                <option value="rounded">Rounded</option>
                <option value="square">Square</option>
              </select>
            </div>
          </div>
          <div className="grid2">
            <Field label="Full name" value={p.name} onChange={setP('name')} />
            <Field label="Job title" value={p.title} onChange={setP('title')} />
            <Field label="Email" value={p.email} onChange={setP('email')} />
            <Field label="Phone" value={p.phone} onChange={setP('phone')} />
            <Field label="Location" value={p.location} onChange={setP('location')} />
            <Field label="Website" value={p.website} onChange={setP('website')} />
          </div>
          <div className="field">
            <span>Header links (shown as clickable text, e.g. LinkedIn, GitHub)</span>
            {p.links.map((l, li) => (
              <div className="link-row" key={l.id}>
                <input aria-label="Link text" placeholder="LinkedIn" value={l.label} onChange={(e) => edit((d) => (d.personal.links[li].label = e.target.value))} />
                <input aria-label="Link address" placeholder="linkedin.com/in/you" value={l.url} onChange={(e) => edit((d) => (d.personal.links[li].url = e.target.value))} />
                <button type="button" className="ghost" aria-label={`Remove link ${l.label}`} onClick={() => edit((d) => d.personal.links.splice(li, 1))}>✕</button>
              </div>
            ))}
            <button type="button" className="add" onClick={() => edit((d) => d.personal.links.push({ id: uid(), label: '', url: '' }))}>+ Add link</button>
          </div>
          <Field label="Extra header lines (one per line, e.g. languages, relocation)" value={p.extra} onChange={setP('extra')} multiline />
          <RichText label="Profile summary" value={p.summary} onChange={setP('summary')} />
        </details>

        {data.sections.map((s, si) => (
          <details open className="card" key={s.id}>
            <summary>
              {s.title || 'Untitled section'}
              <Tools
                what="section"
                onUp={() => edit((d) => move(d.sections, si, -1))}
                onDown={() => edit((d) => move(d.sections, si, 1))}
                onDelete={() => confirm(`Delete section "${s.title}"?`) && edit((d) => d.sections.splice(si, 1))}
              />
            </summary>
            <div className="grid2">
              <Field label="Section title" value={s.title} onChange={(v) => edit((d) => (d.sections[si].title = v))} />
              <div>
                <label className="check">
                  <input type="checkbox" checked={!!s.side} onChange={(e) => edit((d) => (d.sections[si].side = e.target.checked))} />
                  Side column (Sidebar, Duo)
                </label>
                <label className="check tight">
                  <input type="checkbox" checked={!!s.inline} onChange={(e) => edit((d) => (d.sections[si].inline = e.target.checked))} />
                  Show entries inline (A | B | C)
                </label>
              </div>
            </div>
            {s.entries.map((e, ei) => {
              const setE = (k) => (v) => edit((d) => (d.sections[si].entries[ei][k] = v));
              return (
                <details className="entry-card" key={e.id}>
                  <summary>
                    {e.title || 'New entry'}
                    {e.subtitle && <em> · {e.subtitle}</em>}
                    <Tools
                      what="entry"
                      onUp={() => edit((d) => move(d.sections[si].entries, ei, -1))}
                      onDown={() => edit((d) => move(d.sections[si].entries, ei, 1))}
                      onDelete={() => edit((d) => d.sections[si].entries.splice(ei, 1))}
                    />
                  </summary>
                  <div className="grid2">
                    <Field label="Title" value={e.title} onChange={setE('title')} />
                    <Field label="Subtitle" value={e.subtitle} onChange={setE('subtitle')} />
                    <Field label="Date" value={e.date} onChange={setE('date')} placeholder="2021 – Present" />
                    <Field label="Location" value={e.location} onChange={setE('location')} />
                  </div>
                  <RichText label="Description" value={e.description} onChange={setE('description')} />
                </details>
              );
            })}
            <button type="button" className="add" onClick={() => edit((d) => d.sections[si].entries.push(blankEntry()))}>+ Add entry</button>
          </details>
        ))}

        <button
          type="button"
          className="add big"
          onClick={() => edit((d) => d.sections.push({ id: uid(), title: 'New section', side: false, entries: [blankEntry()] }))}
        >
          + Add section
        </button>
      </main>

      <Preview data={data} />
    </div>
  );
}
