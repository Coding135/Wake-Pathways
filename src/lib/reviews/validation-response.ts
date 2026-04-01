import type { ZodError } from 'zod';

export type ReviewValidationFieldErrors = Record<string, string[] | undefined>;

/**
 * JSON body for 400 responses from review POST/PATCH when Zod fails.
 * `fields` maps API field names to message arrays (Zod flatten shape).
 */
export function reviewValidationErrorBody(err: ZodError): {
  error: string;
  fields: ReviewValidationFieldErrors;
} {
  const flat = err.flatten();
  const fields = flat.fieldErrors;
  const fieldMessages = Object.values(fields).flatMap((m) => (Array.isArray(m) ? m : []));
  const formErr = flat.formErrors.filter((m): m is string => typeof m === 'string' && m.length > 0);
  const first = fieldMessages[0] ?? formErr[0];
  const error =
    fieldMessages.length > 1
      ? `${fieldMessages[0]} (${fieldMessages.length - 1} more; see below).`
      : (first ?? 'Please check your review and try again.');
  return { error, fields };
}
