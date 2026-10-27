/**
 * Tiny className combiner. Filters falsy values and joins the rest with spaces.
 * Avoids pulling in a dependency for a one-liner.
 */
export type ClassValue = string | false | null | undefined;

export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(" ");
}
