/**
 * Safe Object helper functions to prevent null/undefined errors
 */

/**
 * Safe version of Object.values that handles null/undefined objects
 * @param obj - Object to get values from
 * @returns Array of values or empty array if object is null/undefined
 */
export const safeObjectValues = <T>(obj: Record<string, T> | null | undefined): T[] => {
  if (!obj || typeof obj !== 'object') return [];
  return Object.values(obj);
};

/**
 * Safe version of Object.keys that handles null/undefined objects
 * @param obj - Object to get keys from
 * @returns Array of keys or empty array if object is null/undefined
 */
export const safeObjectKeys = (obj: Record<string, any> | null | undefined): string[] => {
  if (!obj || typeof obj !== 'object') return [];
  return Object.keys(obj);
};

/**
 * Safe version of Object.entries that handles null/undefined objects
 * @param obj - Object to get entries from
 * @returns Array of [key, value] pairs or empty array if object is null/undefined
 */
export const safeObjectEntries = <T>(obj: Record<string, T> | null | undefined): [string, T][] => {
  if (!obj || typeof obj !== 'object') return [];
  return Object.entries(obj);
};

/**
 * Calculate total from numeric object values safely
 * @param obj - Object with numeric values
 * @returns Sum of all values or 0 if object is null/undefined
 */
export const safeTotalValues = (obj: Record<string, number> | null | undefined): number => {
  return safeObjectValues(obj).reduce((sum, count) => sum + (count || 0), 0);
};