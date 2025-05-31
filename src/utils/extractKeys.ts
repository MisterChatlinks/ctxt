/**
 * Return a given set of property of a given object, 
 * @param { Object } target - the object from which are extracted the properties
 * @param { Array<string> } keys - the keys that are meant for extraction
*/
export function extractKeys<T extends {}, U>(target: U, ...keys: (keyof U)[]) {
    if (!keys || !target || !Array.isArray(keys) || typeof target !== "object") {
        throw new Error(`[MT/extractKeys] expecting an object and they key that need to be returned; received: ${{ keys, target }}`)
    }
    const result: Record<string, unknown> = {};

    for (const key in keys) {
        const current = keys[key]
        if (!target[current]) {
            throw new Error(`[MoniText/extractKeys] key: ${current as string} does not exit on ${target}`)
        }
        result[current as string] =
            (typeof target[current] === "function") ? target[current].bind(target) : target[current]
    }
    return result as T;
}


