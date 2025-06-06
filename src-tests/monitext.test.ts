import defineMonitextRuntime, { VerboseLogger } from "../src/index";
import { describe, it, vi, expect, expectTypeOf, beforeAll } from "vitest";
const { mtxt, monitext } = defineMonitextRuntime({
    "env": "node",
    "apiKey": "<YOUR_API_KEY>",
    "project_name": "<YOUR_PROJECT_NAME>",
    "devMode": true,
    "format": "dev",
    "silent": []
});

const defaultConsoleLog = console.log;

function restoreConsoleLog() { console.log = defaultConsoleLog };

function overrideConsoleLog() {
    const logguer = vi.fn();
    console.log = logguer;
    return logguer;
}

describe("Monitext", () => {

    it("Should be initializable with two flavor", () => {
        expectTypeOf(mtxt).toBeObject();
        expectTypeOf(monitext).toBeObject();
    })

    it("Should have each of it' respective initialisation's property being of type function", () => {
        for (const key in mtxt) {
            expectTypeOf(mtxt[key]).toBeFunction;
            expectTypeOf(monitext[key]).toBeFunction;
        }
    })

    it("Should have each of is respective initialisation's properties mirrored in the other", () => {
        for (const key in mtxt) {
            expect(monitext).toHaveProperty(key);
        }
        for (const key in monitext) {
            expect(mtxt).toHaveProperty(key);
        }
    })

    it("It's Compact version Should log on console properly", () => {
        const log = overrideConsoleLog();
        mtxt.info("test");
        mtxt.error("test");
        mtxt.success("test");
        mtxt.fatal("test");

        expect(log).toHaveBeenCalledTimes(4);
    })


    it("It's Verbose version Should log on console properly", () => {
        const log = overrideConsoleLog();
        monitext.info("test").send();
        monitext.error("test").send();
        monitext.success("test").send();
        monitext.fatal("test").send();

        expect(log).toHaveBeenCalledTimes(4);
    })

    it("It's Verbose version should not log on console without calling .send()", () => {
        const log = overrideConsoleLog();
        monitext.info("test");
        monitext.error("test");
        monitext.success("test");
        monitext.fatal("test");

        expect(log).not.toHaveBeenCalled();
    })

    it("Should have it's log method silencable individually", () => {
        const log = overrideConsoleLog();
        mtxt.error("test", { conf: { silent: true } });
        monitext.info("test").config({ silent: true }).send();

        expect(log).not.toHaveBeenCalled();
    })

    it("Should be possible to define preconfigured Logguer, with the verbose version", () => {
        const log = overrideConsoleLog();
        const TestingLogguer = monitext.defLogguer("TestingLogguer", { silent: true });
        // won't log as preconfired not to
        TestingLogguer.info("test").send();
        TestingLogguer.error("test").send();
        TestingLogguer.fatal("test").send();
        TestingLogguer.warn("test").send();

        // will log as manualy set silence val
        TestingLogguer.success("test").config({ silent: false }).send();

        expect(log).toHaveBeenCalledOnce();
    })

    it("Should be possible to define preconfigured Logguer, with the compact version", () => {
        const log = overrideConsoleLog();
        const TestingLogguer = mtxt.defLogguer("TestingLogguer", { silent: true });
        // should not log 
        TestingLogguer.info("test");
        TestingLogguer.error("test");
        TestingLogguer.fatal("test");
        TestingLogguer.warn("test");

        // should log 
        TestingLogguer.success("test", { conf: { silent: false } });

        expect(log).toHaveBeenCalledTimes(1);
    })

    it("Should be possible to silence globally by level", () => {

        const { mtxt, monitext } = defineMonitextRuntime({
            "env": "node",
            "apiKey": "<YOUR_API_KEY>",
            "project_name": "<YOUR_PROJECT_NAME>",
            "devMode": true,
            "format": "dev",
            "silent": ["info", "success"]
        });

        const log = overrideConsoleLog();

        const TestingLogguer = mtxt.defLogguer("TestingLogguer");

        // should log       
        mtxt.error("test");
        mtxt.fatal("test");
        mtxt.warn("test");
        TestingLogguer.error("test");
        TestingLogguer.fatal("test");
        TestingLogguer.warn("test");

        // shouldn't log
        mtxt.success("test");
        mtxt.info("test");
        TestingLogguer.info("test");
        TestingLogguer.success("test");
        TestingLogguer.success("test", { conf: { silent: false } });

        expect(log).toHaveBeenCalledTimes(6);
    })
});