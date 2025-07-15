import { describe, it, expect } from "vitest";
import { MonitextResult } from "@core/result";

describe("MonitextResult", () => {
  it("should create a successful result with value", () => {
    const result = MonitextResult.ok("hello");

    expect(result.ok).toBe(true);
    expect(result.value).toBe("hello");
    expect(result.error).toBeUndefined();
  });

  it("should create a failure result with an error", () => {
    const err = new Error("Something went wrong");
    const result = MonitextResult.fail<string>(err);

    expect(result.ok).toBe(false);
    expect(result.error).toBe(err);
    expect(result.value).toBeUndefined();
  });

  it("should narrow to success correctly", () => {
    const result = MonitextResult.ok({ status: 200 });

    if (result.ok) {
      expect(result.value.status).toBe(200); // ✅ works with narrowing
    } else {
      throw new Error("Should not be called");
    }
  });

  it("should narrow to failure correctly", () => {
    const err = new Error("Network down");
    const result = MonitextResult.fail(err);

    if (!result.ok) {
      expect(result.error.message).toMatch(/network/i);
    } else {
      throw new Error("Should not be success");
    }
  });
});
