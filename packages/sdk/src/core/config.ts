import { deepMerge } from "@utils/object/main";

export type ConfigKeyValues =
    | string
    | number
    | boolean
    | null
    | undefined
    | unknown[]
    | Record<string, any>
    | ((...args: any[]) => any)
    | ((...args: any[]) => Promise<any>);

export class Config<U extends Record<string, ConfigKeyValues>> {
    private baseConfig: U;
    private overrides: Partial<U> = {};

    constructor(config: U) {
        this.baseConfig = { ...config };
    }

    /**
     * Merge user-defined config values.
     * @param userDefined - Partial configuration
     * @param deep - Whether to merge nested objects deeply
     */
    public merge(userDefined: Partial<U>, deep = false): this {
        this.overrides = deep
            ? (deepMerge(this.overrides, userDefined) as Partial<U>)
            : { ...this.overrides, ...userDefined };

        return this;
    }

    public toObject(): U {
        return {
            ...this.baseConfig,
            ...deepMerge(this.baseConfig, this.overrides),
        } as U;
    }

    public toString() {
        return JSON.stringify(this.toObject());
    }

    public get<K extends keyof U>(key: K): U[K] {
        return this.overrides[key] ?? this.baseConfig[key];
    }
}

export function createConfigResolver<U extends Record<string, ConfigKeyValues>>(
    conf: Config<U>,
    validate?: (config: Partial<U>) => void
) {
    return function (userDefined: Partial<U>) {
        if (validate) {
            validate(userDefined); // throws or logs
        }

        const copy = new Config(conf.toObject())

        return copy.merge(userDefined, true).toObject();
    };
}