import { Config } from "../core/config"
import { createStructFromShape } from "../core/struct"
import { PolicyInstance } from "./policy"

export const PolicyRecord = {
    createConfig: undefined as unknown as Config<any>,
    createFormating: undefined as unknown as Config<any>,
    policies: [] as InstanceType<typeof PolicyInstance>[]
}

export const PolicyRecordInstance = createStructFromShape(PolicyRecord, function(){
    if(!this.createConfig){
        
    }
    if(!this.createFormating){
        
    }
    if(!this.policies){
        
    }
})