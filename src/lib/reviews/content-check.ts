/**
 * Lightweight content screening for review text. Not a guarantee of safety;
 * moderators still approve every public review.
 */
const BLOCKED_WORDS = new Set(
  [
    'fuck',
    'shit',
    'bitch',
    'asshole',
    'nigger',
    'nigga',
    'faggot',
    'cunt',
    'rape',
  ].map((w) => w.toLowerCase())
);

const BLOCKED_PHRASES = ['kill yourself', 'kys'];

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

export function reviewTextFailsContentCheck(text: string): boolean {
  const lower = text.toLowerCase();
  for (const phrase of BLOCKED_PHRASES) {
    if (lower.includes(phrase)) return true;
  }
  const tks = tokenize(text);
  for (const w of BLOCKED_WORDS) {
    if (tks.includes(w)) return true;
  }
  return false;
}
