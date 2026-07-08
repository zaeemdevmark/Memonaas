// Sanitize user-supplied text at write-time.
// React escapes JSX content automatically, but sanitizing before storage
// ensures safety in emails, PDFs, admin exports, and future rendering contexts.

/** Remove all HTML/XML tags from a string. */
export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, "").trim();
}

/**
 * Sanitize a user-supplied text field:
 * strips HTML, trims whitespace, enforces max length.
 * Returns null if the result is empty.
 */
export function sanitizeText(
  input: string | null | undefined,
  maxLength: number,
): string | null {
  if (input == null) return null;
  const cleaned = stripHtml(String(input)).substring(0, maxLength);
  return cleaned || null;
}
