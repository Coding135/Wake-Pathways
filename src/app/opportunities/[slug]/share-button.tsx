'use client';

import { Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ShareButton({ title }: { title: string }) {
  function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title, url });
    } else {
      navigator.clipboard.writeText(url);
    }
  }

  return (
    <Button variant="outline" size="lg" className="gap-2" onClick={handleShare}>
      <Share2 className="h-4 w-4" />
      Share
    </Button>
  );
}
