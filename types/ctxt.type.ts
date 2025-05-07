export type ctxtLogLevel = "fatal" | "error" | "warn" | "info" | "success" | "log" ;

export type ctxtCallConfig = {
     send: unknown,
     throw?: boolean, 
     silentInProd?: true, 
     silentInDev?: true, 
     threshold?: number,
     flag?: string,
     trace?: unknown
}

export type ctxtLogguer = (opt: ctxtCallConfig) => void

export interface ctxtRootConfig {
    apiKey?: null | string,
    silentInProd?: boolean,
    silentInDev?: boolean,
    exclude?: string[],
    include?: string[],
    send?: ctxtLogLevel[],
    handleRejection?: boolean,
    handleException?: boolean,
}