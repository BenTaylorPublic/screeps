import {RoomController} from "./room/room-controller";
import {MemoryController} from "./memory/memory-controller";
import {EmpireController} from "./empire/empire-controller";
import {ScheduleController} from "./schedule/schedule-controller";
import {ProfilerWrapper} from "./profiler/profiler-wrapper";
import {FunctionProfiler} from "./profiler/function-profiler/function-profiler";
import {Memory} from "./global/memory";

console.log("Script reloaded");


setupMyMemory();
ProfilerWrapper.setup();

export let loop: any = function (): void {

    const myMemory: MyMemory = Memory.myMemory;
    MemoryController.run();

    ScheduleController.preLoop(myMemory);

    EmpireController.run(myMemory);

    for (let i = 0; i < myMemory.myRooms.length; i++) {
        RoomController.run(myMemory.myRooms[i]);
    }

    MemoryController.clearBanks();

    ProfilerWrapper.detectProfileReport();
    FunctionProfiler.detectProfileReport();
};

function setupMyMemory(): void {

    ProfilerWrapper.clearProfilingData();
    FunctionProfiler.clearProfilingData();

    if (Memory.myMemory == null) {
        Memory.myMemory = {
            globalId: 0,
            myRooms: [],
            report: {
                lastReportTimeStamp: new Date().getTime(),
                reports: []
            },
            empire: {
                attackQuick: null,
                attackPressure: null,
                creeps: [],
                avoidRooms: [],
                powerScavenge: {
                    banksScavengingFrom: []
                },
                observer: {
                    state: "Moving",
                    observerIds: [],
                    currentTargetIndex: null,
                    targetList: []
                }
            },
            scheduledCommands: []
        } as MyMemory;
    }
}
