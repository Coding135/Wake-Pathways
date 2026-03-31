/**
 * Real admin destinations in the app (tabs on /admin plus /admin/reviews).
 * Do not add routes that do not exist.
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
] as const;
