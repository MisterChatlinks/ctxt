import { describe, expect, it } from "vitest";
import { deepMerge } from "@utils/object/main";

describe("deepMerge", () => {
    it("merges shallow properties", () => {
        const a = { foo: 1 };
        const b = { bar: 2 };
        const result = deepMerge(a, b);
        expect(result).toEqual({ foo: 1, bar: 2 });
    });

    it("overwrites primitives", () => {
        const a = { foo: 1 };
        const b = { foo: 2 };
        const result = deepMerge(a, b);
        expect(result).toEqual({ foo: 2 });
    });

    it("merges nested objects recursively", () => {
        const a = { nested: { a: 1, b: 2 } };
        const b = { nested: { b: 3, c: 4 } };
        const result = deepMerge(a, b);
        expect(result).toEqual({ nested: { a: 1, b: 3, c: 4 } });
    });

    it("does not merge arrays (replaces them)", () => {
        const a = { list: [1, 2] };
        const b = { list: [3, 4] };
        const result = deepMerge(a, b);
        expect(result).toEqual({ list: [3, 4] });
    });

    it("handles undefined values", () => {
        const a = { foo: 1 };
        const b = { foo: undefined };
        const result = deepMerge(a, b);
        expect(result).toEqual({ foo: undefined });
    });

    it("preserves other reference fields untouched", () => {
        const shared = { shared: true };
        const a = { data: shared };
        const b = { other: 123 };
        const result = deepMerge(a, b);
        expect(result.data).toBe(shared);
    });

    it("creates a new object (no mutation)", () => {
        const a = { x: 1, y: { z: 2 } };
        const b = { y: { z: 3 } };
        const result = deepMerge(a, b);

        expect(result).not.toBe(a);
        expect(result.y).not.toBe(a.y);
        expect(result).toEqual({ x: 1, y: { z: 3 } });
    });

    it("handles empty sources", () => {
        const a = { x: 1 };
        const b = {};
        const result = deepMerge(a, b);
        expect(result).toEqual({ x: 1 });
    });

    it("treats null as override", () => {
        const a = { a: 1, b: 2 };
        const b = { b: null };
        const result = deepMerge(a, b);
        expect(result).toEqual({ a: 1, b: null });
    });
});
