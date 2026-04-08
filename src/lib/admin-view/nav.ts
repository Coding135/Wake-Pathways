/**
 * Admin destinations (tabs on /admin plus /admin/reviews). Shown only when
 * /api/admin/access confirms the user is in REVIEW_MODERATOR_EMAILS; routes are
 * still enforced server-side in app/admin/layout.tsx.
 */
export const ADMIN_VIEW_QUICK_LINKS = [
  { href: '/admin', label: 'Admin dashboard' },
  { href: '/admin?tab=submissions', label: 'Submissions' },
  { href: '/admin?tab=listings', label: 'Listings' },
  { href: '/admin?tab=verification', label: 'Verification' },
  {
    href: '/admin/reviews',
    label: 'Review moderation',
    description: 'Approve or reject student opportunity reviews',
  },
  { href: '/admin/feedback', label: 'Site feedback', description: 'Footer form messages' },
] as const;
