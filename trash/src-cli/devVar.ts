import { join } from "path";
import { getPathInConfigMapper } from "./utils";

export const userConfigFileName = "mtxtconfig.ts";
export const devConfigFileName = "dev-mtxtconfig.ts";
export const userConfigPathRefFileIsFileName = "user-mtxtconfig.path"

export const userMTXTConfigFilePathRef = getPathInConfigMapper(userConfigPathRefFileIsFileName);

export const devMTXTConfigPathRef = join(__dirname, "configMap", devConfigFileName);

export const mtxtIsInDevellopement = "--use/dev"