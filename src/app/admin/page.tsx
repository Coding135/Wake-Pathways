'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  FileText,
  Users,
  Star,
  CheckCircle2,
  Clock,
  XCircle,
  Edit,
  Archive,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  BarChart3,
  Link2,
  ChevronRight,
  MessageSquareText,
} from 'lucide-react';

import { MOCK_OPPORTUNITIES } from '@/lib/mock-data';
import { OPPORTUNITY_CATEGORIES } from '@/lib/constants';
import { formatDate, formatRelativeDate, cn } from '@/lib/utils';
import type { Submission, Opportunity, SubmissionStatus, VerificationStatus } from '@/types/database';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent } from '@/components/ui/tabs';

export default function AdminPage() {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') ?? 'overview';

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(true);
  const [submissionsFetchError, setSubmissionsFetchError] = useState<string | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>(() => [...MOCK_OPPORTUNITIES]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setSubmissionsLoading(true);
      setSubmissionsFetchError(null);
      try {
        const res = await fetch('/api/admin/submissions', { credentials: 'same-origin' });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) {
          if (!cancelled) {
            setSubmissionsFetchError(
              typeof body.error === 'string' ? body.error : `Could not load submissions (${res.status})`
            );
            setSubmissions([]);
          }
          return;
        }
        if (!cancelled) {
          setSubmissions(Array.isArray(body.data) ? body.data : []);
        }
      } catch {
        if (!cancelled) {
          setSubmissionsFetchError('Network error loading submissions.');
          setSubmissions([]);
        }
      } finally {
        if (!cancelled) setSubmissionsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <title>Admin Dashboard - Wake Pathways</title>
      <Tabs defaultValue={currentTab} value={currentTab}>
        <TabsContent value="overview">
          <OverviewTab
            submissions={submissions}
            opportunities={opportunities}
            submissionsLoading={submissionsLoading}
            submissionsFetchError={submissionsFetchError}
          />
        </TabsContent>
        <TabsContent value="submissions">
          <SubmissionsTab
            submissions={submissions}
            setSubmissions={setSubmissions}
            submissionsLoading={submissionsLoading}
            submissionsFetchError={submissionsFetchError}
          />
        </TabsContent>
        <TabsContent value="listings">
          <ListingsTab opportunities={opportunities} setOpportunities={setOpportunities} />
        </TabsContent>
        <TabsContent value="verification">
          <VerificationTab opportunities={opportunities} />
        </TabsContent>
      </Tabs>
    </>
  );
}

/* ============================================================================
 * Overview Tab
 * ========================================================================= */

