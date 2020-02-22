import {FunctionProfilerRawData} from "../profiler/function-profiler/function-profiler";
import {ProfilerRawData} from "../profiler/profiler";

export declare const Memory: Memoryy;

interface Memoryy {
    creeps: { [name: string]: CreepMemory };
    powerCreeps: { [name: string]: PowerCreepMemory };
    flags: { [name: string]: FlagMemory };
    rooms: { [name: string]: RoomMemory };
    spawns: { [name: string]: SpawnMemory };
    myMemory: MyMemory;
    functionProfiler: FunctionProfilerRawData;
    profiler: ProfilerRawData;
}