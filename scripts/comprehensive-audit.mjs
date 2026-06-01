import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, '../data/verified-listings.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const TIMEOUT = 20000;
const CONCURRENCY = 10;
const IMAGE_EXT = /\.(jpe?g|png|gif|webp|svg|bmp|ico)(\?|$)/i;

async function checkUrl(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT);
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      signal: ctrl.signal,
      headers: {
        'User-Agent': UA,
        Accept: 'text/html,application/xhtml+xml,application/pdf;q=0.9,*/*;q=0.8',
      },
    });
    clearTimeout(t);
    const ct = (res.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
    const finalUrl = res.url;
    const host = (() => {
      try {
        return new URL(finalUrl).hostname.replace(/^www\./, '');
      } catch {
        return '';
      }
    })();
    const origHost = (() => {
      try {
        return new URL(url).hostname.replace(/^www\./, '');
      } catch {
        return '';
      }
    })();
    return {
      ok: res.ok,
      status: res.status,
      ct,
      finalUrl,
      crossDomain: host && origHost && host !== origHost,
      isImage: ct.startsWith('image/') || IMAGE_EXT.test(finalUrl),
      isHtml: ct.includes('html') || ct.includes('xml'),
      isPdf: ct.includes('pdf'),
    };
  } catch (e) {
    clearTimeout(t);
    return {
      ok: false,
      status: 0,
      ct: '',
      finalUrl: url,
      error: String(e.message || e).slice(0, 100),
      isImage: false,
      isHtml: false,
      isPdf: false,
      crossDomain: false,
    };
  }
}

const urlMap = new Map();
for (const o of data.opportunities) {
  for (const field of ['official_application_url', 'source_url']) {
    const url = o[field]?.trim();
    if (!url) continue;
    if (!urlMap.has(url)) urlMap.set(url, []);
    urlMap.get(url).push({ id: o.id, title: o.title, field });
  }
}

const urls = [...urlMap.keys()];
let idx = 0;
const results = new Map();

async function worker() {
  while (idx < urls.length) {
    const u = urls[idx++];
    results.set(u, await checkUrl(u));
    if (idx % 25 === 0) process.stderr.write(`checked ${idx}/${urls.length}\n`);
  }
}

await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));

const critical = [];
const blocked = [];
const suspicious = [];
const metadata = [];

for (const [url, r] of results) {
  const refs = urlMap.get(url);
  const entry = { url, ...r, refs };
  if (r.isImage) critical.push({ ...entry, problem: 'redirects_to_image' });
  else if (!r.ok && r.status === 404) critical.push({ ...entry, problem: 'not_found' });
  else if (!r.ok && r.status === 410) critical.push({ ...entry, problem: 'gone' });
  else if (!r.ok && r.status >= 500) critical.push({ ...entry, problem: 'server_error' });
  else if (!r.ok && r.status === 403) blocked.push({ ...entry, problem: 'blocked_403' });
  else if (!r.ok && r.status > 0) critical.push({ ...entry, problem: `http_${r.status}` });
  else if (
    r.ok &&
    !r.isHtml &&
    !r.isPdf &&
    r.ct &&
    !r.ct.includes('octet-stream') &&
    !r.ct.includes('json')
  ) {
    suspicious.push({ ...entry, problem: 'unexpected_content_type' });
  }
}

const orgIds = new Set(data.organizations.map((o) => o.id));
const now = new Date();
for (const o of data.opportunities) {
  if (o.organization_id && !orgIds.has(o.organization_id)) {
    metadata.push({ id: o.id, title: o.title, issue: 'missing_org', detail: o.organization_id });
  }
  if (o.deadline_at && new Date(o.deadline_at) < now && o.is_active && o.application_status !== 'closed') {
    metadata.push({
      id: o.id,
      title: o.title,
      issue: 'past_deadline_still_open',
      detail: o.deadline_at,
    });
  }
  if (o.application_status === 'closed' && o.is_active && o.deadline_at && new Date(o.deadline_at) > now) {
    metadata.push({
      id: o.id,
      title: o.title,
      issue: 'closed_but_future_deadline',
      detail: o.deadline_at,
    });
  }
  if (!o.official_application_url || !o.source_url) {
    metadata.push({ id: o.id, title: o.title, issue: 'missing_url' });
  }
}

const out = {
  scannedAt: new Date().toISOString(),
  uniqueUrls: urls.length,
  criticalCount: critical.length,
  blockedCount: blocked.length,
  suspiciousCount: suspicious.length,
  metadataCount: metadata.length,
  critical,
  blocked: blocked.map((b) => ({ url: b.url, status: b.status, refs: b.refs.map((r) => r.id) })),
  suspicious,
  metadata,
};

const reportPath = path.join(__dirname, '../data/link-audit-report.json');
fs.writeFileSync(reportPath, JSON.stringify(out, null, 2));
console.log(
  JSON.stringify(
    {
      uniqueUrls: urls.length,
      criticalCount: critical.length,
      blockedCount: blocked.length,
      suspiciousCount: suspicious.length,
      metadataCount: metadata.length,
      critical: critical.map((c) => ({
        problem: c.problem,
        url: c.url,
        finalUrl: c.finalUrl,
        ct: c.ct,
        status: c.status,
        ids: c.refs.map((r) => r.id),
      })),
      suspicious: suspicious.slice(0, 20),
      metadata,
    },
    null,
    2
  )
);
