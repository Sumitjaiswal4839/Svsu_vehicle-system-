/**
 * Sanitizes a string input by trimming whitespace, removing HTML tags,
 * and limiting length to 500 characters.
 */
import DOMPurify from 'isomorphic-dompurify';

export function sanitizeString(input: string): string {
  return DOMPurify.sanitize(input.trim()).slice(0, 500);
}
