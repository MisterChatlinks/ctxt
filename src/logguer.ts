import { MoniTextScheduler } from "./scheduler";
import { VerboseLogObject, LogLevel, scheduleEntrie, logConfig } from "../src-types/monitext.type";
import { extractKeys } from "./utils/extractKeys";

export class MTLogguer {

    private ref = Symbol();

    public log(lvl: LogLevel, statemens: unknown[], metaData: Record<string, unknown>) {

        MoniTextScheduler.scheduleLog({
            "content": statemens,
            "level": lvl,
            "ref": this.ref,
            "meta": {
                "time": new Date().toISOString(),
                ...metaData
            }
        })

        return extractKeys<VerboseLogObject, MTLogguer>(this, "config", "send", "withMeta")
    }

    public config(config: logConfig) {
        MoniTextScheduler.configLog(this.ref, config);
        return extractKeys<{
            send: MTLogguer["send"],
            withMeta: MTLogguer["withMeta"]
        },
        MTLogguer>(this, "send", "withMeta")
    }

    public withMeta(metaData: scheduleEntrie["meta"]) {
        MoniTextScheduler.addMetaDataToLog(this.ref, metaData);
        return extractKeys<{
            send: MTLogguer["send"],
            config: MTLogguer["config"]
        },
        MTLogguer>(this, "send", "config")
    }

    public send() {
        return MoniTextScheduler.flush(this.ref);
    }
}