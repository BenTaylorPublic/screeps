import {HelperFunctions} from "../../global/helper-functions";

export class FunctionProfiler {
    public static startFunction(functionName: string): void {
        if (Memory.functionProfiler[functionName] == null) {
            Memory.functionProfiler[functionName] = {
                callCount: 1,
                average: 0,
                before: Game.cpu.getUsed(),
                sections: {}
            } as FunctionProfilerRawDataFunction;
        } else {
            Memory.functionProfiler[functionName].before = Game.cpu.getUsed();
            Memory.functionProfiler[functionName].callCount++;
        }
    }

    public static endFunction(functionName: string): void {
        Memory.functionProfiler[functionName].average =
            ((Memory.functionProfiler[functionName].average *
                Memory.functionProfiler[functionName].callCount) +
                (Game.cpu.getUsed() - Memory.functionProfiler[functionName].before))
            / (Memory.functionProfiler[functionName].callCount + 1);
        Memory.functionProfiler[functionName].callCount++;
    }

    public static startFunctionSection(functionName: string, sectionName: string): void {

        if (Memory.functionProfiler[functionName].section[sectionName] == null) {
            Memory.functionProfiler[functionName].section[sectionName] = {
                callCount: 1,
                average: 0,
                before: Game.cpu.getUsed()
            } as FunctionProfilerRawDataSection;
        } else {
            Memory.functionProfiler[functionName].section[sectionName].before = Game.cpu.getUsed();
        }
    }

    public static endFunctionSection(functionName: string, sectionName: string): void {
        Memory.functionProfiler[functionName].section[sectionName].average =
            ((Memory.functionProfiler[functionName].section[sectionName].average *
                Memory.functionProfiler[functionName].section[sectionName].callCount) +
                (Game.cpu.getUsed() - Memory.functionProfiler[functionName].section[sectionName].before))
            / (Memory.functionProfiler[functionName].section[sectionName].callCount + 1);
        Memory.functionProfiler[functionName].section[sectionName].callCount++;
    }

    public static detectProfileReport(): void {
        if (Game.time % 10 !== 0 ||
            Game.flags["profile-function"] == null) {
            return;
        }

        const profile: FunctionProfilerRawData = Memory.functionProfiler as FunctionProfilerRawData;

        console.log("Function profiling report:");

        const totalTicks: number = Game.time - profile.startTick + 1;

        console.log("TotalTicks: " + totalTicks);
        const table: string[][] = [];
        table[0] = ["Name", "AvgMsPerTick", "AvgCallsPerTick", "AvgMsPerCall", "Calls"];

        const functions: string[] = Object.keys(profile);
        functions.splice(functions.indexOf("startTick"), 1);

        const processedFunctions: FunctionProfilerProcessedDataFunction[] = [];

        for (let i = 0; i < functions.length; i++) {
            const functionName: string = functions[i];
            const processedFunction: FunctionProfilerProcessedDataFunction =
                this.getProcessedFunctionData(profile[functionName], functionName, totalTicks);
            processedFunctions.push(processedFunction);
        }

        processedFunctions.sort((a, b) => {
            return b.avgMsUsagePerTick - a.avgMsUsagePerTick;
        });

        let index: number = 1;

        for (let i = 0; i < SHOW_TOP_X_FUNCTIONS; i++) {
            const processedFunction: FunctionProfilerProcessedDataFunction = processedFunctions[i];

            table[index] = [processedFunction.functionName,
                Number(processedFunction.avgMsUsagePerTick.toFixed(FIXED_NUMBER)).toString()
                , "", "", ""];
            index++;

            for (let j = 0; j < processedFunction.sections.length; j++) {
                const processedSection: FunctionProfilerProcessedDataSection = processedFunction.sections[j];


                table[index] = [processedSection.functionName,
                    Number(processedSection.avgMsUsagePerTick.toFixed(FIXED_NUMBER)).toString(),
                    Number(processedSection.callsPerTickAvg.toFixed(FIXED_NUMBER)).toString(),
                    Number(processedSection.avgTime.toFixed(FIXED_NUMBER)).toString(),
                    processedSection.callCount.toString()];

                index++;
            }
        }

        console.log("Top " + SHOW_TOP_X_FUNCTIONS + " functions, based on AvgMsPerTick");

        HelperFunctions.logTable(table);

        Game.flags["profile-function"].remove();
    }

    private static getProcessedFunctionData(functionn: FunctionProfilerRawDataFunction, functionName: string, totalTicks: number): FunctionProfilerProcessedDataFunction {
        const result: FunctionProfilerProcessedDataFunction = {
            functionName: functionName,
            avgMsUsagePerTick: 0,
            sections: []
        };
        const sections: string[] = Object.keys(functionn);

        for (let i = 0; i < sections.length; i++) {
            const f: string = sections[i];
            const functionProcessed: FunctionProfilerProcessedDataSection = {
                functionName: f,
                avgMsUsagePerTick: 0,
                callsPerTickAvg: 0,
                avgTime: functionn.sections[f].average,
                callCount: functionn.sections[f].callCount
            };
            functionProcessed.callsPerTickAvg =
                functionn.sections[f].callCount / totalTicks;
            functionProcessed.avgMsUsagePerTick =
                functionProcessed.avgTime * functionProcessed.callsPerTickAvg;

            result.sections.push(functionProcessed);
        }

        result.sections.sort((a, b) => {
            return b.avgMsUsagePerTick - a.avgMsUsagePerTick;
        });

        return result;
    }

    public static clearProfilingData(): void {
        //Clear all profiling on setup
        Memory.functionProfiler = {
            startTick: Game.time
        } as FunctionProfilerRawData;
    }
}

interface FunctionProfilerProcessedDataFunction {
    functionName: string;
    avgMsUsagePerTick: number;
    sections: FunctionProfilerProcessedDataSection[];
}

interface FunctionProfilerProcessedDataSection {
    functionName: string;
    avgMsUsagePerTick: number;
    callsPerTickAvg: number;
    avgTime: number;
    callCount: number;
}

export interface FunctionProfilerRawData {
    [key: string]: any; //FunctionProfilerRawDataFunction
    startTick: number;
}

export interface FunctionProfilerRawDataFunction {
    callCount: number;
    average: number;
    sections: FunctionProfilerRawDataSections;
    before: number | null;
}

export interface FunctionProfilerRawDataSections {
    [key: string]: FunctionProfilerRawDataSection;
}

export interface FunctionProfilerRawDataSection {
    callCount: number;
    average: number;
    before: number | null;
}

const SHOW_TOP_X_FUNCTIONS: number = 5;
const FIXED_NUMBER: number = 5;