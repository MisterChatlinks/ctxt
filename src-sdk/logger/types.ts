import { LogInstance } from "../structs/log"

export type CompactLogFn = (...args: CompactLogFnArgument) => InstanceType<typeof LogInstance>

type CompactLogFnArgument = [
    messsage: string,
    param?: {
        context?: {},
        config?: {}
    }
]

type t = Record<string, unknown>
type b = Record<string, unknown>

export type ChainableLogFn = (...message: string[]) => {
    config: (v: b) => { context: (v: t) => void },
    context: (v: t) => { config: (v: b) => void }
}

export type LoggingMode = "compact" | "chainable";
