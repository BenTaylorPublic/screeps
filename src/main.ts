import {RoomController} from "./room/room-controller";
import {MemoryController} from "./memory/memory-controller";
import {EmpireController} from "./empire/empire-controller";
import {ProfilerWrapper} from "./profiler/profiler-wrapper";
import {FunctionProfiler} from "./profiler/function-profiler/function-profiler";
import {EmpireHelper} from "./global/helpers/empire-helper";

console.log("Script reloaded");

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

    EmpireController.run(myMemory);

    temp(myMemory);

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
                powerScav: {
                    targetBanks: []
                },
                observer: null,
                transfers: []
            },
            scheduledCommands: []
        } as MyMemory;
    }
}

function temp(myMemory: MyMemory): void {
    const flag: Flag | null = Game.flags["test-run-1"];

    if (flag == null) {
        return;
    }
    flag.remove();

    myMemory.empire.transfers.push({
        amount: 500,
        amountLeft: 500,
        resource: "Z",
        roomFrom: "E17S11",
        roomTo: "E16S18",
        state: "Loading"

    });
}