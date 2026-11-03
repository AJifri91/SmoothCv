// Rich text is stored as HTML from a contentEditable editor. Everything rendered
// into the CV goes through sanitize(), since stored HTML is user/storage-controlled.
const ALLOWED = new Set(['B', 'STRONG', 'I', 'EM', 'U', 'A', 'UL', 'OL', 'LI', 'P', 'DIV', 'BR']);
const DROP = new Set(['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'TEMPLATE']);
const SAFE_HREF = /^(https?:|mailto:)/i;

export function sanitize(html) {
  const doc = new DOMParser().parseFromString(`<body>${html ?? ''}</body>`, 'text/html');
  const walk = (node) => {
    for (const el of [...node.children]) {
      if (DROP.has(el.tagName)) {
        el.remove();
        continue;
      }
      walk(el);
      if (!ALLOWED.has(el.tagName)) {
        el.replaceWith(...el.childNodes);
        continue;
      }
      for (const a of [...el.attributes]) {
        if (!(el.tagName === 'A' && a.name === 'href' && SAFE_HREF.test(a.value.trim()))) el.removeAttribute(a.name);
      }
    }
  };
  walk(doc.body);
  return doc.body.innerHTML;
}

// Header link addresses: bare "github.com/x" gets https://, anything not web/mail/phone is dropped.
export function safeUrl(url) {
  const u = (url ?? '').trim();
  if (!u) return null;
  const full = /^[a-z][a-z0-9+.-]*:/i.test(u) ? u : `https://${u}`;
  return /^(https?:|mailto:|tel:)/i.test(full) ? full : null;
}

export const isBlank =(html) => !html || !html.replace(/<[^>]*>|&nbsp;/g, '').trim();

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Old plain-text format: lines starting with -, * or • were bullets.
export function textToHtml(text) {
  let out = '';
  let inList = false;
  for (const line of (text ?? '').split('\n')) {
    const m = line.match(/^\s*[-*•]\s+(.*)/);
    if (m) {
      if (!inList) out += '<ul>';
      inList = true;
      out += `<li>${esc(m[1])}</li>`;
    } else {
      if (inList) out += '</ul>';
      inList = false;
      if (line.trim()) out += `<p>${esc(line)}</p>`;
    }
  }
  return inList ? out + '</ul>' : out;
}
