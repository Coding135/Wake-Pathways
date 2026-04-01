/**
 * Maps Supabase PostgREST / Postgres errors from issue-report storage into safe user-facing text.
 */
export function userFacingIssueReportStorageError(err: {
  message?: string;
  code?: string;
  details?: string | null;
  hint?: string | null;
}): string {
  const message = (err.message ?? '').toLowerCase();
  const code = err.code ?? '';
  const details = (err.details ?? '').toLowerCase();
  const combined = `${message} ${details}`;

  if (
    combined.includes('does not exist') ||
    combined.includes('schema cache') ||
    combined.includes('could not find the table') ||
    code === '42P01' ||
    code === 'PGRST205' ||
    code === 'PGRST202'
  ) {
    return process.env.NODE_ENV === 'development'
      ? 'Reports storage is not set up: run supabase/migrations/004_opportunity_issue_reports.sql on your Supabase project, then reload the schema if the dashboard asks for it.'
      : 'We could not save your report because this site is missing a database update. Please try again later or contact the team.';
  }

  if (
    combined.includes('permission denied') ||
    combined.includes('row-level security') ||
    code === '42501'
  ) {
    return 'We could not save your report due to a server permission problem. Confirm SUPABASE_SERVICE_ROLE_KEY is set for this deployment and that migration 004 has been applied.';
  }

  if (combined.includes('foreign key') || code === '23503') {
    return 'We could not link this report to your account. Try signing out and submitting again, or leave your email in the optional field.';
  }

  if (combined.includes('invalid input') && combined.includes('enum')) {
    return 'Something in the form did not match what the server expected. Refresh the page and try again.';
  }

  return process.env.NODE_ENV === 'development'
    ? `Report could not be saved (${code || 'unknown'}). Check the server log for details.`
    : 'Could not send your report. Please try again later.';
}
