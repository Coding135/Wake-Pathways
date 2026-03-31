/**
 * Remove opportunities whose deadline_at is before the dataset's generated_at
 * (or before now if --now flag). Updates total_listings and prunes orphan orgs.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.join(__dirname, '..', 'data', 'verified-listings.json');

const raw = fs.readFileSync(DATA, 'utf8');
const data = JSON.parse(raw);

const useNow = process.argv.includes('--now');
const asOf = useNow ? new Date() : new Date(data.generated_at || Date.now());

function isExpired(opp) {
  if (!opp.deadline_at) return false;
  const d = new Date(opp.deadline_at);
  if (Number.isNaN(d.getTime())) return false;
  return d < asOf;
}

const before = data.opportunities.length;
const kept = data.opportunities.filter((o) => !isExpired(o));
const removed = before - kept.length;

const orgIds = new Set(kept.map((o) => o.organization_id).filter(Boolean));
data.organizations = data.organizations.filter((org) => orgIds.has(org.id));
data.opportunities = kept;
data.total_listings = kept.length;

fs.writeFileSync(DATA, `${JSON.stringify(data, null, 2)}\n`, 'utf8');

console.log(`asOf: ${asOf.toISOString()}`);
console.log(`removed ${removed} expired (deadline_at < asOf), ${kept.length} remain`);
console.log(`organizations: ${data.organizations.length}`);
