import { MoniText } from "./monitext";
import { MoniTextScheduler } from "./scheduler";
import { CompactLogger, MTConf, VerboseLogger } from "../src-types/monitext.type";

/**
 * Initializes and defines the global MoniText configuration.
 * 
 * This function registers the user's configuration into the MoniText scheduler and returns
 * two logger interfaces:
 * 
 * - `mtxt`: A lightweight shorthand logger for fast integration.
 * - `monitext`: A verbose logger that promotes logging hygiene and traceability.
 * 
 * @param {object} config - The MoniText global configuration object.
 * @param {string} config.project_name - Name of the project using MoniText.
 * @param {string} config.apiKey - API key for authenticating with the MoniText backend.
 * @param {boolean} [config.devMode=false] - If true, logs are only printed locally and not sent to API.
 * @param {boolean} [config.verbose=true] - If true, includes metadata visibility in local console logs.
 * @param {object} [config.env] - Runtime environment configuration.
 * @param {'node'|'browser'} [config.env.type='node'] - Runtime type for exception handling.
 * @param {boolean} [config.env.handleRejection=true] - Whether to auto-handle unhandled Promise rejections.
 * @param {boolean} [config.env.handleException=true] - Whether to auto-handle uncaught exceptions.
 * 
 * @returns {{
 *   mtxt: MoniText,
 *   monitext: MoniText
 * }} An object containing the two logger interfaces.
 * 
 * @example
 * import { defineMonitextConfig } from "monitext/setup";
 * const { mtxt, monitext } = defineMonitextConfig({
 *   project_name: "test",
 *   apiKey: "abc123",
 *   devMode: false,
 *   verbose: true,
 *   env: { type: "node", handleRejection: true, handleException: true }
 * });
 * 
 * mtxt.error("Simple error", { userId: "123" }).send();
 * 
 * monitext.error("Verbose error")
 *   .withMeta({ userId: "123", requestId: "req-456" })
 *   .config({ class: "AUTH", use: ["mail", "sms"] })
 *   .send();
 */
export default function defineMonitextRuntime(config?: MTConf) {
    if(config && typeof config != "object"){
        throw new Error(
            `[defineMonitextConfig] expecting an oject as config; received: ${config}`
        )
    }

    if(config) MoniTextScheduler.defConfig(config);

    return {
        mtxt: new MoniText("shorthand") as MoniText & CompactLogger,
        monitext: new MoniText("verbose") as MoniText & VerboseLogger
    };
}
