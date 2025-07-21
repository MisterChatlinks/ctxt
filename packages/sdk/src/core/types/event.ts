import { Config, createConfigResolver } from "../config"
import { MoniTextPolicy } from "../policy"
import { LogInstance } from "@structs/log"

export type BusEvent = InstanceType<typeof LogInstance>

export type BusEventHandler =
    | InstanceType<typeof MoniTextPolicy>
    | ((log: BusEvent, config: typeof BusConfig) => void)

export const BusConfig = {
    config: {} as Record<string, any>,
    format: {} as {} as Record<string, any>,
}

export const BusFullConfig = createConfigResolver(new Config({
    ...BusConfig,
    load: [] as BusEventHandler[], 
}))
