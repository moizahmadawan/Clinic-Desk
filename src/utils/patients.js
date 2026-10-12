// Patient ki duplicate pehchan aur visit number ka hisaab

const DIACRITICS = /[\u064B-\u065F\u0670\u0640\u200C\u200D]/g;

export function normalizeText(s) {
  return String(s || '')
    .replace(DIACRITICS, '')
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/[ھه]/g, 'ہ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

const digits = (s) => String(s || '').replace(/\D/g, '');

// Pehle se register hai? (naam + walid/shohar ka naam ek jaisa, ya naam + phone ek jaisa)
export function findDuplicate(patients, form) {
  const name = normalizeText(form.patientName);
  const father = normalizeText(form.fatherOrHusbandName);
  const phone = digits(form.phone).slice(-10);
  if (!name) return null;
  return (
    patients.find((p) => {
      if (normalizeText(p.patientName) !== name) return false;
      const pf = normalizeText(p.fatherOrHusbandName);
      if (father && pf && pf === father) return true;
      const pp = digits(p.phone).slice(-10);
      return !!(phone && pp && phone === pp);
    }) || null
  );
}

export function ymd(d = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export const visitOf = (p) => Math.max(1, parseInt(p?.visitNumber, 10) || 1);

export function hasRecommendation(p) {
  return (
    (p?.recommendationCount || 0) > 0 ||
    !!p?.recommendationTime ||
    (Array.isArray(p?.recommendedMedicines) && p.recommendedMedicines.length > 0)
  );
}

export function lastVisitDateOf(p) {
  if (p?.lastVisitDate) return p.lastVisitDate;
  const t = p?.recommendationTime;
  if (t && typeof t.toDate === 'function') return ymd(t.toDate());
  return '';
}

/**
 * Registration par visit = 1.
 * Pehli recommendation usi visit (1) ki hoti hai.
 * Us ke baad har naye din ki recommendation par visit +1.
 * Usi din dobara save karne par visit wahi rehti hai (taake ghalti se number na barhe).
 */
export function nextVisitInfo(p, today = ymd()) {
  const current = visitOf(p);
  if (!hasRecommendation(p) || lastVisitDateOf(p) === today) {
    return { current, next: current, isNew: false };
  }
  return { current, next: current + 1, isNew: true };
}
