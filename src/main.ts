import {RoomController} from "./room/room-controller";
import {MemoryController} from "./memory/memory-controller";
import {EmpireController} from "./empire/empire-controller";
import {ProfilerWrapper} from "./profiler/profiler-wrapper";
import {FunctionProfiler} from "./profiler/function-profiler/function-profiler";
import {EmpireHelper} from "./global/helpers/empire-helper";
import {Constants} from "./global/constants/constants";
import {SpawnQueueController} from "./global/spawn-queue-controller";

if (Game.shard.name !== "sim") {
    console.log("Script reloaded");
}

// for (let i: number = 0; i < Memory.myMemory.myRooms.length; i++) {
//     const myRoom: MyRoom = Memory.myMemory.myRooms[i];
//     if (myRoom.labs != null) {
//     }
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

    EmpireController.run(myMemory);

    if (Game.flags["test-run-1"] != null &&
        myMemory.myRooms.length === 1) {
        Game.flags["test-run-1"].remove();
        const myRoom: MyRoom = myMemory.myRooms[0];
        const legolas: Legolas = {
            name: "Legolas" + Game.time,
            role: "Legolas",
            assignedRoomName: myRoom.name,
            spawningStatus: "queued",
            roomMoveTarget: {
                pos: null,
                path: []
            }
        };
        myMemory.empire.creeps.push(legolas);
        SpawnQueueController.queueCreepSpawn(myRoom, 1, "Legolas" + Game.time, "Legolas");
    }

    for (let i = 0; i < myMemory.myRooms.length; i++) {
        const transfer: Transfer | null = EmpireHelper.getValidResourceTransfer(myMemory.empire, myMemory.myRooms[i].name);
        RoomController.run(myMemory.myRooms[i], transfer);
    }

    if (Game.time % 10 === 0) {
        ProfilerWrapper.detectProfileReport();
        FunctionProfiler.detectProfileReport();
    }

    if (Game.cpu.getUsed() > 20) {
        console.log(Game.time + ": Used " + Game.cpu.getUsed() + ", bucket: " + Game.cpu.bucket);
    } else if (Game.cpu.bucket >= Constants.GENERATE_PIXEL_WHEN_BUCKET_OVER) {
        Game.cpu.generatePixel();
    }
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
                powerBanks: {
                    targetBanks: [],
                    averageDuoTravelTicksPerRoom: 50,
                    countDuoTravelTicksPerRoom: 0
                },
                observer: null,
                transfers: []
            }
        };
    }
}