import {RoomController} from "./room/room-controller";
import {MemoryController} from "./memory/memory-controller";
import {EmpireController} from "./empire/empire-controller";
import {ReportController} from "./reporting/report-controller";
import {ScheduleController} from "./schedule/schedule-controller";
import {ProfilerWrapper} from "./profiler/profiler-wrapper";
import {FunctionProfiler} from "./profiler/function-profiler/function-profiler";

console.log("Script reloaded");


for (let i: number = 0; i < Memory.myMemory.myRooms.length; i++) {
    (Memory.myMemory.myRooms[i] as MyRoom).powerSpawnId = null;
}

Memory.myMemory.empire.observer = {
    state: "Moving",
    observerIds: [],
    currentTargetRoomName: null,
    targetList: [],
    topLeft: null,
    size: 0
};

setupMyMemory();

export let loop: any = function (): void {

    const myMemory: MyMemory = Memory.myMemory;
    MemoryController.run();

    ScheduleController.preLoop(myMemory);

    ReportController.checkForReportFlag();
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
                observer: {
                    state: "Moving",
                    observerIds: [],
                    currentTargetRoomName: null,
                    targetList: [],
                    topLeft: null,
                    size: 0
                }
            },
            scheduledCommands: []
        } as MyMemory;
    }
}
