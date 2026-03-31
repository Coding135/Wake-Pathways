#!/usr/bin/env npx tsx

/**
 * CSV import script for Wake Youth Hub opportunity data.
 *
 * Usage:
 *   npx tsx scripts/import-csv.ts <file.csv>
 *
 * Expected CSV columns (first row = header):
 *   title, organization_name, category, short_summary, full_description,
 *   eligibility, grades_min, grades_max, age_min, age_max, location_city,
 *   location_county, remote_type, paid_type, compensation_text, cost_text,
 *   is_free, deadline_type, deadline_at, official_application_url, source_url,
 *   tags
 *
 * In demo mode (default): parses and validates without inserting.
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// ---------------------------------------------------------------------------
// Types & Constants
// ---------------------------------------------------------------------------

const VALID_CATEGORIES = [
  'internship', 'volunteer', 'scholarship', 'summer_program',
  'competition', 'leadership', 'job', 'mentorship', 'other',
] as const;

const VALID_REMOTE_TYPES = ['in_person', 'remote', 'hybrid'] as const;
const VALID_PAID_TYPES = ['paid', 'unpaid', 'stipend', 'varies'] as const;
const VALID_DEADLINE_TYPES = ['fixed', 'rolling', 'none'] as const;

const EXPECTED_HEADERS = [
  'title', 'organization_name', 'category', 'short_summary', 'full_description',
  'eligibility', 'grades_min', 'grades_max', 'age_min', 'age_max', 'location_city',
  'location_county', 'remote_type', 'paid_type', 'compensation_text', 'cost_text',
  'is_free', 'deadline_type', 'deadline_at', 'official_application_url', 'source_url',
  'tags',
] as const;

interface ParsedRow {
  rowNumber: number;
  data: Record<string, string>;
}

interface ValidationResult {
  row: ParsedRow;
  errors: string[];
  warnings: string[];
}

// ---------------------------------------------------------------------------
// CSV Parsing (handles quoted fields with commas)
// ---------------------------------------------------------------------------

function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        fields.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
  }

  fields.push(current.trim());
  return fields;
}

function parseCSV(content: string): { headers: string[]; rows: ParsedRow[] } {
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);

  if (lines.length === 0) {
    throw new Error('CSV file is empty');
  }

  const headers = parseCSVLine(lines[0]).map((h) => h.toLowerCase().trim());
  const rows: ParsedRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const fields = parseCSVLine(lines[i]);
    const data: Record<string, string> = {};

    for (let j = 0; j < headers.length; j++) {
      data[headers[j]] = fields[j] ?? '';
    }

    rows.push({ rowNumber: i + 1, data });
  }

  return { headers, rows };
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function validateRow(row: ParsedRow): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const d = row.data;

  // Required fields
  if (!d.title?.trim()) {
    errors.push('title is required');
  } else if (d.title.trim().length < 5) {
    errors.push('title must be at least 5 characters');
  }

  if (!d.organization_name?.trim()) {
    errors.push('organization_name is required');
  }

  if (!d.category?.trim()) {
    errors.push('category is required');
  } else if (!VALID_CATEGORIES.includes(d.category.trim() as typeof VALID_CATEGORIES[number])) {
    errors.push(`category "${d.category}" is not valid. Must be one of: ${VALID_CATEGORIES.join(', ')}`);
  }

  if (!d.short_summary?.trim()) {
    warnings.push('short_summary is empty');
  } else if (d.short_summary.trim().length < 20) {
    warnings.push('short_summary is shorter than 20 characters');
  }

  // Enum validation
  if (d.remote_type?.trim() && !VALID_REMOTE_TYPES.includes(d.remote_type.trim() as typeof VALID_REMOTE_TYPES[number])) {
    errors.push(`remote_type "${d.remote_type}" must be one of: ${VALID_REMOTE_TYPES.join(', ')}`);
  }

  if (d.paid_type?.trim() && !VALID_PAID_TYPES.includes(d.paid_type.trim() as typeof VALID_PAID_TYPES[number])) {
    errors.push(`paid_type "${d.paid_type}" must be one of: ${VALID_PAID_TYPES.join(', ')}`);
  }

  if (d.deadline_type?.trim() && !VALID_DEADLINE_TYPES.includes(d.deadline_type.trim() as typeof VALID_DEADLINE_TYPES[number])) {
    errors.push(`deadline_type "${d.deadline_type}" must be one of: ${VALID_DEADLINE_TYPES.join(', ')}`);
  }

  // Numeric fields
  for (const field of ['grades_min', 'grades_max', 'age_min', 'age_max'] as const) {
    const val = d[field]?.trim();
    if (val && val.length > 0) {
      const num = Number(val);
      if (isNaN(num) || !Number.isInteger(num)) {
        errors.push(`${field} must be an integer`);
      } else if (field.startsWith('grades_') && (num < 6 || num > 12)) {
        errors.push(`${field} must be between 6 and 12`);
      } else if (field.startsWith('age_') && (num < 10 || num > 22)) {
        errors.push(`${field} must be between 10 and 22`);
      }
    }
  }

  // URL validation
  for (const field of ['official_application_url', 'source_url'] as const) {
    const val = d[field]?.trim();
    if (val && val.length > 0) {
      try {
        new URL(val);
      } catch {
        errors.push(`${field} is not a valid URL: "${val}"`);
      }
    }
  }

  // Boolean field
  if (d.is_free?.trim() && !['true', 'false', '1', '0', 'yes', 'no'].includes(d.is_free.trim().toLowerCase())) {
    warnings.push(`is_free value "${d.is_free}" is ambiguous - expected true/false`);
  }

  // Deadline sanity check
  if (d.deadline_at?.trim()) {
    const parsed = new Date(d.deadline_at.trim());
    if (isNaN(parsed.getTime())) {
      errors.push(`deadline_at is not a valid date: "${d.deadline_at}"`);
    } else if (parsed < new Date()) {
      warnings.push('deadline_at is in the past');
    }
  }

  return { row, errors, warnings };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║            Wake Youth Hub - CSV Import Tool                 ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');

  const filePath = process.argv[2];

  if (!filePath) {
    console.log('  Usage: npx tsx scripts/import-csv.ts <file.csv>\n');
    console.log('  Expected CSV headers:');
    console.log(`  ${EXPECTED_HEADERS.join(', ')}\n`);
    console.log('  Sample row:');
    console.log('  "Summer STEM Camp","NC State University","summer_program",');
    console.log('  "Week-long STEM camp for rising 9th graders","Full description...",');
    console.log('  "Grades 9-12",9,12,14,18,"Raleigh","Wake","in_person","unpaid",');
    console.log('  "","$350/week",false,"fixed","2026-05-01","https://example.com",');
    console.log('  "https://example.com","stem,summer,science"\n');
    process.exit(1);
  }

  const absolutePath = resolve(filePath);

  let content: string;
  try {
    content = readFileSync(absolutePath, 'utf-8');
  } catch (err) {
    console.error(`  ✗ Could not read file: ${absolutePath}`);
    console.error(`    ${err instanceof Error ? err.message : err}`);
    process.exit(1);
  }

  console.log(`  File:  ${absolutePath}`);
  console.log(`  Mode:  DEMO (parse & validate only - no database inserts)\n`);

  // Parse
  let headers: string[];
  let rows: ParsedRow[];
  try {
    const parsed = parseCSV(content);
    headers = parsed.headers;
    rows = parsed.rows;
  } catch (err) {
    console.error(`  ✗ CSV parse error: ${err instanceof Error ? err.message : err}`);
    process.exit(1);
  }

  console.log(`  Headers found: ${headers.join(', ')}`);
  console.log(`  Data rows:     ${rows.length}\n`);

  // Check for missing expected headers
  const missingHeaders = EXPECTED_HEADERS.filter((h) => !headers.includes(h));
  if (missingHeaders.length > 0) {
    console.log(`  ⚠ Missing expected headers: ${missingHeaders.join(', ')}`);
    console.log('    (These columns will be empty for all rows)\n');
  }

  // Validate each row
  const results = rows.map(validateRow);
  const valid = results.filter((r) => r.errors.length === 0);
  const invalid = results.filter((r) => r.errors.length > 0);
  const withWarnings = results.filter((r) => r.warnings.length > 0);

  // Print errors & warnings
  if (invalid.length > 0) {
    console.log('─── Validation Errors ────────────────────────────────────────\n');
    for (const r of invalid) {
      const title = r.row.data.title || '(no title)';
      console.log(`  Row ${r.row.rowNumber}: "${title}"`);
      for (const e of r.errors) {
        console.log(`    ✗ ${e}`);
      }
      for (const w of r.warnings) {
        console.log(`    ⚠ ${w}`);
      }
      console.log('');
    }
  }

  if (withWarnings.length > 0) {
    const warningsOnly = withWarnings.filter((r) => r.errors.length === 0);
    if (warningsOnly.length > 0) {
      console.log('─── Warnings ─────────────────────────────────────────────────\n');
      for (const r of warningsOnly) {
        const title = r.row.data.title || '(no title)';
        console.log(`  Row ${r.row.rowNumber}: "${title}"`);
        for (const w of r.warnings) {
          console.log(`    ⚠ ${w}`);
        }
        console.log('');
      }
    }
  }

  // Print valid rows preview
  if (valid.length > 0) {
    console.log('─── Valid Rows Preview ───────────────────────────────────────\n');
    for (const r of valid.slice(0, 5)) {
      const d = r.row.data;
      console.log(`  Row ${r.row.rowNumber}: "${d.title}"`);
      console.log(`    Category: ${d.category}  |  City: ${d.location_city || '(none)'}  |  Deadline: ${d.deadline_at || 'none'}`);
    }
    if (valid.length > 5) {
      console.log(`  ... and ${valid.length - 5} more valid rows`);
    }
    console.log('');
  }

  // Summary
  console.log('─── Summary ──────────────────────────────────────────────────\n');
  console.log(`  Total rows:     ${rows.length}`);
  console.log(`  Valid:          ${valid.length}`);
  console.log(`  Invalid:        ${invalid.length}`);
  console.log(`  With warnings:  ${withWarnings.length}`);
  console.log('');

  if (valid.length > 0 && invalid.length === 0) {
    console.log('  ✓ All rows are valid and ready for import.\n');
  } else if (valid.length > 0) {
    console.log(`  ⚠ ${valid.length} rows are ready for import; ${invalid.length} rows have errors.\n`);
  } else {
    console.log('  ✗ No valid rows found. Fix errors above and retry.\n');
    process.exit(1);
  }
}

main();
