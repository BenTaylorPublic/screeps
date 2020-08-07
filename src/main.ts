import {RoomController} from "./room/room-controller";
import {MemoryController} from "./memory/memory-controller";
import {EmpireController} from "./empire/empire-controller";
import {ProfilerWrapper} from "./profiler/profiler-wrapper";
import {FunctionProfiler} from "./profiler/function-profiler/function-profiler";
import {EmpireHelper} from "./global/helpers/empire-helper";
import {ReportController} from "./reporting/report-controller";
import {ReportCooldownConstants} from "./global/report-cooldown-constants";
import {MultishardClaimingController} from "./multishard/multishard-claiming-controller";

console.log("Script reloaded");

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

    for (let i = 0; i < myMemory.myRooms.length; i++) {
        const transfer: Transfer | null = EmpireHelper.getValidResourceTransfer(myMemory.empire, myMemory.myRooms[i].name);
        RoomController.run(myMemory.myRooms[i], transfer);
    }

    //Comment this out when not running
    MultishardClaimingController.run();

    if (Game.time % 10 === 0) {
        ProfilerWrapper.detectProfileReport();
        FunctionProfiler.detectProfileReport();
    }

    if (Game.cpu.getUsed() > 20) {
        console.log(Game.time + ": Used " + Game.cpu.getUsed() + ", bucket: " + Game.cpu.bucket);
    } else if (Game.cpu.bucket >= 9_900) {
        //@ts-ignore: TODO, update once types is there
        Game.cpu.generatePixel();
        ReportController.log("Generated a pixel on " + Game.shard.name);
        if (Game.resources.pixel >= 500) {
            ReportController.email("More than 500 pixels", ReportCooldownConstants.DAY);
        }
    }

    console.log(Game.shard.name + " bucket " + Game.cpu.bucket);
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
                observer: null,
                transfers: []
            }
        };
    }
}