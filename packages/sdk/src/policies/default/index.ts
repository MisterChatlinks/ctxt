import { createFormating } from "./format";
import { createConfig } from "./config";
import { logHandling } from "./behaviors";

export const record = { createConfig, createFormating, policies: [logHandling] }
