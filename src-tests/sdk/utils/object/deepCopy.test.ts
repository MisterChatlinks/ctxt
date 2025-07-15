import { describe, it, expect } from "vitest";
import { deepClone } from "@utils/object/main";

describe("deepClone", () => {
  it("clones primitives unchanged", () => {
    expect(deepClone(42)).toBe(42);
    expect(deepClone("hello")).toBe("hello");
    expect(deepClone(null)).toBe(null);
    expect(deepClone(undefined)).toBe(undefined);
    expect(deepClone(true)).toBe(true);
  });

  it("clones Dates", () => {
    const date = new Date();
    const clone = deepClone(date);
    expect(clone).not.toBe(date);
    expect(clone.getTime()).toBe(date.getTime());
  });

  it("clones RegExp", () => {
    const regex = /abc/i;
    const clone = deepClone(regex);
    expect(clone).not.toBe(regex);
    expect(clone.source).toBe(regex.source);
    expect(clone.flags).toBe(regex.flags);
  });

  it("preserves functions by reference", () => {
    const fn = () => "ok";
    const obj = { fn };
    const clone = deepClone(obj);
    expect(clone.fn).toBe(fn);
  });

  it("deep clones nested objects", () => {
    const original = {
      a: 1,
      b: {
        c: 2,
        d: { e: 3 },
      },
    };
    const clone = deepClone(original);
    expect(clone).toEqual(original);
    expect(clone).not.toBe(original);
    expect(clone.b).not.toBe(original.b);
    expect(clone.b.d).not.toBe(original.b.d);
  });

  it("deep clones arrays", () => {
    const arr = [1, [2, [3]], { x: 4 }];
    const clone = deepClone(arr);
    expect(clone).toEqual(arr);
    expect(clone).not.toBe(arr);
    expect(clone[1]).not.toBe(arr[1]);
    expect(clone[2]).not.toBe(arr[2]);
  });

  it("skips inherited properties", () => {
    class Foo {
      a = 1;
    }
    //@ts-ignore 
    Foo.prototype.b = 2;

    const instance = new Foo();
    const clone = deepClone(instance);
    expect(clone.a).toBe(1);
    expect("b" in clone).toBe(false);
  });

  it("handles empty objects", () => {
    const obj = {};
    const clone = deepClone(obj);
    expect(clone).toEqual({});
    expect(clone).not.toBe(obj);
  });
});
