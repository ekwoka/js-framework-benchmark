import * as fs from 'fs';
import { BenchmarkInfo, BenchmarkType, cpuBenchmarkInfos, DurationMeasurementMode } from './benchmarksCommon.js';
import { CPUBenchmarkPuppeteer, fileNameTrace } from './benchmarksPuppeteer.js';
import { config, initializeFrameworks } from './common.js';
import { computeResultsCPU } from './timeline.js';
import { writeResults } from "./writeResults.js";
// let TimelineModelBrowser = require("./timeline-model-browser.js");
//var DevtoolsTimelineModel = require('devtools-timeline-model');

async function main() {



    for (let i = 0; i < 12; i++) {
        let trace = `traces/xania-v0.3.3-keyed_01_run1k_${i}.json`;
        console.log(trace, await computeResultsCPU(config, trace, DurationMeasurementMode.LAST_PAINT))
    }


}

async function readAll() {
    let jsonResult: { framework: string; benchmark: string; values: number[] }[] = [];

    let cpuCPUBenchmarks = Object.values(cpuBenchmarkInfos);
    
    let frameworks = await initializeFrameworks();
    for (let framework of frameworks) {
        for (let benchmarkInfo of cpuCPUBenchmarks) {
            let results: number[] = [];
            for (let i = 0; i < 12; i++) {
                let trace = `${fileNameTrace(framework, benchmarkInfo, i)}`;
                if (!fs.existsSync(trace)) {
                    console.log("ignoring ", trace, "since it doesn't exist.");
                } else {
                    console.log("checking ", trace, benchmarkInfo.durationMeasurementMode);
                    let result = await computeResultsCPU(config, trace, benchmarkInfo.durationMeasurementMode); 
                    results.push(result);
                    console.log(result);
                }
            }
            results.sort((a: number, b: number) => a - b);
            results = results.slice(0, config.NUM_ITERATIONS_FOR_BENCHMARK_CPU);      
            await writeResults(config, {
                framework: framework,
                benchmark: benchmarkInfo,
                results: results,
                type: BenchmarkType.CPU
              });
        }
    }
}

main().catch(err => {console.log("Error in isKeyed", err)}); 