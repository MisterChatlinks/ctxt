import { isObject } from "../types/isOfType";

/**
 * Recursively merges two objects, combining their properties.
 * If both the target and source have a property that is an object,
 * the function will recursively merge those objects. Otherwise,
 * the source property will overwrite the target property.
 *
 * @template T - The type of the objects being merged, constrained to `Record<string, any>`.
 * @param target - The target object to merge into. Can be a partial object of type `T`.
 * @param source - The source object to merge from. Can be a partial object of type `T`.
 * @returns A new object that is the result of merging `source` into `target`.
 */
export function deepMerge<T extends Record<any, any>, U extends Record<any, any>>(target: U, source: T) {
  const result: Partial<T> = { ...target };

  for (const key in source) {
    const srcVal = source[key];
    const tgtVal = result[key];

    if (isObject(srcVal) && isObject(tgtVal)) {
      result[key] = deepMerge(tgtVal, srcVal) as T[Extract<keyof T, string>];
    } else {
      result[key] = srcVal;
    }
  }

  return result as (U extends T ? U : U & T);
}