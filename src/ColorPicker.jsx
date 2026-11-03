import { useEffect, useRef, useState } from 'react';
import { hsvToHex, hexToHsv, isHex } from './color.js';

const MORE = ['#0f3d56', '#1d6fa5', '#3b82c4', '#0e7c86', '#3c8d5a', '#7a8b2e', '#b8860b', '#d9822b', '#c2412d', '#9b2c4a', '#7b3fa0', '#4b4f9c', '#5c6670', '#000000'];
const clamp = (x) => Math.min(1, Math.max(0, x));

// The rainbow swatch button plus our own popover, replacing the OS colour dialog.
export default function ColorPicker({ value, onChange, selected }) {
  const [open, setOpen] = useState(false);
  const [hsv, setHsv] = useState(() => hexToHsv(value));
  const [hexText, setHexText] = useState(value);
  const rootRef = useRef(null);
  const svRef = useRef(null);

  const apply = (next) => {
    setHsv(next);
    const hex = hsvToHex(next.h, next.s, next.v);
    setHexText(hex);
    onChange(hex);
  };
  const pickHex = (hex) => {
    setHsv(hexToHsv(hex));
    setHexText(hex);
    onChange(hex);
  };

  useEffect(() => {
    if (!open) return;
    setHsv(hexToHsv(value));
    setHexText(value);
    const away = (e) => !rootRef.current?.contains(e.target) && setOpen(false);
    const esc = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', away);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('pointerdown', away);
      document.removeEventListener('keydown', esc);
    };
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps -- sync from value only when opening

  const dragSv = (e) => {
    const r = svRef.current.getBoundingClientRect();
    apply({ ...hsv, s: clamp((e.clientX - r.left) / r.width), v: clamp(1 - (e.clientY - r.top) / r.height) });
  };
  const svKeys = (e) => {
    const step = e.shiftKey ? 0.1 : 0.02;
    const d = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] }[e.key];
    if (!d) return;
    e.preventDefault();
    apply({ ...hsv, s: clamp(hsv.s + d[0]), v: clamp(hsv.v + d[1]) });
  };

  const current = hsvToHex(hsv.h, hsv.s, hsv.v);
  return (
    <div className="cp" ref={rootRef}>
      <button
        type="button"
        className={`sw custom${selected ? ' on' : ''}`}
        style={selected ? { '--c': value } : undefined}
        aria-label="Custom colour"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((o) => !o)}
      />
      {open && (
        <div className="cp-pop" role="dialog" aria-label="Custom colour">
          <div className="cp-head">
            <span>Custom colour</span>
            <button type="button" className="cp-x" aria-label="Close" onClick={() => setOpen(false)}>✕</button>
          </div>
          <div
            ref={svRef}
            className="cp-sv"
            style={{ '--hue': `hsl(${hsv.h} 100% 50%)` }}
            role="slider"
            tabIndex={0}
            aria-label="Saturation and brightness"
            aria-valuetext={current}
            onKeyDown={svKeys}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              dragSv(e);
            }}
            onPointerMove={(e) => e.buttons && dragSv(e)}
          >
            <span className="cp-thumb" style={{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%`, background: current }} />
          </div>
          <input
            className="cp-hue"
            type="range"
            min="0"
            max="359"
            aria-label="Hue"
            value={Math.round(hsv.h)}
            onChange={(e) => apply({ ...hsv, h: Number(e.target.value) })}
          />
          <div className="cp-row">
            <span className="cp-preview" style={{ background: current }} />
            <input
              className="cp-hex"
              aria-label="Hex colour"
              value={hexText}
              maxLength={7}
              spellCheck="false"
              onChange={(e) => {
                const t = e.target.value.startsWith('#') ? e.target.value : `#${e.target.value}`;
                setHexText(t);
                if (isHex(t)) {
                  setHsv(hexToHsv(t.toLowerCase()));
                  onChange(t.toLowerCase());
                }
              }}
            />
          </div>
          <div className="cp-presets">
            {MORE.map((c) => (
              <button key={c} type="button" className="cp-dot" style={{ background: c }} aria-label={`Colour ${c}`} onClick={() => pickHex(c)} />
            ))}
          </div>
          <button type="button" className="primary cp-done" onClick={() => setOpen(false)}>Done</button>
        </div>
      )}
    </div>
  );
}
