import { writeMonitextError } from "../write/writeError";

/**
 * @purpose Extract a subset of keys from a target object.
 *
 * Returns a new object containing only the specified keys from the target.
 * If the value is a function, it will be bound to the original object.
 *
 * @template U - The type of the target object
 * @param target - The object to extract properties from
 * @param keys - The keys to extract from the object
 * @returns A new object containing the selected keys and their bound values
 * @throws If a provided key does not exist on the target
 */
export function extractKeys<U extends object>(
    target: U,
    ...keys: (keyof U)[]
): Pick<U, keyof U> {
    if (
        !keys || keys == undefined || keys == null || !target || !Array.isArray(keys) || typeof target !== "object"
    ) {
        throw new Error(
            writeMonitextError(
                "extractKeys",
                `Expected an object and an array of keys. Received:\nTarget: ${JSON.stringify(target)
                }\nKeys: ${JSON.stringify(keys)}`,
            ),
        );
    }

    const result: Partial<U> = {};

    for (const key of keys) {
        if (key == undefined || keys == null || !(key in target)) {
            throw new Error(
                writeMonitextError(
                    "extractKeys",
                    `Key "${String(key)
                    }" does not exist on target object`,
                )
            )
        }

        const value = target[key];

        result[key] = typeof value === "function"
            ? (value as Function).bind(target)
            : value;
    }

    return result as Pick<U, typeof keys[number]>;
}
