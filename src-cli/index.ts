#!/usr/bin/env ts-node
import { initCtxt } from "./initer";
import { buildCtxt } from "./builder";
import { watchConfig } from "./watcher";
import { join } from "path";
import { cwd } from "process";

const outPath = join(cwd(), "mtxt-config.ts");
const command = process.argv.slice(2);

(async()=>{ 
    if(command.includes("init")){
        await initCtxt(outPath)    
        buildCtxt(outPath)
    } 
    if(command.includes("-watch")){
            watchConfig(outPath)
    }
})()