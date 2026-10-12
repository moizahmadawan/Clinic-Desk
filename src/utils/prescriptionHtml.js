import letterhead from '../data/letterheadBase64';

// Letterhead image 1240 x 1754 px (A4). Saari positions isi ke hisaab se hain.
const W = 1240;
const H = 1754;
const X = (px) => ((px / W) * 100).toFixed(3) + '%';
const Y = (px) => ((px / H) * 100).toFixed(3) + '%';
const VW = (px) => ((px / W) * 100).toFixed(3) + 'vw';

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const GENDER_UR = { Male: 'مرد', Female: 'عورت', Other: 'دیگر' };

function today() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

// Letterhead ki line par likhne ke liye box.
// Text lamba ho to pehle font chhota hota hai, phir bhi na aaye to 2 lines mein likha jata hai
// (phir bhi na aaye to aakhir mein ... lag jata hai).
function field(x1, x2, lineY, text, opts = {}) {
  const { base = 30, min = 22, twoLineMax = 22 } = opts;
  const str = String(text ?? '').trim();
  const boxW = x2 - x1;
  const usable = boxW - 14;
  const PER_CHAR = 0.6; // ek harf ki andaazi chowrai (font size ka hissa)
  const len = Math.max(str.length, 1);

  let size = base;
  let lines = 1;
  const fit = usable / (len * PER_CHAR);
  if (fit >= base) {
    size = base;
  } else if (fit >= min) {
    size = Math.floor(fit);
  } else {
    lines = 2;
    size = Math.max(18, Math.min(twoLineMax, Math.floor((2 * usable) / (len * PER_CHAR))));
  }

  const h = Math.ceil(size * 1.2 * lines) + 4;
  return `<div class="f" style="left:${X(x1)};width:${X(boxW)};top:${Y(lineY - h - 2)};height:${Y(h)};font-size:${VW(size)};">
    <span class="${lines === 2 ? 't2' : 't1'}">${esc(str)}</span>
  </div>`;
}

export function buildPrescriptionHtml(patient, meds) {
  const p = patient || {};
  const list = meds || [];
  const n = list.length;

  // Zyada dawaiyan hon to font chhota ho jata hai taake ek page mein aa jayein
  const size = n <= 8 ? 40 : n <= 11 ? 35 : n <= 15 ? 30 : 25;
  const insSize = Math.round(size * 0.78);
  const gap = Math.round(size * 0.5);

  const address = [p.address, p.city].filter(Boolean).join('، ');
  const gender = GENDER_UR[p.gender] || p.gender || '';

  const rows = list
    .map(
      (m, i) => `
    <div class="row" style="font-size:${VW(size)};margin-bottom:${VW(gap)};">
      <span class="num">${i + 1}.</span>
      <span class="med">${esc(m.name)}</span>
      ${m.instruction ? `<span class="ins" style="font-size:${VW(insSize)};"> — ${esc(m.instruction)}</span>` : ''}
    </div>`
    )
    .join('');

  const vitals = [p.visitNumber ? `Visit: ${esc(p.visitNumber)}` : '', p.bp ? `BP: ${esc(p.bp)}` : '', p.sugar ? `Sugar: ${esc(p.sugar)}` : '']
    .filter(Boolean)
    .join('&nbsp;&nbsp;&nbsp;');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<style>
  @page { size: A4; margin: 0; }
  html, body { margin: 0; padding: 0; background: #fff; }
  * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body { font-family: 'Noto Nastaliq Urdu', 'Noto Naskh Arabic', 'Jameel Noori Nastaleeq', Arial, sans-serif; color: #000; }
  .page { position: relative; width: 100%; aspect-ratio: ${W} / ${H}; overflow: hidden; }
  .bg { position: absolute; left: 0; top: 0; width: 100%; height: 100%; }
  .f {
    position: absolute; display: flex; align-items: flex-end; justify-content: center;
    line-height: 1.2; font-weight: bold; text-align: center; overflow: hidden;
  }
  .t1 { white-space: nowrap; max-width: 100%; overflow: hidden; text-overflow: ellipsis; }
  .t2 {
    display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2;
    overflow: hidden; word-break: break-word; max-width: 100%;
  }
  .vitals { position: absolute; font-family: Arial, sans-serif; font-size: ${VW(24)}; font-weight: bold; }
  .body { position: absolute; direction: rtl; text-align: right; }
  .row { line-height: 1.55; }
  .num { font-family: Arial, sans-serif; font-weight: bold; margin-left: ${VW(10)}; }
  .med { font-weight: bold; }
  .ins { color: #222; }
</style>
</head>
<body>
  <div class="page">
    <img class="bg" src="${letterhead}" />

    ${field(515, 837, 347, p.patientName)}
    ${field(275, 484, 347, p.age)}
    ${field(84, 225, 347, gender)}
    ${field(281, 841, 410, address)}
    ${field(84, 226, 410, today(), { base: 24, min: 20 })}

    ${vitals ? `<div class="vitals" style="left:${X(95)};top:${Y(478)};">${vitals}</div>` : ''}

    <div class="body" style="left:${X(95)};width:${X(820)};top:${Y(575)};height:${Y(1070)};">
      ${rows}
    </div>
  </div>
</body>
</html>`;
}
