import { Struct } from "../struct";

export type  StructInstance<T extends Record<string, unknown>> = typeof Struct<T> & { _raw: T }

export type AsyncOrSyncReturn<T extends (...args: any[]) => any> = ReturnType<T> extends Promise<any> ? "async" : "sync";
