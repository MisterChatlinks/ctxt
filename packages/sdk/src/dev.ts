import { extractStackDirPath } from "@utils/stack/main";

export class DevVariables {

    public static basePath: string | null = extractStackDirPath(((new Error()?.stack ?? "")[1] || ""));

    public static detectEnv(): "browser" | "node" | "deno" | "bun" | undefined {
        if (typeof window !== "undefined" && typeof document !== "undefined") {
            return "browser";
        } 
        else if (typeof Deno !== "undefined") {
            return "deno"; 
        } 
        else if (typeof Bun !== "undefined") {
            return "bun";
        }
        else if (typeof process !== "undefined" && process?.versions && process?.versions?.node) {
            return "node";
        } 
        return undefined;
    }   
}