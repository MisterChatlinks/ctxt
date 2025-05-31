#!/usr/bin/env ts-node
import { initCtxt } from "./initer";
import { buildCtxt } from "./builder";
import { watchConfig } from "./watcher";
import { join } from "path";
import { cwd } from "process";
import { devMTXTConfigPathRef, mtxtIsInDevellopement, userConfigFileName } from "./devVar";

const command = process.argv.slice(2);
const outPath = command.includes(mtxtIsInDevellopement) 
            ? join(devMTXTConfigPathRef)
            : join(cwd(), userConfigFileName);

(async()=>{ 
    if(command.includes("init")){
        await initCtxt(outPath)    
        buildCtxt(outPath)
    } 
    if(command.includes("-watch")){
        watchConfig(outPath)
    }
})()