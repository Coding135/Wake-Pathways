'use client';

import { useCallback, useEffect, useId, useState } from 'react';
import { Loader2, MessageSquareText } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
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
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

type Props = {
  className?: string;
};

export function SiteFeedbackDialog({ className }: Props) {
  const { user } = useAuth();
  const formId = useId();
  const hpId = `${formId}-hp`;
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const reset = useCallback(() => {
    setMessage('');
    setContactEmail('');
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

  useEffect(() => {
    if (!open || !user?.email) return;
    setContactEmail((prev) => (prev.trim() ? prev : user.email ?? ''));
  }, [open, user?.email]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          message,
          contact_email: contactEmail,
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
          'inline-flex min-h-10 items-center gap-1.5 rounded-md px-1 py-0.5 text-sm font-medium text-primary underline decoration-primary/50 underline-offset-[3px] transition-colors hover:text-primary hover:decoration-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background touch-manipulation sm:min-h-0',
          className
        )}
      >
        <MessageSquareText className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
        Send a quick note
      </button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        {!done ? (
          <>
            <DialogHeader>
              <DialogTitle>Send feedback</DialogTitle>
              <DialogDescription>
                Share comments, suggestions, or concerns about Wake Pathways. We read every message.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={onSubmit}>
              <DialogContent>
                {!user && (
                  <p className="mb-1 text-xs text-muted-foreground">
                    You do not need an account. Add your email if you would like a reply.
                  </p>
                )}

                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor={`${formId}-msg`}
                      className="mb-1.5 block text-sm font-medium text-foreground"
                    >
                      Your message
                    </label>
                    <Textarea
                      id={`${formId}-msg`}
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="What would you like us to know?"
                      rows={5}
                      maxLength={4000}
                      className="resize-y min-h-[120px]"
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      {message.trim().length}/4000 · at least 15 characters
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor={`${formId}-email`}
                      className="mb-1.5 block text-sm font-medium text-foreground"
                    >
                      Email for reply{' '}
                      <span className="font-normal text-muted-foreground">(optional)</span>
                    </label>
                    <Input
                      id={`${formId}-email`}
                      type="email"
                      autoComplete="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
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
                  <p
                    className="mt-3 max-h-40 overflow-y-auto text-sm text-destructive"
                    role="alert"
                  >
                    {error}
                  </p>
                )}
              </DialogContent>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading || message.trim().length < 15}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending
                    </>
                  ) : (
                    'Send message'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Thank you</DialogTitle>
              <DialogDescription>Your message was sent.</DialogDescription>
            </DialogHeader>
            <DialogContent>
              <p className="text-sm text-foreground">
                We appreciate you taking the time to help improve Wake Pathways.
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
