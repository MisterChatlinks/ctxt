import { BusConfig, BusEvent } from "./event";

export type PolicyPhase = "pre" | "core" | "post";

export interface PolicyDescriptor {
    /** Name of the policy, used for debugging and introspection */
    name: string;

    /** When the policy should be applied */
    phase?: PolicyPhase;

    /** Optional filter based on log level */
    level?: string[];

    /** Custom filter function */
    filter?: (log: BusEvent) => boolean;

    /** Order of execution relative to other policies */
    priority?: number;

    /**
     * Core handler function
     * You must call `next()` to forward the log to the next policy
     */
    handle: (log: BusEvent, config: typeof BusConfig, next: () => void) => void;
}