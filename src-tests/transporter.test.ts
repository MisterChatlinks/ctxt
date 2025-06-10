import defineMonitextRuntime from "../src/index"
import { describe, it, expect, beforeAll, vi } from "vitest";
import { MoniTextTransporter } from "../src/transporter";
import { defaultApiUrl } from "../var";

const { mtxt, monitext } = defineMonitextRuntime({
    "env": "node",
    "apiKey": "<YOUR_API_KEY>",
    "project_name": "<YOUR_PROJECT_NAME>",
    "devMode": true,
    "format": "dev",
    "silent": []
});

const defaultConsoleLog = console.log;
function restoreConsoleLog() { console.log = defaultConsoleLog; };

describe("MonitextRuntime", () => {

    beforeAll(() => restoreConsoleLog());

    it('Should send logs to the API', async () => {
        const mockFetch = vi.fn().mockResolvedValue({ ok: true });
        global.fetch = mockFetch;

        const logs = [{ content: 'Test log', level: 'info' }];
        await MoniTextTransporter.sendLogs(logs as any);

        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining(defaultApiUrl),
            expect.objectContaining({
                method: 'POST',
                headers: expect.objectContaining({
                    'Content-Type': 'application/json',
                }),
                body: expect.any(String),
            })
        );
    });

    it("Should handle fallback function if defined", async() => {       
        
        const fallback = vi.fn();
        const logguer = vi.fn();
        const mockFetch = vi.fn().mockResolvedValue({ ok: false, status: 500 });

        global.fetch = mockFetch;
        console.log = logguer;

        const { mtxt } = defineMonitextRuntime({
            "env": "node",
            "apiKey": "fake-api-key",
            "project_name": "<YOUR_PROJECT_NAME>",
            "devMode": false,
            "format": "dev",
            "silent": [],
            "fallback": fallback,
            "useDefaultFallback": false,
            "transportationDelay": 50, // 50ms for testing
            "backOffDelay": 5 // 5ms second for testing
        });
        
        for(let i = 0; i < 5; i++) {
            mtxt.error(`test error ${i}`);
        }

        // Wait for the logs to be processed, the backoff delay is set to 5ms even if it may seem too short it does in fact greatly delay the execution of the fallback function so that infinite loop cannot bloat the transporter logic.
        // It work in theory but suck in practice expectually for testing as it painfully slow down testing, because delay grown exponentienly with consecucitve fail.
        // It's not an error but a design flaw. the greater the delay the more time it take to test, so we set it to 5ms for testing purpose.
        
        await new Promise(resolve => setTimeout(resolve, 1000));

        expect(fallback).toHaveBeenCalledTimes(1);
        
        expect(fallback).toHaveBeenCalledWith(expect.arrayContaining([
            expect.objectContaining({
                content: expect.toSatisfy(arr => arr.length > 0),
                level: "error"
            })
        ]));
    });
});
