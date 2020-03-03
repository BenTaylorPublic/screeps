import {RoomController} from "./room/room-controller";
import {MemoryController} from "./memory/memory-controller";
import {EmpireController} from "./empire/empire-controller";
import {ScheduleController} from "./schedule/schedule-controller";
import {ProfilerWrapper} from "./profiler/profiler-wrapper";
import {FunctionProfiler} from "./profiler/function-profiler/function-profiler";
import {HelperFunctions} from "./global/helper-functions";
import {SpawnQueueController} from "./global/spawn-queue-controller";

console.log("Script reloaded");

for (let i: number = 0; i < Memory.myMemory.myRooms.length; i++) {
    const myRoom: MyRoom = Memory.myMemory.myRooms[i];
    const name: string = "FixCreep" + HelperFunctions.getId();
    SpawnQueueController.queueCreepSpawn([MOVE, CARRY], myRoom, 999, name);
    myRoom.myCreeps.push({
        name: name,
        role: "Stocker",
        assignedRoomName: myRoom.name,
        spawningStatus: "queued",
        roomMoveTarget: {
            pos: null,
            path: []
        },
        state: "Pickup"
    } as MyCreep);
    // for (let j: number = myRoom.myCreeps.length - 1; j >= 0; j--) {
    //     const myCreep: MyCreep = myRoom.myCreeps[j];
    // }
    // for (let j: number = myRoom.spawnQueue.length - 1; j >= 0; j--) {
    //     const queuedCreep: QueuedCreep = myRoom.spawnQueue[j];
    // }
    // for (let j: number = 0; j < myRoom.mySources.length; j++) {
    //     const mySource: MySource = myRoom.mySources[j];
    // }
}

setupMyMemory();
// ProfilerWrapper.setup();

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
                powerScav: {
                    targetBanks: []
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