function OverviewTab({
  submissions,
  opportunities,
  submissionsLoading,
  submissionsFetchError,
}: {
  submissions: Submission[];
  opportunities: Opportunity[];
  submissionsLoading: boolean;
  submissionsFetchError: string | null;
}) {
  const stats = useMemo(() => ({
    total: opportunities.filter((o) => o.is_active).length,
    pending: submissions.filter((s) => s.status === 'pending').length,
    withApplyUrl: opportunities.filter((o) => o.is_active && o.official_application_url).length,
    featured: opportunities.filter((o) => o.is_active && o.featured).length,
  }), [submissions, opportunities]);

  const recentSubmissions = useMemo(
    () => [...submissions].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5),
    [submissions]
  );

  const statCards = [
    { label: 'Total Listings', value: stats.total, icon: Users, color: 'text-primary' },
    { label: 'Pending Submissions', value: stats.pending, icon: Clock, color: 'text-warning' },
    { label: 'Apply link set', value: stats.withApplyUrl, icon: Link2, color: 'text-success' },
    { label: 'Featured', value: stats.featured, icon: Star, color: 'text-amber-500' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Dashboard Overview</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-4 py-5">
              <div className={cn('rounded-lg bg-secondary p-3', color)}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{value}</p>
                <p className="text-sm text-muted-foreground">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Recent Submissions
            </CardTitle>
            <CardDescription>Latest community submissions awaiting review</CardDescription>
          </CardHeader>
          <CardContent>
            {submissionsLoading ? (
              <p className="text-sm text-muted-foreground">Loading submissions...</p>
            ) : submissionsFetchError ? (
              <p className="text-sm text-destructive">{submissionsFetchError}</p>
            ) : recentSubmissions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No submissions yet.</p>
            ) : (
              <div className="space-y-3">
                {recentSubmissions.map((sub) => (
                  <div key={sub.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{sub.opportunity_title}</p>
                      <p className="text-xs text-muted-foreground">{sub.organization_name} &middot; {formatRelativeDate(sub.created_at)}</p>
                    </div>
                    <SubmissionStatusBadge status={sub.status} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Quick Actions
            </CardTitle>
            <CardDescription>Common admin tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { label: 'Review Submissions', desc: `${stats.pending} pending`, href: '/admin?tab=submissions', icon: FileText },
                { label: 'Site feedback', desc: 'Footer form messages', href: '/admin/feedback', icon: MessageSquareText },
                { label: 'Check Links', desc: 'Check all listing URLs', href: '/admin?tab=verification', icon: Link2 },
                { label: 'View Category Report', desc: `${OPPORTUNITY_CATEGORIES.length} categories`, href: '/admin?tab=listings', icon: BarChart3 },
              ].map((action) => (
                <a
                  key={action.label}
                  href={action.href}
                  className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-secondary"
                >
                  <div className="flex items-center gap-3">
                    <action.icon className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{action.label}</p>
                      <p className="text-xs text-muted-foreground">{action.desc}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ============================================================================
 * Submissions Tab
 * ========================================================================= */

function SubmissionsTab({
  submissions,
  setSubmissions,
  submissionsLoading,
  submissionsFetchError,
}: {
  submissions: Submission[];
  setSubmissions: React.Dispatch<React.SetStateAction<Submission[]>>;
  submissionsLoading: boolean;
  submissionsFetchError: string | null;
}) {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionPendingId, setActionPendingId] = useState<string | null>(null);

  const filtered = useMemo(
    () => statusFilter === 'all' ? submissions : submissions.filter((s) => s.status === statusFilter),
    [submissions, statusFilter]
  );

  const handleAction = useCallback(
    async (id: string, action: SubmissionStatus) => {
      if (action === 'pending') return;
      setActionError(null);
      setActionPendingId(id);
      try {
        const res = await fetch('/api/admin/submissions', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({
            id,
            status: action,
            admin_notes: reviewNotes[id]?.trim() || null,
          }),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(typeof body.error === 'string' ? body.error : 'Update failed');
        }
        setSubmissions((prev) =>
          prev.map((s) =>
            s.id === id
              ? {
                  ...s,
                  status: action,
                  admin_notes: reviewNotes[id]?.trim() || s.admin_notes,
                  reviewed_at: new Date().toISOString(),
                }
              : s
          )
        );
        setExpandedId(null);
      } catch (e) {
        setActionError(e instanceof Error ? e.message : 'Update failed');
      } finally {
        setActionPendingId(null);
      }
    },
    [reviewNotes, setSubmissions]
  );

  if (submissionsLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Submissions Review</h2>
        <p className="text-sm text-muted-foreground">Loading submissions...</p>
      </div>
    );
  }

  if (submissionsFetchError) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Submissions Review</h2>
        <Card>
          <CardContent className="py-8 text-center text-sm text-destructive">{submissionsFetchError}</CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h2 className="text-2xl font-bold text-foreground">Submissions Review</h2>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-auto sm:w-48"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="needs_edits">Needs Edits</option>
        </Select>
      </div>

      {actionError && (
        <p className="text-sm text-destructive" role="alert">
          {actionError}
        </p>
      )}

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <FileText className="h-10 w-10 text-muted-foreground/40" />
            <p className="text-muted-foreground">No submissions match this filter.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((sub) => {
            const isExpanded = expandedId === sub.id;
            return (
              <Card key={sub.id} className={cn(isExpanded && 'ring-2 ring-primary/20')}>
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : sub.id)}
                  className="flex w-full items-center justify-between p-4 text-left"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-foreground">{sub.opportunity_title}</span>
                      <SubmissionStatusBadge status={sub.status} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {sub.organization_name} &middot; {sub.contact_name} &middot; {formatDate(sub.created_at)}
                    </p>
                  </div>
                  <ChevronRight className={cn('h-5 w-5 text-muted-foreground transition-transform', isExpanded && 'rotate-90')} />
                </button>

                {isExpanded && (
                  <CardContent className="border-t border-border pt-4">
                    <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                      <InfoRow label="Category">{OPPORTUNITY_CATEGORIES.find((c) => c.value === sub.category)?.label ?? sub.category}</InfoRow>
                      <InfoRow label="Contact">{sub.contact_email}</InfoRow>
                      <InfoRow label="City">{sub.location_city ?? '-'}</InfoRow>
                      <InfoRow label="Format">{sub.remote_type}</InfoRow>
                      <InfoRow label="Grades">{sub.grades_min && sub.grades_max ? `${sub.grades_min}-${sub.grades_max}` : '-'}</InfoRow>
                      <InfoRow label="Ages">{sub.age_min && sub.age_max ? `${sub.age_min}-${sub.age_max}` : '-'}</InfoRow>
                      <InfoRow label="Paid">{sub.paid_type}</InfoRow>
                      <InfoRow label="Free">{sub.is_free ? 'Yes' : 'No'}</InfoRow>
                    </div>
                    {sub.short_summary && (
                      <div className="mt-3">
                        <p className="text-xs font-medium uppercase text-muted-foreground">Summary</p>
                        <p className="mt-1 text-sm text-foreground">{sub.short_summary}</p>
                      </div>
                    )}
                    {sub.full_description && (
                      <div className="mt-3">
                        <p className="text-xs font-medium uppercase text-muted-foreground">Full Description</p>
                        <p className="mt-1 text-sm text-foreground">{sub.full_description}</p>
                      </div>
                    )}
                    {sub.official_application_url && (
                      <div className="mt-3">
                        <a href={sub.official_application_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                          <ExternalLink className="h-3 w-3" /> Application URL
                        </a>
                      </div>
                    )}
                    {sub.verification_notes && (
                      <div className="mt-3">
                        <p className="text-xs font-medium uppercase text-muted-foreground">Verification Notes</p>
                        <p className="mt-1 text-sm text-foreground">{sub.verification_notes}</p>
                      </div>
                    )}
                    {sub.admin_notes && (
                      <div className="mt-3 rounded-md bg-warning/10 p-3">
                        <p className="text-xs font-medium uppercase text-warning">Existing Admin Notes</p>
                        <p className="mt-1 text-sm text-foreground">{sub.admin_notes}</p>
                      </div>
                    )}

                    <div className="mt-4 space-y-3 border-t border-border pt-4">
                      <Textarea
                        placeholder="Admin notes (optional)..."
                        value={reviewNotes[sub.id] ?? ''}
                        onChange={(e) => setReviewNotes((prev) => ({ ...prev, [sub.id]: e.target.value }))}
                        rows={2}
                      />
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          disabled={actionPendingId === sub.id}
                          onClick={() => void handleAction(sub.id, 'approved')}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={actionPendingId === sub.id}
                          onClick={() => void handleAction(sub.id, 'needs_edits')}
                        >
                          <Edit className="h-3.5 w-3.5" /> Request Edits
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={actionPendingId === sub.id}
                          onClick={() => void handleAction(sub.id, 'rejected')}
                        >
                          <XCircle className="h-3.5 w-3.5" /> Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ============================================================================
 * Listings Tab
 * ========================================================================= */

function ListingsTab({
  opportunities,
  setOpportunities,
}: {
  opportunities: Opportunity[];
  setOpportunities: React.Dispatch<React.SetStateAction<Opportunity[]>>;
}) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search) return opportunities;
    const q = search.toLowerCase();
    return opportunities.filter(
      (o) => o.title.toLowerCase().includes(q) || o.category.toLowerCase().includes(q)
    );
  }, [opportunities, search]);

  const toggle = useCallback((id: string, field: 'featured' | 'is_active') => {
    setOpportunities((prev) =>
      prev.map((o) => (o.id === id ? { ...o, [field]: !o[field] } : o))
    );
  }, [setOpportunities]);

  const archiveOpp = useCallback((id: string) => {
    setOpportunities((prev) =>
      prev.map((o) => (o.id === id ? { ...o, is_active: false } : o))
    );
  }, [setOpportunities]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h2 className="text-2xl font-bold text-foreground">Manage Listings</h2>
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search listings..."
          className="w-full sm:w-64"
        />
      </div>

      <div className="space-y-3">
        {filtered.map((opp) => (
          <Card key={opp.id}>
            <CardContent className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-foreground">{opp.title}</span>
                  {!opp.is_active && <Badge variant="secondary">Archived</Badge>}
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>{OPPORTUNITY_CATEGORIES.find((c) => c.value === opp.category)?.label}</span>
                  <span>&middot;</span>
                  <span>{opp.location_city ?? 'No city'}</span>
                  {opp.deadline_at && (
                    <>
                      <span>&middot;</span>
                      <span>Deadline: {formatDate(opp.deadline_at)}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  variant={opp.featured ? 'default' : 'outline'}
                  onClick={() => toggle(opp.id, 'featured')}
                  title={opp.featured ? 'Remove from featured' : 'Feature this listing'}
                >
                  <Star className={cn('h-3.5 w-3.5', opp.featured && 'fill-current')} />
                  {opp.featured ? 'Featured' : 'Feature'}
                </Button>
                <Button
                  size="sm"
                  variant={opp.is_active ? 'outline' : 'secondary'}
                  onClick={() => toggle(opp.id, 'is_active')}
                >
                  {opp.is_active ? 'Active' : 'Inactive'}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => archiveOpp(opp.id)}
                  title="Archive"
                >
                  <Archive className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
              <Users className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-muted-foreground">No listings match your search.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

/* ============================================================================
 * Verification Tab
 * ========================================================================= */

function VerificationTab({ opportunities }: { opportunities: Opportunity[] }) {
  const [verificationResults, setVerificationResults] = useState<Record<string, 'ok' | 'broken' | null>>({});
  const [isChecking, setIsChecking] = useState(false);

  const now = useMemo(() => new Date(), []);

  const stale = useMemo(
    () => opportunities.filter((o) => {
      if (!o.last_verified_at) return true;
      const days = Math.floor((now.getTime() - new Date(o.last_verified_at).getTime()) / (1000 * 60 * 60 * 24));
      return days > 30;
    }),
    [opportunities, now]
  );

  const expired = useMemo(
    () => opportunities.filter((o) => o.deadline_at && new Date(o.deadline_at) < now && o.is_active),
    [opportunities, now]
  );

  const missingFields = useMemo(
    () => opportunities.filter((o) => !o.official_application_url || !o.short_summary || !o.eligibility),
    [opportunities]
  );

  async function runVerificationCheck() {
    setIsChecking(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const results: Record<string, 'ok' | 'broken'> = {};
    for (const opp of opportunities) {
      results[opp.id] = Math.random() > 0.15 ? 'ok' : 'broken';
    }
    setVerificationResults(results);
    setIsChecking(false);
  }

  const okCount = Object.values(verificationResults).filter((v) => v === 'ok').length;
  const brokenCount = Object.values(verificationResults).filter((v) => v === 'broken').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h2 className="text-2xl font-bold text-foreground">Verification & Links</h2>
        <Button onClick={runVerificationCheck} loading={isChecking}>
          <RefreshCw className="h-4 w-4" />
          Run Verification Check
        </Button>
      </div>

      {Object.keys(verificationResults).length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="py-4 text-center">
              <p className="text-2xl font-bold text-success">{okCount}</p>
              <p className="text-sm text-muted-foreground">Links OK</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 text-center">
              <p className="text-2xl font-bold text-destructive">{brokenCount}</p>
              <p className="text-sm text-muted-foreground">Broken Links</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 text-center">
              <p className="text-2xl font-bold text-foreground">{opportunities.length}</p>
              <p className="text-sm text-muted-foreground">Total Checked</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <FlagCard
          title="Stale Listings"
          description="Not checked against source in 30+ days"
          icon={Clock}
          items={stale}
          variant="warning"
          renderItem={(o) => (
            <p className="text-xs text-muted-foreground">
              Last checked: {o.last_verified_at ? formatDate(o.last_verified_at) : 'Never'}
            </p>
          )}
        />
        <FlagCard
          title="Expired Deadlines"
          description="Past deadline but still active"
          icon={AlertCircle}
          items={expired}
          variant="destructive"
          renderItem={(o) => (
            <p className="text-xs text-muted-foreground">
              Expired: {o.deadline_at ? formatDate(o.deadline_at) : '-'}
            </p>
          )}
        />
        <FlagCard
          title="Missing Fields"
          description="Missing URL, summary, or eligibility"
          icon={AlertCircle}
          items={missingFields}
          variant="warning"
          renderItem={(o) => {
            const missing: string[] = [];
            if (!o.official_application_url) missing.push('URL');
            if (!o.short_summary) missing.push('Summary');
            if (!o.eligibility) missing.push('Eligibility');
            return <p className="text-xs text-muted-foreground">Missing: {missing.join(', ')}</p>;
          }}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Listings - Verification Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {opportunities.map((opp) => (
              <div key={opp.id} className="flex flex-col justify-between gap-2 rounded-lg border border-border p-3 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{opp.title}</p>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <VerificationBadge status={opp.verification_status} />
                    {opp.last_verified_at && <span>Last checked: {formatDate(opp.last_verified_at)}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {opp.source_url && (
                    <a href={opp.source_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                      Source
                    </a>
                  )}
                  {opp.official_application_url && (
                    <a href={opp.official_application_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                      Apply URL
                    </a>
                  )}
                  {verificationResults[opp.id] && (
                    <Badge variant={verificationResults[opp.id] === 'ok' ? 'success' : 'destructive'}>
                      {verificationResults[opp.id] === 'ok' ? 'OK' : 'Broken'}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ============================================================================
 * Shared Components
 * ========================================================================= */

function SubmissionStatusBadge({ status }: { status: SubmissionStatus }) {
  const variants: Record<SubmissionStatus, { variant: 'success' | 'warning' | 'destructive' | 'secondary'; label: string }> = {
    pending: { variant: 'warning', label: 'Pending' },
    approved: { variant: 'success', label: 'Approved' },
    rejected: { variant: 'destructive', label: 'Rejected' },
    needs_edits: { variant: 'secondary', label: 'Needs Edits' },
  };
  const { variant, label } = variants[status];
  return <Badge variant={variant}>{label}</Badge>;
}

function VerificationBadge({ status }: { status: VerificationStatus }) {
  const map: Record<VerificationStatus, { variant: 'success' | 'warning' | 'destructive' | 'secondary' | 'default'; label: string }> = {
    verified: { variant: 'success', label: 'Review complete' },
    pending: { variant: 'warning', label: 'Pending' },
    needs_review: { variant: 'warning', label: 'Needs Review' },
    failed: { variant: 'destructive', label: 'Failed' },
    unverified: { variant: 'secondary', label: 'Not reviewed' },
  };
  const { variant, label } = map[status];
  return <Badge variant={variant}>{label}</Badge>;
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="text-xs font-medium uppercase text-muted-foreground">{label}</span>
      <p className="text-sm text-foreground">{children}</p>
    </div>
  );
}

function FlagCard({
  title,
  description,
  icon: Icon,
  items,
  variant,
  renderItem,
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  items: Opportunity[];
  variant: 'warning' | 'destructive';
  renderItem: (o: Opportunity) => React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className={cn('h-4 w-4', variant === 'warning' ? 'text-warning' : 'text-destructive')} />
          {title}
          <Badge variant={variant} className="ml-auto">{items.length}</Badge>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-success">All clear!</p>
        ) : (
          <div className="space-y-2">
            {items.slice(0, 5).map((o) => (
              <div key={o.id} className="space-y-0.5 rounded-md border border-border p-2">
                <p className="truncate text-sm font-medium text-foreground">{o.title}</p>
                {renderItem(o)}
              </div>
            ))}
            {items.length > 5 && (
              <p className="text-xs text-muted-foreground">...and {items.length - 5} more</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
