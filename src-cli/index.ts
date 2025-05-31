#!/usr/bin/env node

import { cwd } from "process";
import { inquireMonitextRuntime } from "./inquire";
import { writeMonitextRuntime } from "./write";

const path = cwd();

(async ()=>{
    const config = await inquireMonitextRuntime();
    const param = { ...config };
    delete param["flavor"];
    writeMonitextRuntime(path, param, config.flavor)
})()