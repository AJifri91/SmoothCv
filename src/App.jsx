import { useEffect, useRef, useState } from 'react';
import Preview from './Preview.jsx';
import ColorPicker from './ColorPicker.jsx';
import { TEMPLATES } from './templates.jsx';
import { SAMPLE, SAMPLE_STYLES, SAMPLE_SIDE, DEFAULT_STYLE } from './sample.js';
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

// An untouched sample is swapped for the current one, so sample updates reach returning visitors.
// The retired Jordan Avery sample is always replaced: tapping a template or colour on it marked it
// edited, which left those visitors stuck on the old sample.
const untouchedSample = (d) =>
  d.isSample || (d.personal.name === 'Jordan Avery' && d.personal.email === 'jordan.avery@example.com');

function load() {
  let template = 'clean';
  try {
    const d = JSON.parse(localStorage.getItem(KEY));
    if (d?.personal && Array.isArray(d.sections)) {
      if (!untouchedSample(d)) return normalize(d);
      if (d.isSample && TEMPLATES[d.template]) template = d.template; // keep the template picked on the sample
    }
  } catch {}
  return sampleFor(template);
}

// The untouched sample carries spacing tuned so it fills one page in each template.
const sampleFor = (template) => {
  const side = SAMPLE_SIDE[template];
  const sections = side ? SAMPLE.sections.map((s) => ({ ...s, side: side.includes(s.id) })) : SAMPLE.sections;
  return normalize({ ...SAMPLE, template, sections, style: SAMPLE_STYLES[template] ?? DEFAULT_STYLE });
};

const SWATCHES =['#1f5f6b', '#2f4f9e', '#6d4bc2', '#b03a6a', '#c0562d', '#2f7d55', '#2b2b2b'];

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

const pick = (o, keys) => Object.fromEntries(keys.map((k) => [k, o[k]]));

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

const Eye = ({ off }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
    {off && <path d="M4 4l16 16" />}
  </svg>
);

function Tools({ onUp, onDown, onDelete, onToggle, hidden, onDuplicate, what }) {
  // preventDefault: these sit inside <summary>, where a click would also toggle the card
  const btn = (fn, label, icon, title = label) => (
    <button type="button" title={title} aria-label={`${label} ${what}`} onClick={(e) => (e.preventDefault(), fn())}>{icon}</button>
  );
  return (
    <span className="tools">
      {onToggle && btn(onToggle, hidden ? 'Show' : 'Hide', <Eye off={hidden} />, hidden ? 'Hidden from CV – click to show' : 'Hide from CV')}
      {onDuplicate && btn(onDuplicate, 'Duplicate', '⧉')}
      {btn(onUp, 'Move up', '↑')}
      {btn(onDown, 'Move down', '↓')}
      {btn(onDelete, 'Delete', '✕')}
    </span>
  );
}

// Section types offered by "Add section" (the kinds FlowCV offers); short lists default to inline + side column.
const PRESETS = [
  ['Experience', {}],
  ['Education', {}],
  ['Projects', {}],
  ['Skills', { side: true, inline: true }],
  ['Languages', { side: true, inline: true }],
  ['Certifications', { side: true }],
  ['Courses', {}],
  ['Awards', {}],
  ['Publications', {}],
  ['Volunteering', {}],
  ['Interests', { side: true, inline: true }],
  ['References', {}],
  ['Custom', {}],
];

// The bundled fonts (see fonts.js); any of them can override a template's own font.
const FONTS = ['Source Serif 4', 'Inter', 'Lato', 'Nunito Sans', 'Rubik'];

const isBackup = (d) =>
  d && typeof d.personal === 'object' && Array.isArray(d.sections) && d.sections.every((s) => s && Array.isArray(s.entries));

