'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

import { submitOpportunitySchema, type SubmitOpportunityInput } from '@/lib/schemas';
import { OPPORTUNITY_CATEGORIES, WAKE_COUNTY_CITIES, REMOTE_TYPE_OPTIONS, PAID_TYPE_OPTIONS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';

function optionalIntInput(v: unknown): number | undefined {
  if (v === '' || v == null) return undefined;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : undefined;
}

export default function SubmitPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showOtherCity, setShowOtherCity] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SubmitOpportunityInput>({
    resolver: zodResolver(submitOpportunitySchema),
    defaultValues: {
      remote_type: 'in_person',
      paid_type: 'unpaid',
      is_free: true,
    },
  });

  const shortSummary = watch('short_summary') ?? '';
  const fullDescription = watch('full_description') ?? '';
  const paidType = watch('paid_type');
  const isFree = watch('is_free');

  async function onSubmit(data: SubmitOpportunityInput) {
    setSubmitError(null);
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Submission failed');
      }
      setSubmitted(true);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      );
    }
  }

  return (
    <>
      <title>Submit an Opportunity - Wake Pathways</title>
      <div className="mx-auto min-w-0 max-w-2xl px-3 py-10 sm:px-6 sm:py-12 lg:px-8">
        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="flex flex-col items-center gap-6 py-20 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.15, type: 'spring', stiffness: 200, damping: 12 }}
              >
                <CheckCircle2 className="h-20 w-20 text-success" />
              </motion.div>
              <h1 className="text-3xl font-bold text-foreground">Thank you!</h1>
              <p className="max-w-md text-lg text-muted-foreground">
                Your submission is under review. We&rsquo;ll verify it and publish it once
                approved. This usually takes 1-2 business days.
              </p>
              <Link href="/">
                <Button variant="outline" size="lg">Back to Home</Button>
              </Link>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              <div className="mb-10">
                <h1 className="text-2xl font-bold tracking-tight text-foreground text-balance sm:text-3xl md:text-4xl">
                  Submit an Opportunity
                </h1>
                <p className="mt-3 text-pretty text-base text-muted-foreground sm:text-lg">
                  Help Wake County teens discover programs in your community.
                  Submissions are reviewed before publishing.
                </p>
                <p className="mt-3 text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
                  Anyone with a real opportunity can submit: organizations, schools, counselors,
                  parents, community members, and students who know a program worth listing.
                </p>
              </div>

              {submitError && (
                <div className="mb-6 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {submitError}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
                {/* Section: Your Information */}
                <FormSection title="Your Information" description="So we can reach you if we have questions.">
                  <FieldGroup>
                    <Field
                      label="Organization Name"
                      error={errors.organization_name?.message}
                      required
                      hint="School, nonprofit, employer, or Independent if you are submitting as a community member."
                    >
                      <Input
                        {...register('organization_name')}
                        placeholder="e.g. Triangle Youth Corps"
                        error={!!errors.organization_name}
                      />
                    </Field>
                    <Field label="Your Name" error={errors.contact_name?.message} required>
                      <Input
                        {...register('contact_name')}
                        placeholder="Your full name"
                        error={!!errors.contact_name}
                      />
                    </Field>
                    <Field label="Email Address" error={errors.contact_email?.message} required>
                      <Input
                        {...register('contact_email')}
                        type="email"
                        placeholder="you@example.com"
                        error={!!errors.contact_email}
                      />
                    </Field>
                  </FieldGroup>
                </FormSection>

                {/* Section: Opportunity Details */}
                <FormSection title="Opportunity Details" description="Tell us about the opportunity.">
                  <FieldGroup>
                    <Field label="Title" error={errors.opportunity_title?.message} required>
                      <Input
                        {...register('opportunity_title')}
                        placeholder="e.g. Summer STEM Internship 2026"
                        error={!!errors.opportunity_title}
                      />
                    </Field>
                    <Field label="Opportunity type" error={errors.category?.message} required>
                      <Select
                        {...register('category')}
                        placeholder="Select a type"
                        error={!!errors.category}
                      >
                        {OPPORTUNITY_CATEGORIES.map((c) => (
                          <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                      </Select>
                    </Field>
                    <Field
                      label="Short Summary"
                      error={errors.short_summary?.message}
                      required
                      hint={`${shortSummary.length}/300 characters`}
                    >
                      <Textarea
                        {...register('short_summary')}
                        placeholder="A brief description teens will see in search results (20-300 chars)"
                        rows={3}
                        error={!!errors.short_summary}
                      />
                    </Field>
                    <Field
                      label="Full Description"
                      error={errors.full_description?.message}
                      hint={`${fullDescription.length}/5000 · Optional but helpful: what participants do, time commitment, and who it is for.`}
                    >
                      <Textarea
                        {...register('full_description')}
                        placeholder="More details about the opportunity, what participants will do, etc."
                        rows={5}
                        error={!!errors.full_description}
                      />
                    </Field>
                  </FieldGroup>
                </FormSection>

                {/* Section: Eligibility */}
                <FormSection title="Eligibility" description="Who can apply?">
                  <FieldGroup>
                    <Field label="Eligibility Requirements" error={errors.eligibility?.message}>
                      <Textarea
                        {...register('eligibility')}
                        placeholder="e.g. Must be a Wake County resident, ages 14-18, with a GPA of 2.5+"
                        rows={3}
                        error={!!errors.eligibility}
                      />
                    </Field>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field label="Min Grade" error={errors.grades_min?.message}>
                        <Select
                          {...register('grades_min', { setValueAs: optionalIntInput })}
                          error={!!errors.grades_min}
                        >
                          <option value="">Any</option>
                          {Array.from({ length: 7 }, (_, i) => i + 6).map((g) => (
                            <option key={g} value={g}>{g}th Grade</option>
                          ))}
                        </Select>
                      </Field>
                      <Field label="Max Grade" error={errors.grades_max?.message}>
                        <Select
                          {...register('grades_max', { setValueAs: optionalIntInput })}
                          error={!!errors.grades_max}
                        >
                          <option value="">Any</option>
                          {Array.from({ length: 7 }, (_, i) => i + 6).map((g) => (
                            <option key={g} value={g}>{g}th Grade</option>
                          ))}
                        </Select>
                      </Field>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field label="Min Age" error={errors.age_min?.message}>
                        <Input
                          {...register('age_min', { setValueAs: optionalIntInput })}
                          type="number"
                          min={10}
                          max={22}
                          placeholder="e.g. 14"
                          error={!!errors.age_min}
                        />
                      </Field>
                      <Field label="Max Age" error={errors.age_max?.message}>
                        <Input
                          {...register('age_max', { setValueAs: optionalIntInput })}
                          type="number"
                          min={10}
                          max={22}
                          placeholder="e.g. 18"
                          error={!!errors.age_max}
                        />
                      </Field>
                    </div>
                  </FieldGroup>
                </FormSection>

                {/* Section: Location & Format */}
                <FormSection title="Location & Format" description="Where does this take place?">
                  <FieldGroup>
                    <Field label="City" error={errors.location_city?.message}>
                      <Select
                        {...register('location_city')}
                        onChange={(e) => {
                          register('location_city').onChange(e);
                          setShowOtherCity(e.target.value === '__other__');
                        }}
                        error={!!errors.location_city}
                      >
                        <option value="">Select a city</option>
                        {WAKE_COUNTY_CITIES.map((city) => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                        <option value="__other__">Other</option>
                      </Select>
                    </Field>
                    {showOtherCity && (
                      <Field label="Other City">
                        <Input
                          {...register('location_city')}
                          placeholder="Enter city name"
                        />
                      </Field>
                    )}
                    <Field label="Format" error={errors.remote_type?.message}>
                      <Select {...register('remote_type')} error={!!errors.remote_type}>
                        {REMOTE_TYPE_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </Select>
                    </Field>
                  </FieldGroup>
                </FormSection>

                {/* Section: Compensation */}
                <FormSection title="Compensation" description="Is there pay or a cost to participate?">
                  <FieldGroup>
                    <Field label="Compensation Type" error={errors.paid_type?.message}>
                      <Select {...register('paid_type')} error={!!errors.paid_type}>
                        {PAID_TYPE_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </Select>
                    </Field>
                    {(paidType === 'paid' || paidType === 'stipend') && (
                      <Field label="Compensation Details" error={errors.compensation_text?.message}>
                        <Input
                          {...register('compensation_text')}
                          placeholder="e.g. $15/hour, $1,000 stipend"
                          error={!!errors.compensation_text}
                        />
                      </Field>
                    )}
                    <Checkbox
                      {...register('is_free')}
                      label="Free to participate (no cost to the student)"
                    />
                    {!isFree && (
                      <Field label="Cost to Participate" error={errors.cost_text?.message}>
                        <Input
                          {...register('cost_text')}
                          placeholder="e.g. $50 registration fee; financial aid available"
                          error={!!errors.cost_text}
                        />
                      </Field>
                    )}
                  </FieldGroup>
                </FormSection>

                {/* Section: Deadline & Links */}
                <FormSection title="Deadline & Links" description="When and where can they apply?">
                  <FieldGroup>
                    <Field label="Application Deadline" error={errors.deadline_at?.message}>
                      <Input
                        {...register('deadline_at')}
                        type="date"
                        error={!!errors.deadline_at}
                      />
                    </Field>
                    <Field label="Official Application URL" error={errors.official_application_url?.message}>
                      <Input
                        {...register('official_application_url')}
                        type="url"
                        placeholder="https://..."
                        error={!!errors.official_application_url}
                      />
                    </Field>
                    <Field
                      label="Supporting Link (optional)"
                      error={errors.supporting_url?.message}
                      hint="Flyer, news post, or extra page that helps us verify the listing."
                    >
                      <Input
                        {...register('supporting_url')}
                        type="url"
                        placeholder="https://..."
                        error={!!errors.supporting_url}
                      />
                    </Field>
                  </FieldGroup>
                </FormSection>

                {/* Section: Additional */}
                <FormSection title="Additional" description="Anything else we should know?">
                  <FieldGroup>
                    <Field label="Verification Notes" error={errors.verification_notes?.message}>
                      <Textarea
                        {...register('verification_notes')}
                        placeholder="Anything that helps us verify this is legitimate (e.g. org website, news article, etc.)"
                        rows={3}
                        error={!!errors.verification_notes}
                      />
                    </Field>
                  </FieldGroup>
                </FormSection>

                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="py-4">
                    <p className="text-sm text-muted-foreground">
                      By submitting, you confirm this information is accurate to the best of your
                      knowledge. All submissions are reviewed before publication.
                    </p>
                  </CardContent>
                </Card>

                <Button type="submit" size="lg" loading={isSubmitting} className="w-full">
                  <Send className="h-4 w-4" />
                  Submit for Review
                </Button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-foreground sm:text-xl">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Card>
        <CardContent className="pt-6">{children}</CardContent>
      </Card>
    </section>
  );
}

function FieldGroup({ children }: { children: React.ReactNode }) {
  return <div className="space-y-5">{children}</div>;
}

function Field({
  label,
  error,
  hint,
  required,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-2">
        <label className="text-sm font-medium text-foreground">
          {label}
          {required && <span className="ml-0.5 text-destructive">*</span>}
        </label>
        {hint && (
          <span className="text-xs text-muted-foreground">{hint}</span>
        )}
      </div>
      {children}
      {error && (
        <p className="flex items-center gap-1 text-xs text-destructive">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
}
