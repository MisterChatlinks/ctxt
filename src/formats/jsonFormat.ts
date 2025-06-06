import { LogFormater } from "../../src-types/formater.types";
import { jsonFormat } from "../utils/jsonFormat";

export const jsonFormatFn: LogFormater = (data)=> {
    return jsonFormat(data as unknown as Record<string, unknown>)
}