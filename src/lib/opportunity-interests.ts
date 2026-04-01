import type { Opportunity, OpportunityCategory } from '@/types/database';

/**
 * Controlled interest ids for Explore filtering. Derived from listing tags (and
 * a few high-signal title phrases), not guessed from vague copy.
 */
export const OPPORTUNITY_INTEREST_IDS = [
  'business',
  'entrepreneurship',
  'law',
  'medicine',
  'healthcare',
  'engineering',
  'coding',
  'computer_science',
  'ai',
  'finance',
  'government',
  'policy',
  'civic',
  'environment',
  'biology',
  'chemistry',
  'arts',
  'design',
  'education',
  'service',
  'leadership',
  'research',
  'stem',
  'agriculture',
  'communication',
] as const;

export type OpportunityInterestId = (typeof OPPORTUNITY_INTEREST_IDS)[number];

const ID_SET = new Set<string>(OPPORTUNITY_INTEREST_IDS);

export const OPPORTUNITY_INTEREST_OPTIONS: { id: OpportunityInterestId; label: string }[] =
  [
    { id: 'business', label: 'Business' },
    { id: 'entrepreneurship', label: 'Entrepreneurship' },
    { id: 'law', label: 'Law & justice' },
    { id: 'medicine', label: 'Medicine' },
    { id: 'healthcare', label: 'Healthcare' },
    { id: 'engineering', label: 'Engineering' },
    { id: 'coding', label: 'Coding' },
    { id: 'computer_science', label: 'Computer science' },
    { id: 'ai', label: 'AI' },
    { id: 'finance', label: 'Finance' },
    { id: 'government', label: 'Government' },
    { id: 'policy', label: 'Public policy' },
    { id: 'civic', label: 'Civic engagement' },
    { id: 'environment', label: 'Environment' },
    { id: 'biology', label: 'Biology & life science' },
    { id: 'chemistry', label: 'Chemistry' },
    { id: 'arts', label: 'Arts & performance' },
    { id: 'design', label: 'Design' },
    { id: 'education', label: 'Education' },
    { id: 'service', label: 'Service & nonprofit' },
    { id: 'leadership', label: 'Leadership' },
    { id: 'research', label: 'Research' },
    { id: 'stem', label: 'STEM (general)' },
    { id: 'agriculture', label: 'Agriculture & 4-H' },
    { id: 'communication', label: 'Communication & media' },
  ];

export const OPPORTUNITY_INTEREST_LABEL: Record<OpportunityInterestId, string> =
  Object.fromEntries(OPPORTUNITY_INTEREST_OPTIONS.map((o) => [o.id, o.label])) as Record<
    OpportunityInterestId,
    string
  >;

