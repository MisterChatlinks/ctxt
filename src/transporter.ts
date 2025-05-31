import { encryptPayload } from "./utils/encrypt";
import { MTConf, scheduleEntrie } from "../src-types/monitext.types";

export class MoniTextTransporter {
    
    private static config: MTConf;

    public static defConfig(conf: unknown) { }

    private static accessTk: string;

    private static batch: scheduleEntrie[] = [];

    private static nextTansportationSchedule: null | NodeJS.Timeout

    public static async scheduleTransportation(log: scheduleEntrie) {

        this.batch.push(log);

        if (this.nextTansportationSchedule === null) return;

        const self = this; 
        let retry = 0;

        this.nextTansportationSchedule = setInterval(async () => {
            retry++;
            const transportationResult = await this.transportToServer(this.batch);
            if (transportationResult.status === 200 || retry === 10) {
                self.batch = []
                clearInterval(self.nextTansportationSchedule as NodeJS.Timeout);
                self.nextTansportationSchedule = null;
            }
            if (retry === 10) {
                console.warn("Failed to transport logs to server endpoint; reason: ", transportationResult)
            }
        }, 60000) 
    }

    private static async transportToServer(log: scheduleEntrie[]) {
        return await (await fetch("https://monitext.onrender.com/v1/api/sdk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.accessTk}`
            },
            body: await encryptPayload(JSON.stringify(log), this.config.apiKey)
        })).json();
    }

    private static async requestServerToken(log: scheduleEntrie) {
        try {
            const Token = await (await fetch("https://monitext.onrender.com/v1/api/sdk", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${this.config.apiKey}`
                },
            })).json();

            if (!Token.tk) { return false }

            this.accessTk = Token.tk
        } catch (error) {

        }
        return true
    }
}