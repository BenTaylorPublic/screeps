import {RoomController} from "./room/room-controller";
import {MemoryController} from "./memory/memory-controller";
import {EmpireController} from "./empire/empire-controller";
import {ScheduleController} from "./schedule/schedule-controller";
import {ProfilerWrapper} from "./profiler/profiler-wrapper";
import {FunctionProfiler} from "./profiler/function-profiler/function-profiler";

console.log("Script reloaded");

Memory.myMemory.empire.attackHealerDrain = null;

// for (let i: number = 0; i < Memory.myMemory.myRooms.length; i++) {
//     const myRoom: MyRoom = Memory.myMemory.myRooms[i];
//     for (let j: number = myRoom.myCreeps.length - 1; j >= 0; j--) {
//         const myCreep: MyCreep = myRoom.myCreeps[j];
//     }
//     for (let j: number = myRoom.spawnQueue.length - 1; j >= 0; j--) {
//         const queuedCreep: QueuedCreep = myRoom.spawnQueue[j];
//     }
//     for (let j: number = 0; j < myRoom.mySources.length; j++) {
//         const mySource: MySource = myRoom.mySources[j];
//     }
// }

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
            reports: {},
            empire: {
                oddThousand: false,
                attackQuick: null,
                attackPressure: null,
                attackHealerDrain: null,
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
