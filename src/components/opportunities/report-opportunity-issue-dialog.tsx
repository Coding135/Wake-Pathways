'use client';

import { useCallback, useId, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import {
  OPPORTUNITY_ISSUE_TYPES,
  OPPORTUNITY_ISSUE_TYPE_LABELS,
} from '@/lib/opportunity-issue-reports/constants';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

type Props = {
  slug: string;
  className?: string;
};

export function ReportOpportunityIssueDialog({ slug, className }: Props) {
  const { user } = useAuth();
  const formId = useId();
  const hpId = `${formId}-hp`;
  const [open, setOpen] = useState(false);
  const [issueType, setIssueType] = useState('');
  const [description, setDescription] = useState('');
  const [reporterEmail, setReporterEmail] = useState('');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const reset = useCallback(() => {
    setIssueType('');
    setDescription('');
    setReporterEmail('');
    setCompany('');
    setError('');
    setDone(false);
  }, []);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setTimeout(reset, 200);
    }
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`/api/opportunities/${encodeURIComponent(slug)}/issue-reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          issue_type: issueType,
          description,
          reporter_email: reporterEmail,
          company,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Something went wrong. Try again.');
        return;
      }
      setDone(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'text-left text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline',
          className
        )}
      >
        Report an issue with this listing
      </button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        {!done ? (
          <>
            <DialogHeader>
              <DialogTitle>Report an issue</DialogTitle>
              <DialogDescription>
                Spot something outdated or incorrect? Help us keep Wake Pathways accurate.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={onSubmit}>
              <DialogContent>
                {!user && (
                  <p className="mb-1 text-xs text-muted-foreground">
                    You do not need an account. Add a short note or your email so we can follow up if
                    needed.
                  </p>
                )}

                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor={`${formId}-type`}
                      className="mb-1.5 block text-sm font-medium text-foreground"
                    >
                      What is wrong?
                    </label>
                    <Select
                      id={`${formId}-type`}
                      required
                      placeholder="Choose one"
                      value={issueType}
                      onChange={(e) => setIssueType(e.target.value)}
                    >
                      {OPPORTUNITY_ISSUE_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {OPPORTUNITY_ISSUE_TYPE_LABELS[t]}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <label
                      htmlFor={`${formId}-desc`}
                      className="mb-1.5 block text-sm font-medium text-foreground"
                    >
                      Details{' '}
                      <span className="font-normal text-muted-foreground">(optional)</span>
                    </label>
                    <Textarea
                      id={`${formId}-desc`}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="For example, the deadline changed or the link goes to the wrong page."
                      rows={3}
                      maxLength={2000}
                      className="resize-y"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`${formId}-email`}
                      className="mb-1.5 block text-sm font-medium text-foreground"
                    >
                      Email for follow-up{' '}
                      <span className="font-normal text-muted-foreground">(optional)</span>
                    </label>
                    <Input
                      id={`${formId}-email`}
                      type="email"
                      autoComplete="email"
                      value={reporterEmail}
                      onChange={(e) => setReporterEmail(e.target.value)}
                      placeholder="you@example.com"
                    />
                  </div>

                  <div className="sr-only" aria-hidden>
                    <label htmlFor={hpId}>Company</label>
                    <input
                      id={hpId}
                      name="company"
                      tabIndex={-1}
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                    />
                  </div>
                </div>

                {error && (
                  <p className="mt-3 text-sm text-destructive" role="alert">
                    {error}
                  </p>
                )}
              </DialogContent>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading || !issueType}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending
                    </>
                  ) : (
                    'Submit report'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Thanks</DialogTitle>
              <DialogDescription>Your report was sent.</DialogDescription>
            </DialogHeader>
            <DialogContent>
              <p className="text-sm text-foreground">
                We use these notes to fix listings and keep information trustworthy.
              </p>
            </DialogContent>
            <DialogFooter>
              <Button type="button" onClick={() => handleOpenChange(false)}>
                Close
              </Button>
            </DialogFooter>
          </>
        )}
      </Dialog>
    </>
  );
}
