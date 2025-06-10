/**
 * This file is meant to store developement variable for monitor-txt
 * such as generated file names, export name, custom path path, or 
 * susceptible to change var/string
*/

import type { MTConf } from "./src"
import { encryptPayload } from "./src/utils/encrypt"

export const RuntimeFileName = "monitext.runtime"

export const PackageName = "monitor-txt"

export const defaultApiKeyPlaceholder = "<YOUR_API_KEY>"

export const defaultProjectNamePlaceholder = "<YOUR_PROJECT_NAME>"

export const defaultApiUrl = "https://monitext.onrender.com/api/logs"

export async function defaultEncryptPayload(payload: string, apiKey: string){   
    return  await encryptPayload(payload, apiKey)
};

/**
 * Default configuration object for Monitext.
 *
 * @constant
 * @type {MTConf}
 * @property {string} apiKey - The API key used for authentication. Defaults to a placeholder value.
 * @property {boolean} devMode - Indicates whether the application is running in development mode. Defaults to `false`.
 * @property {string} env - The runtime environment. Defaults to `"node"`.
 * @property {string} format - The logging format. Defaults to `"dev"`.
 * @property {string} project_name - The name of the project. Defaults to a placeholder value.
 * @property {string[]} silent - An array of log levels to suppress. Defaults to an empty array.
 * @property {null | string} fallback - A fallback mechanism for logging. Defaults to `null`.
 * @property {string} fallbackFilePath - The file path for fallback error logs. Defaults to `"./error-logs.txt"`.
 * @property {boolean} useDefaultFallback - Indicates whether to use the default fallback mechanism. Defaults to `true`.
 * @property {number} transportationDelay - The delay in milliseconds for log transportation. Defaults to `60000` (60 seconds).
 * @property {number} backOffDelay - The delay in milliseconds for exponential backoff during retries. Defaults to `1000` (1 second).
 */
export const defaultMonitextConfig: MTConf = {
    "apiKey": defaultApiKeyPlaceholder,
    "devMode": false,
    "env": "node",
    "format": "dev",
    "project_name": defaultProjectNamePlaceholder,
    "silent": [],
    "fallback": null,
    "fallbackFilePath": "./error-logs.txt",
    "useDefaultFallback": true,
    "transportationDelay": 60000, // Default to 60 seconds if not specified
    "backOffDelay": 1000, // Default to 1 second if not specified,
    "encryptPayload": defaultEncryptPayload,
    "apiUrl": defaultApiUrl
}