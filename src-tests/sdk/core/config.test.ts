import { describe, it, expect, vi, beforeEach } from "vitest";
import { Config, createConfigResolver } from "@core/config";

const base = {
  host: "localhost",
  port: 8080,
  debug: false,
  meta: {
    version: 1,
    tags: ["core"],
  },
};

type ConfigShape = typeof base;

describe("Config", () => {
  let config: Config<ConfigShape>;

  beforeEach(() => {
    config = new Config(base);
  });

  it("returns default values via get()", () => {
    expect(config.get("host")).toBe("localhost");
    expect(config.get("debug")).toBe(false);
  });

  it("merges shallow override", () => {
    config.merge({ port: 3000 });
    expect(config.get("port")).toBe(3000);
    expect(config.get("host")).toBe("localhost");
  });

  it("merges deep override", () => {
    //@ts-expect-error child are not covered in typing
    config.merge({ meta: { version: 2 } }, true);
    const obj = config.toObject();
    expect(obj.meta.version).toBe(2);
    expect(obj.meta.tags).toEqual(["core"]); // not lost
  });

  it("does not mutate baseConfig", () => {
    config.merge({ port: 3000 });
    const obj = config.toObject();
    expect(obj).not.toBe(base);
    expect(base.port).toBe(8080);
  });

  it("serializes with toString()", () => {
    config.merge({ host: "127.0.0.1" });
    const str = config.toString();
    expect(str).toContain("127.0.0.1");
    expect(str).toContain("8080");
  });
});

describe("createConfigResolver", () => {
  it("applies validation", () => {
    const validate = vi.fn();
    const conf = new Config(base);
    const resolve = createConfigResolver(conf, validate);

    const userConfig = { debug: true };
    const result = resolve(userConfig);

    expect(validate).toHaveBeenCalledWith(userConfig);
    expect(result.debug).toBe(true);
  });

  it("merges deeply through resolver", () => {
    const conf = new Config(base);
    const resolve = createConfigResolver(conf);

    //@ts-expect-error child are not covered in typing
    const result = resolve({ meta: { tags: ["test"] } });

    expect(result.meta.tags).toEqual(["test"]);
    expect(result.meta.version).toBe(1); // deep merge preserved
  });
});
