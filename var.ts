/**
 * This file is meant to store developement variable for monitor-txt
 * such as generated file names, export name, custom path path, or 
 * susceptible to change var/string
*/

import type { MTConf } from "./src"

export const RuntimeFileName = "monitext.runtime"

export const PackageName = "monitor-txt"

export const defaultApiKeyPlaceholder = "<YOUR_API_KEY>"

export const defaultProjectNamePlaceholder = "<YOUR_PROJECT_NAME>"

export const defaultMonitextConfig: MTConf = {
    "apiKey": defaultApiKeyPlaceholder,
    "devMode": false,
    "env": "node",
    "format": "dev",
    "project_name": defaultProjectNamePlaceholder,
    "silent": []
}