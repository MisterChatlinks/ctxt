/**
 * Tries to parse the input into a valid Date.
 *
 * @param input - A date string, timestamp, or Date object
 * @returns A Date instance if valid, otherwise null
 */
export function parseDate(input: unknown): Date | null {
    if (input instanceof Date && !isNaN(input.getTime())) {
        return input;
    }

    if (typeof input === "string" || typeof input === "number") {
        const parsed = new Date(input);
        return !isNaN(parsed.getTime()) ? parsed : null;
    }

    return null;
}
