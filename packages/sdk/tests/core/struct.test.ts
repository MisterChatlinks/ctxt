import { describe, it, expect, vi, beforeEach } from "vitest";
import { createStructFromShape } from "@core/struct";

// Example shape
const shape = {
  name: "John",
  age: 30,
  nested: {
    active: true,
    score: 42,
  },
};

// Fake validate
const validate = vi.fn();

const Struct = createStructFromShape(shape, validate);

let instance: InstanceType<typeof Struct>;

beforeEach(() => {
  validate.mockClear();
  instance = new Struct();
});

describe("Struct", () => {
  it("should return a deep copy via toObject()", () => {
    const copy = instance.toObject();
    expect(copy).toEqual(shape);
    expect(copy).not.toBe(instance._struct);
  });

  it("should clone with override", () => {
    const clone = instance.clone({ name: "Jane" });
    expect(clone.toObject().name).toBe("Jane");
    expect(clone).not.toBe(instance);
  });

  it("should patch current instance", () => {
    instance.patch({ age: 40 });
    expect(instance.toObject().age).toBe(40);
    expect(validate).toHaveBeenCalled();
  });

  it("should pick specific fields", () => {
    const picked = instance.pick("name");
    expect(picked).toEqual({ name: "John" });
  });

  it("should omit specific fields", () => {
    const omitted = instance.omit("age");
    expect(omitted).not.toHaveProperty("age");
    expect(omitted).toHaveProperty("name");
  });

  it("should pickStruct and return new struct with subset", () => {
    const pickedStruct = instance.pickStruct("name");
    expect(pickedStruct.toObject()).toEqual({ name: "John" });
    expect(pickedStruct).not.toBe(instance);
  });

  it("should describe shape correctly", () => {
    const desc = instance.describe();
    expect(desc).toMatchObject({
      name: { type: "string", default: "John", required: true },
      age: { type: "number", default: 30, required: true },
      nested: {
        type: "object",
        required: true,
        properties: {
          active: expect.any(Object),
          score: expect.any(Object),
        },
      },
    });
  });
});
