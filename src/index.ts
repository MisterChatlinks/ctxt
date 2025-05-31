import { MoniText } from "./monitext";
import { MoniTextScheduler } from "./scheduler";
import type { CompactLogger, MTConf, VerboseLogger } from "../src-types/monitext.types";

export default function defineMonitextRuntime(config?: MTConf) {
    if (config && typeof config != "object") {
        throw new Error(`[defineMonitextConfig] expecting an object as config; received: ${config}`);
    }
    if (config) MoniTextScheduler.defConfig(config);
    return {
        mtxt: new MoniText("shorthand") as CompactLogger,
        monitext: new MoniText("verbose") as VerboseLogger
    };
}

export type { CompactLogger, MTConf, VerboseLogger, MoniText }