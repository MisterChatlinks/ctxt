/**
 * Creates a deep clone of the provided value, preserving its structure and content.
 * 
 * This function handles various data types including primitives, functions, Dates, 
 * RegExps, arrays, and plain objects. It ensures that nested structures are cloned 
 * recursively, avoiding shared references between the original and cloned objects.
 * 
 * @template T - The type of the value to be cloned.
 * @param value - The value to be deep cloned. Can be of any type.
 * @returns A deep clone of the provided value.
 * 
 * @example
 * ```typescript
 * const original = { a: 1, b: { c: 2 } };
 * const clone = deepClone(original);
 * console.log(clone); // { a: 1, b: { c: 2 } }
 * console.log(original === clone); // false
 * console.log(original.b === clone.b); // false
 * ```
 */
export function deepClone<T>(value: T): T {
  // Handle primitives and functions (unchanged)
  if (
    value === null ||
    typeof value !== 'object' ||
    value instanceof Function
  ) {
    return value;
  }

  // Handle Date
  if (value instanceof Date) {
    return new Date(value.getTime()) as any;
  }

  // Handle RegExp
  if (value instanceof RegExp) {
    return new RegExp(value) as any;
  }

  // Handle Array
  if (Array.isArray(value)) {
    return value.map((item) => deepClone(item)) as any;
  }

  // Handle plain objects
  const result: any = {};
  for (const key in value) {
    if (Object.prototype.hasOwnProperty.call(value, key)) {
      result[key] = deepClone((value as any)[key]);
    }
  }

  return result;
}