export default function App() {
  const [data, setData] = useState(load);
  // Clone-and-mutate keeps every editor handler a one-liner.
  const edit = (fn) =>
    setData((d) => {
      const n = structuredClone(d);
      fn(n);
      n.isSample = false;
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

  // Your CV lives only in this browser, so offer a file copy to keep or move to another device.
  const saveBackup = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(p.name || 'cv').trim().replace(/[^\w-]+/g, '_')}-smoothcv.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const loadBackup = async (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    try {
      if (file.size > 5e6) throw new Error('That file is too large to be a SmoothCv backup.');
      let d;
      try {
        d = JSON.parse(await file.text());
      } catch {
        throw new Error('That file is not valid JSON.');
      }
      if (!isBackup(d)) throw new Error('That file is not a SmoothCv backup.');
      if (confirm('Replace your current CV with this backup?')) setData({ ...normalize(d), isSample: false });
    } catch (err) {
      alert(err.message);
    }
  };

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
              onClick={() => (data.isSample ? setData(sampleFor(t.id)) : edit((d) => (d.template = t.id)))}
            >
              {t.name}
            </button>
          ))}
        </div>
        <div className="swatches" role="radiogroup" aria-label="Accent colour">
          {SWATCHES.map((c) => (
            <button
              key={c}
              type="button"
              role="radio"
              aria-checked={data.accent === c}
              aria-label={`Accent ${c}`}
              className="sw"
              style={{ '--c': c }}
              onClick={() => edit((d) => (d.accent = c))}
            />
          ))}
          <ColorPicker value={data.accent} selected={!SWATCHES.includes(data.accent)} onChange={(c) => edit((d) => (d.accent = c))} />
        </div>
        <span className="spacer" />
        <button
          type="button"
          className="ghost"
          onClick={() => confirm('Replace your CV with the sample? This cannot be undone.') && setData(sampleFor(data.template))}
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
            <Slider label="Name size" unit="×" min={0.7} max={1.4} step={0.05} value={st.nameScale} onChange={setS('nameScale')} />
            {TEMPLATES[data.template]?.cols.length > 1 && (
              <Slider
                label="Side column width"
                unit="%"
                min={20}
                max={60}
                step={1}
                value={st.sideWidth ?? (data.template === 'duo' ? 50 : 30)}
                onChange={setS('sideWidth')}
              />
            )}
          </div>
          <div className="grid2">
            <label className="field">
              <span>Font</span>
              <select value={st.font} onChange={(e) => setS('font')(e.target.value)}>
                <option value="">Template default</option>
                {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </label>
            <label className="field">
              <span>Page size</span>
              <select value={st.pageFormat} onChange={(e) => setS('pageFormat')(e.target.value)}>
                <option value="A4">A4 (210 × 297 mm)</option>
                <option value="Letter">US Letter (8.5 × 11 in)</option>
              </select>
            </label>
          </div>
          <label className="check">
            <input type="checkbox" checked={!!st.pageNumbers} onChange={(e) => setS('pageNumbers')(e.target.checked)} />
            Page numbers
          </label>
          <button type="button" className="add" onClick={() => edit((d) => (d.style = { ...DEFAULT_STYLE, ...pick(d.style, ['photoShape', 'pageNumbers', 'pageFormat', 'font']) }))}>
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
          <details open className={`card${s.hidden ? ' is-hidden' : ''}`} key={s.id}>
            <summary>
              {s.title || 'Untitled section'}
              <Tools
                what="section"
                hidden={s.hidden}
                onToggle={() => edit((d) => (d.sections[si].hidden = !d.sections[si].hidden))}
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
                <label className="check tight">
                  <input type="checkbox" checked={!!s.pageBreak} onChange={(e) => edit((d) => (d.sections[si].pageBreak = e.target.checked))} />
                  Start on a new page
                </label>
              </div>
            </div>
            {s.entries.map((e, ei) => {
              const setE = (k) => (v) => edit((d) => (d.sections[si].entries[ei][k] = v));
              return (
                <details className={`entry-card${e.hidden ? ' is-hidden' : ''}`} key={e.id}>
                  <summary>
                    {e.title || 'New entry'}
                    {e.subtitle && <em> · {e.subtitle}</em>}
                    <Tools
                      what="entry"
                      hidden={e.hidden}
                      onToggle={() => edit((d) => (d.sections[si].entries[ei].hidden = !d.sections[si].entries[ei].hidden))}
                      onDuplicate={() => edit((d) => d.sections[si].entries.splice(ei + 1, 0, { ...structuredClone(e), id: uid() }))}
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

        <div className="add-section">
          <span>Add section</span>
          <div className="preset-grid">
            {PRESETS.map(([title, opts]) => (
              <button
                key={title}
                type="button"
                className="ghost"
                onClick={() => edit((d) => d.sections.push({ id: uid(), title: title === 'Custom' ? 'New section' : title, side: false, ...opts, entries: [blankEntry()] }))}
              >
                + {title}
              </button>
            ))}
          </div>
        </div>

        <div className="backup">
          <button type="button" className="ghost" onClick={saveBackup}>Save backup (.json)</button>
          <label className="ghost file">
            Load backup
            <input type="file" accept="application/json,.json" onChange={loadBackup} />
          </label>
        </div>
      </main>

      <Preview data={data} />
    </div>
  );
}
