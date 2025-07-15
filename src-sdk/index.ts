import { type BusFullConfig } from "@core/types/event";
import { getPolicyRecord } from "@policies/main";
import { lookUpInStack } from "@utils/stack/main";
import * as check from "@utils/types/main";
import { parseDate } from "@utils/time/main";
import { createStructFromShape } from "@core/struct";
import { Config, createConfigResolver } from "@core/config";
import { PolicyInstance } from "@structs/policy";
import { LogInstance } from "@structs/log";
import { extractKeys } from "@utils/object/main";
import { convertTime, writeTimeString } from "@utils/time/main";
import { MoniTextEventBus } from "@core/event";
import { applyPolicies, MoniTextPolicy } from "@core/policy";
import { MonitextLoggingInterface } from "./logger/main";
import { writeColoredString } from "@printUtils/main";
import { writeMonitextError } from "@utils/write/writeError";

const utils = {
    lookUpInStack,
    parseDate,
    extractKeys,
    check,
    convertTime,
    writeTimeString,
};

const tools = {
    createStructFromShape,
    createConfigResolver,
    writeColoredString,
    PolicyInstance,
    LogInstance,
    Config,
};

function createRuntime(configuration: ReturnType<typeof BusFullConfig>) {
    const policies =
        configuration?.load?.flat().filter((p) =>
            p instanceof MoniTextPolicy
        ) ?? [];

    const bus = new MoniTextEventBus(
        extractKeys(configuration, "config", "format"),
    );

    bus.subscribe(async (log, config) => {
        try {
            await applyPolicies(policies, log, config, "pre");
            await applyPolicies(policies, log, config, "core");
            await applyPolicies(policies, log, config, "post");
        }
        catch (e) {
            console.warn(...writeColoredString(function (hr, cols, push) {
                const { bold } = cols
                push(hr("MONITEXT - SYS GUARD"));
                push(bold(writeMonitextError("MonitextFailSafe", `A Critical Error as occured inside Monitext Logging Policy;\nCause: ${(e as Error).message}\n${(e as Error)?.stack}`)))
                push(hr("MONITEXT - SYS GUARD"));
            }))
        }
    });

    const pack = {
        mtxt: new MonitextLoggingInterface(bus, "compact"),
        monitext: new MonitextLoggingInterface(bus, "chainable"),
    };

    return pack as typeof pack
};

export { createRuntime, getPolicyRecord, tools, utils };
