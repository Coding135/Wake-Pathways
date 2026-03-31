'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Search, Filter, X, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import {
  OPPORTUNITY_CATEGORIES,
  WAKE_COUNTY_CITIES,
  GRADE_OPTIONS,
  REMOTE_TYPE_OPTIONS,
  PAID_TYPE_OPTIONS,
  APPLICATION_STATUS_OPTIONS,
  SORT_OPTIONS,
} from '@/lib/constants';
import {
  OPPORTUNITY_INTEREST_OPTIONS,
  OPPORTUNITY_INTEREST_LABEL,
  type OpportunityInterestId,
} from '@/lib/opportunity-interests';

const FILTER_KEYS = [
  'search',
  'category',
  'city',
  'grade',
  'remote_type',
  'paid_type',
  'application_status',
  'verified_only',
  'is_free',
] as const;

function parseInterestSelection(raw: string): OpportunityInterestId[] {
  if (!raw.trim()) return [];
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter((s): s is OpportunityInterestId =>
      OPPORTUNITY_INTEREST_OPTIONS.some((o) => o.id === s)
    );
}

function serializeInterests(ids: OpportunityInterestId[]): string {
  return [...ids].sort().join(',');
}

export function OpportunityFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [interestsOpen, setInterestsOpen] = useState(false);

  const currentValues = useMemo(
    () => ({
      search: searchParams.get('search') ?? '',
      category: searchParams.get('category') ?? '',
      city: searchParams.get('city') ?? '',
      grade: searchParams.get('grade') ?? '',
      remote_type: searchParams.get('remote_type') ?? '',
      paid_type: searchParams.get('paid_type') ?? '',
      application_status: searchParams.get('application_status') ?? '',
      verified_only: searchParams.get('verified_only') === 'true',
      is_free: searchParams.get('is_free') === 'true',
      interests: searchParams.get('interests') ?? '',
      sort: searchParams.get('sort') ?? '',
    }),
    [searchParams]
  );

  const selectedInterestIds = useMemo(
    () => parseInterestSelection(currentValues.interests),
    [currentValues.interests]
  );

  const activeFilterCount = useMemo(() => {
    const core = FILTER_KEYS.filter((key) => {
      const val = currentValues[key];
      return typeof val === 'boolean' ? val : val !== '';
    }).length;
    return core + selectedInterestIds.length;
  }, [currentValues, selectedInterestIds]);

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === '' || value === 'false') {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      params.delete('page');
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  function clearAll() {
    router.push(pathname, { scroll: false });
  }

  const toggleInterest = useCallback(
    (id: OpportunityInterestId) => {
      const next = new Set(selectedInterestIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      const serialized = serializeInterests([...next]);
      updateParams({ interests: serialized });
    },
    [selectedInterestIds, updateParams]
  );

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleSearch(value: string) {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      updateParams({ search: value });
    }, 350);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            key={searchParams.toString()}
            placeholder="Search opportunities..."
            defaultValue={currentValues.search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
            aria-label="Search opportunities"
          />
        </div>

        <Button
          variant="outline"
          className="gap-2 lg:hidden shrink-0"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-expanded={mobileOpen}
          aria-controls="filter-panel"
        >
          <Filter className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge
              variant="default"
              className="ml-1 h-5 min-w-5 justify-center rounded-full px-1.5 text-[11px]"
            >
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </div>

      <div
        id="filter-panel"
        className={cn(
          'grid gap-3 overflow-hidden transition-all duration-200',
          'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6',
          mobileOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 lg:max-h-none lg:opacity-100'
        )}
      >
        <Select
          value={currentValues.category}
          onChange={(e) => updateParams({ category: e.target.value })}
          aria-label="Category"
        >
          <option value="">All Categories</option>
          {OPPORTUNITY_CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </Select>

        <Select
          value={currentValues.city}
          onChange={(e) => updateParams({ city: e.target.value })}
          aria-label="City"
        >
          <option value="">All Cities</option>
          {WAKE_COUNTY_CITIES.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </Select>

        <Select
          value={currentValues.grade}
          onChange={(e) => updateParams({ grade: e.target.value })}
          aria-label="Grade level"
        >
          <option value="">All Grades</option>
          {GRADE_OPTIONS.map((g) => (
            <option key={g.value} value={String(g.value)}>
              {g.label}
            </option>
          ))}
        </Select>

        <Select
          value={currentValues.remote_type}
          onChange={(e) => updateParams({ remote_type: e.target.value })}
          aria-label="Remote or in-person"
        >
          <option value="">Any Format</option>
          {REMOTE_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>

        <Select
          value={currentValues.paid_type}
          onChange={(e) => updateParams({ paid_type: e.target.value })}
          aria-label="Compensation type"
        >
          <option value="">Any Compensation</option>
          {PAID_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>

        <Select
          value={currentValues.application_status}
          onChange={(e) => updateParams({ application_status: e.target.value })}
          aria-label="Application status"
        >
          <option value="">Any Status</option>
          {APPLICATION_STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>

        <Select
          value={currentValues.sort}
          onChange={(e) => updateParams({ sort: e.target.value })}
          aria-label="Sort order"
        >
          <option value="">Sort: Newest</option>
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>

        <div className="col-span-2 sm:col-span-3 lg:col-span-2 xl:col-span-2 flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="gap-2 justify-start h-10 w-full sm:w-auto"
            onClick={() => setInterestsOpen(true)}
            aria-label="Filter by interests"
            aria-expanded={interestsOpen}
          >
            <Sparkles className="h-4 w-4 shrink-0 text-primary" />
            <span className="truncate">Interests</span>
            {selectedInterestIds.length > 0 && (
              <Badge
                variant="secondary"
                className="ml-1 h-5 min-w-5 justify-center rounded-full px-1.5 text-[11px] shrink-0"
              >
                {selectedInterestIds.length}
              </Badge>
            )}
          </Button>
        </div>

        <div className="col-span-2 sm:col-span-3 lg:col-span-2 xl:col-span-4 flex flex-wrap items-center gap-x-6 gap-y-2">
          <Checkbox
            label="Verified only"
            checked={currentValues.verified_only}
            onChange={(e) =>
              updateParams({ verified_only: String((e.target as HTMLInputElement).checked) })
            }
          />
          <Checkbox
            label="Free only"
            checked={currentValues.is_free}
            onChange={(e) =>
              updateParams({ is_free: String((e.target as HTMLInputElement).checked) })
            }
          />

          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="ml-auto gap-1 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
              Clear all ({activeFilterCount})
            </Button>
          )}
        </div>
      </div>

      <Dialog open={interestsOpen} onOpenChange={setInterestsOpen}>
        <DialogHeader>
          <DialogTitle>Interests</DialogTitle>
          <DialogDescription>
            Choose one or more topics. Results must match every other filter you set, and at least
            one selected interest. Matching uses each listing&apos;s verified tags and program type.
          </DialogDescription>
        </DialogHeader>
        <DialogContent className="max-h-[min(24rem,50vh)] overflow-y-auto px-0">
          <div className="grid gap-2 sm:grid-cols-2">
            {OPPORTUNITY_INTEREST_OPTIONS.map((opt) => (
              <Checkbox
                key={opt.id}
                label={opt.label}
                checked={selectedInterestIds.includes(opt.id)}
                onChange={() => toggleInterest(opt.id)}
              />
            ))}
          </div>
        </DialogContent>
        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => updateParams({ interests: '' })}
            disabled={selectedInterestIds.length === 0}
          >
            Clear interests
          </Button>
          <Button type="button" size="sm" onClick={() => setInterestsOpen(false)}>
            Done
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Active filter chips */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground mr-1">Active filters:</span>
          {currentValues.category && (
            <FilterChip
              label={
                OPPORTUNITY_CATEGORIES.find((c) => c.value === currentValues.category)?.label ||
                currentValues.category
              }
              onRemove={() => updateParams({ category: '' })}
            />
          )}
          {currentValues.city && (
            <FilterChip label={currentValues.city} onRemove={() => updateParams({ city: '' })} />
          )}
          {currentValues.grade && (
            <FilterChip
              label={
                GRADE_OPTIONS.find((g) => String(g.value) === currentValues.grade)?.label ||
                `Grade ${currentValues.grade}`
              }
              onRemove={() => updateParams({ grade: '' })}
            />
          )}
          {currentValues.remote_type && (
            <FilterChip
              label={
                REMOTE_TYPE_OPTIONS.find((o) => o.value === currentValues.remote_type)?.label ||
                currentValues.remote_type
              }
              onRemove={() => updateParams({ remote_type: '' })}
            />
          )}
          {currentValues.paid_type && (
            <FilterChip
              label={
                PAID_TYPE_OPTIONS.find((o) => o.value === currentValues.paid_type)?.label ||
                currentValues.paid_type
              }
              onRemove={() => updateParams({ paid_type: '' })}
            />
          )}
          {currentValues.application_status && (
            <FilterChip
              label={
                APPLICATION_STATUS_OPTIONS.find((o) => o.value === currentValues.application_status)
                  ?.label || currentValues.application_status
              }
              onRemove={() => updateParams({ application_status: '' })}
            />
          )}
          {selectedInterestIds.map((id) => (
            <FilterChip
              key={id}
              label={OPPORTUNITY_INTEREST_LABEL[id]}
              onRemove={() => toggleInterest(id)}
            />
          ))}
          {currentValues.verified_only && (
            <FilterChip label="Verified only" onRemove={() => updateParams({ verified_only: 'false' })} />
          )}
          {currentValues.is_free && (
            <FilterChip label="Free only" onRemove={() => updateParams({ is_free: 'false' })} />
          )}
          <button
            type="button"
            onClick={clearAll}
            className="text-xs text-muted-foreground hover:text-foreground underline transition-colors ml-1"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="opp-filter-chip inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="opp-filter-chip-remove ml-0.5 rounded-full p-0.5 transition-colors"
        aria-label={`Remove ${label} filter`}
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}