/** Maps each dataset tag string to one or more interest ids. Location-only tags map to none. */
const TAG_TO_INTERESTS: Record<string, readonly OpportunityInterestId[]> = {
  '4-h': ['agriculture', 'leadership', 'stem'],
  academic: ['education'],
  'academic-enrichment': ['education'],
  acting: ['arts'],
  animals: ['biology', 'environment'],
  arts: ['arts'],
  astronomy: ['research', 'stem'],
  bootcamp: ['coding', 'computer_science'],
  business: ['business'],
  'career-exploration': ['business', 'leadership'],
  'career-readiness': ['business', 'leadership'],
  chemistry: ['chemistry', 'stem'],
  'city-program': ['civic', 'government'],
  civic: ['civic', 'government'],
  civics: ['civic', 'policy'],
  classes: ['education'],
  coding: ['coding', 'computer_science'],
  'computer-science': ['coding', 'computer_science'],
  college: ['education'],
  'college-access': ['education'],
  'college-credit': ['education'],
  'college-prep': ['education'],
  community: ['civic'],
  'community-service': ['civic', 'service'],
  conservation: ['biology', 'environment'],
  construction: ['engineering', 'service'],
  counselor: ['education', 'leadership'],
  creative: ['arts'],
  cybersecurity: ['coding', 'computer_science'],
  'data-engineering': ['coding', 'computer_science'],
  design: ['design'],
  'digital-literacy': ['computer_science', 'education'],
  disaster: ['civic', 'service'],
  drawing: ['arts'],
  'dual-enrollment': ['education'],
  education: ['education'],
  empowerment: ['leadership'],
  engineering: ['engineering', 'stem'],
  environment: ['environment'],
  fashion: ['arts', 'design'],
  festival: ['arts'],
  finance: ['finance'],
  'financial-aid': ['education', 'finance'],
  'first-generation': ['education'],
  'food-security': ['civic', 'service'],
  fundraising: ['finance', 'service'],
  gifted: ['education', 'research'],
  government: ['government'],
  greenway: ['civic', 'environment'],
  'hands-on': ['stem'],
  health: ['healthcare'],
  'health-careers': ['healthcare', 'medicine'],
  healthcare: ['healthcare', 'medicine'],
  'law-enforcement': ['law'],
  leadership: ['leadership'],
  libraries: ['education'],
  library: ['education'],
  literacy: ['education'],
  'local-government': ['civic', 'government'],
  marketing: ['business', 'communication'],
  math: ['stem'],
  'mental-health': ['healthcare'],
  mentorship: ['education', 'leadership'],
  museum: ['arts', 'education', 'stem'],
  networking: ['business'],
  nonprofit: ['civic', 'service'],
  'nuclear-engineering': ['engineering', 'research', 'stem'],
  outdoors: ['environment'],
  parks: ['civic', 'environment'],
  'parks-recreation': ['civic', 'environment', 'leadership'],
  performance: ['arts'],
  'pre-college': ['education'],
  'public-health': ['healthcare', 'policy'],
  'public-safety': ['civic', 'law'],
  'public-speaking': ['communication', 'leadership'],
  reading: ['education'],
  refugee: ['civic', 'education'],
  remote: [],
  renewable: ['engineering', 'environment'],
  research: ['research', 'stem'],
  robotics: ['coding', 'engineering', 'stem'],
  sat: ['education'],
  scholarship: ['education', 'finance'],
  'scholarships-available': ['education', 'finance'],
  'school-based': ['education'],
  'school-club': ['civic', 'leadership'],
  science: ['research', 'stem'],
  selective: ['research'],
  service: ['service'],
  'social-justice': ['civic', 'policy'],
  'state-program': ['government'],
  stem: ['stem'],
  stewardship: ['environment'],
  stipend: ['finance'],
  team: ['leadership'],
  'technical-theatre': ['arts'],
  technology: ['computer_science', 'stem'],
  'test-prep': ['education'],
  textiles: ['design', 'engineering'],
  theatre: ['arts'],
  training: ['education'],
  utility: ['engineering'],
  volunteer: ['civic', 'service'],
  wcpss: ['education'],
  'web-development': ['coding', 'computer_science'],
  wellness: ['healthcare'],
  wildlife: ['biology', 'environment'],
  'work-experience': ['business', 'leadership'],
  workshop: ['education'],
  yoga: ['healthcare'],
  'youth-development': ['education', 'leadership'],
  'youth-education': ['education'],
  zoo: ['biology', 'environment'],
  horticulture: ['agriculture', 'biology', 'environment'],
  hospital: ['healthcare', 'medicine'],
  hunger: ['civic', 'service'],
  'hunger-relief': ['civic', 'service'],
  immigrant: ['civic', 'education'],
  paid: [],
  'paid-internship': ['business', 'finance', 'leadership'],
  internship: ['business', 'leadership'],
  competition: ['research', 'stem'],
  competitive: ['research', 'stem'],
  event: ['civic'],
  law: ['law'],
  legal: ['law'],
  entrepreneurship: ['business', 'entrepreneurship'],
  'drop-in': ['education'],
  'year-round': [],
  teen: [],
  'middle-school': [],
  'high-school': [],
  summer: [],
  camp: ['education'],
  residential: ['education', 'leadership'],
  free: [],
  national: [],
  triangle: [],
  'north-carolina': [],
  'wake-county': [],
  unc: [],
  duke: [],
  'nc-state': [],
  job: [],
  family: [],
  athletics: ['education', 'leadership'],
  apex: [],
  cary: [],
  'holly-springs': [],
  'wake-forest': [],
  housing: ['civic', 'policy'],
  ems: ['healthcare', 'medicine'],
  forestry: ['environment', 'research', 'stem'],
  tutoring: ['education'],
  online: [],
  psychology: ['healthcare', 'research'],
  ncssm: ['education', 'stem'],
  'school-year': [],
  seniors: [],
  medicine: ['healthcare', 'medicine'],
};

const CATEGORY_HINTS: Partial<Record<OpportunityCategory, readonly OpportunityInterestId[]>> = {
  scholarship: ['education', 'finance'],
  mentorship: ['education', 'leadership'],
  leadership: ['leadership'],
  volunteer: ['civic', 'service'],
  competition: ['research', 'stem'],
  internship: ['business', 'leadership'],
  job: ['business', 'leadership'],
  summer_program: ['education', 'stem'],
};

/** AI only when the title or summary explicitly mentions it (conservative). */
const AI_TITLE_RE = /\b(ai|a\.i\.|artificial intelligence|machine learning)\b/i;

function addId(set: Set<OpportunityInterestId>, id: OpportunityInterestId) {
  set.add(id);
}

/**
 * Derive interest ids for a listing from tags, optional category hint, and explicit AI wording.
 */
export function deriveOpportunityInterestIds(opp: Opportunity): OpportunityInterestId[] {
  const out = new Set<OpportunityInterestId>();

  for (const tag of opp.tags) {
    const mapped = TAG_TO_INTERESTS[tag];
    if (mapped) {
      for (const id of mapped) addId(out, id);
    }
  }

  const cat = CATEGORY_HINTS[opp.category];
  if (cat && out.size === 0) {
    for (const id of cat) addId(out, id);
  }

  const blob = `${opp.title ?? ''} ${opp.short_summary ?? ''}`;
  if (AI_TITLE_RE.test(blob)) {
    addId(out, 'ai');
  }

  return [...out].filter((id): id is OpportunityInterestId => ID_SET.has(id)).sort();
}

export function isValidInterestId(id: string): id is OpportunityInterestId {
  return ID_SET.has(id);
}

export function parseInterestParam(raw: string | undefined): OpportunityInterestId[] {
  if (!raw?.trim()) return [];
  const parts = raw.split(',').map((s) => s.trim());
  return parts.filter((p): p is OpportunityInterestId => isValidInterestId(p));
}
