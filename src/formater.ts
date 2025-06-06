import type { logFormat, LogFormater }  from "../src-types/formater.types"
import { jsonFormatFn } from "./formats/jsonFormat";
import { devFormatFn } from "./formats/devFormat";
import { compactFormatFn } from "./formats/compactFormat";

export class MoniTextFormater {

    public static createFormater(fn: LogFormater) {
        return function (expectData: logFormat) {
            expectData["meta:content"] = expectData["meta:content"] || {};
            return fn(expectData);
        } as LogFormater;
    }

    public static devFormat = this.createFormater(devFormatFn);

    public static jsonFormat = this.createFormater(jsonFormatFn);

    public static compactFormat = this.createFormater(compactFormatFn);
}
