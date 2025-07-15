import { Config, createConfigResolver } from "../../core/config";

/**
 * Factory function to create a SDK configuration.
 * 
 * The configuration controls API access, project identification, 
 * log silencing policies, and transport retry behavior.
 * 
 **/
export const createConfig = createConfigResolver(new Config({
    /** API key used to authenticate requests */
    apiKey: "",

    /** Project identifier, used for grouping logs */
    project: "",

    /** Array of log levels to silence (suppress) */
    silence: [] as ("info")[],

    /** Interval in milliseconds between sending log batches (default: 30 seconds) */
    transportInterval: 30_000,

    /** Delay in milliseconds before retrying a failed transport attempt (default: 100 ms) */
    transportationRetryDelay: 100,

    /** Maximum number of retry attempts per transport cycle */
    transportMaxRetryPerTransport: 5,

    /** Delay in milliseconds before retrying after transport failure (default: 2 minutes) */
    transportOnFailRetryAfter: 120_000,
}));
