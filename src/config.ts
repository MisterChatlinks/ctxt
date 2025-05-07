import { ctxtLogLevel, ctxtRootConfig } from "../types/ctxt.type";

class CTXTConfigObj implements ctxtRootConfig {
    "apiKey" : null | string = null
    "exclude": string[] = []
    "include": string[] = ["*"]
    "send": ctxtLogLevel[] = ["error", "fatal", "info", "success", "warn" ]
    "silentInDev": boolean = false
    "silentInProd": boolean = true
}

export function CTXTConfig(option: ctxtRootConfig): CTXTConfigObj {
    
    const shalowConfig = new CTXTConfigObj();

    for (const key in option) {
        if (!(key in shalowConfig)) {
            console.warn(`Unknown key \`${key}\` passed in CTXTConfig`);
        }
    }

    const {
        apiKey,
        exclude,
        include,
        send,
        silentInDev,
        silentInProd,
    } = option;

    if (apiKey) {
        shalowConfig.apiKey = option.apiKey as string;
    }

    // // Check other options and handle them accordingly
    // if (num().parse(defaultTreshold)) {
    //     shalowConfig.defaultTreshold = option.defaultTreshold as number;
    // }

    // if(exclude){
    //     const excludeList = []

    //     for(const item of exclude){
    //         if (!shalowConfig.include.includes(item as string)) {
    //             console.warn(`Invalid item \`${item}\` passed in exclude of ctxt-config`);
    //             continue;
    //         }
    //         excludeList.push(item)
    //     }

    //     shalowConfig["exclude"] = excludeList;
    // }

    // if(include){
    //     const includeList = []

    //     for(const item of include){
    //         if (typeof item != "string") {
    //             console.warn(`Invalid path \`${item}\` passed in include of ctxt-config`);
    //             continue;
    //         }
    //         includeList.push(item)
    //     }

    //     shalowConfig["include"] = includeList;
    // }
     

    // // Similar handling for include, send, silentInDev, silentInProd, and reportToFiles
    // if (arr(str()).parse(include)) {
    //     shalowConfig["include"] = option.include;
    // }

    // if (arr(num()).parse(send)) {
    //     shalowConfig["send"] = option.send;
    // }

    // if (num().parse(silentInDev)) {
    //     shalowConfig["silentInDev"] = option.silentInDev;
    // }

    // if (num().parse(silentInProd)) {
    //     shalowConfig["silentInProd"] = option.silentInProd;
    // }

    // if (arr(str()).parse(reportToFiles)) {
    //     shalowConfig["reportToFiles"] = option.reportToFiles;
    // }

    return shalowConfig
}

