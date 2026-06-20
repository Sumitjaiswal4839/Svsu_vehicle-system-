/**
 * Sanitizes a string input by trimming whitespace, removing HTML tags,
 * and limiting length to 500 characters.
 */
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/<[^>]*>/g, '')
    .slice(0, 500);
}
