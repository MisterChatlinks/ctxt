export function isAsyncFunction(fn: Function){
    return typeof fn === "function" && fn.toString().trimStart().match(/^async/) ? true : false
}

export function isNumber(num: number){
    return typeof num === "number"
}

export function isPositiveNumber(num: number){
    return typeof num === "number" && !(num < 0)
}

export function isNegativeNumber(num: number){
    return typeof num === "number" && !(num < 0)
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}


/**
 * Checks whether a given value can be parsed as a valid JavaScript Date.
 *
 * @param input - A string, number, or Date-like input to test
 * @returns true if the input is a valid date, false otherwise
 */
export function isValidDate(input: unknown): input is Date {
  if (input instanceof Date) {
    return !isNaN(input.getTime());
  }

  if (typeof input === "string" || typeof input === "number") {
    const date = new Date(input);
    return !isNaN(date.getTime());
  }

  return false;
}
