import { describe, it, expect } from "vitest";
import { extractKeys } from "@utils/object/main";

describe("extractKeys", () => {
    it("extracts specified keys from object", () => {
        const obj = { a: 1, b: "hello", c: true };
        const result = extractKeys(obj, "a", "b");
        expect(result).toEqual({ a: 1, b: "hello" });
    });

    it("binds functions to the original object", () => {
        const obj = {
            x: 2,
            getX() {
                return this.x;
            },
        };

        const { getX } = extractKeys(obj, "getX");
        expect(getX()).toBe(2);
    });

    it("throws if a key does not exist", () => {
        const obj = { a: 1, b: 2 };

        expect(() => extractKeys(obj, "a", "c" as any)).toThrowError(
            /does not exist on target object/
        );
    });

    it("throws if keys are not an array or target is invalid", () => {
        expect(() => extractKeys(null as any, "a")).toThrowError(/.*/);
        expect(() => extractKeys(undefined as any, "a")).toThrowError(/.*/);
        expect(() => extractKeys({ a: 1 } as any, undefined as any)).toThrowError(/.*/);
    });

    it("works with empty list of keys", () => {
        const obj = { a: 1, b: 2 };
        const result = extractKeys(obj);
        expect(result).toEqual({});
    });

    it("preserves this context when method is called after extraction", () => {
        const obj = {
            a: 10,
            mult(x: number) {
                return this.a * x;
            }
        };
        const extracted = extractKeys(obj, "mult");
        expect(extracted.mult(3)).toBe(30);
    });

});
