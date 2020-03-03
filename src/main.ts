import {RoomController} from "./room/room-controller";
import {MemoryController} from "./memory/memory-controller";
import {EmpireController} from "./empire/empire-controller";
import {ScheduleController} from "./schedule/schedule-controller";
import {ProfilerWrapper} from "./profiler/profiler-wrapper";
import {FunctionProfiler} from "./profiler/function-profiler/function-profiler";
import {SpawnLaborer} from "./room/spawns/spawn-laborer";
import {SpawnStocker} from "./room/spawns/spawn-stocker";
import {SpawnClaimerController} from "./empire/spawn-claimer-controller";
import {SpawnMiner} from "./room/spawns/spawn-miner";
import {SpawnHauler} from "./room/spawns/spawn-hauler";
import {SpawnBankLinker} from "./room/spawns/spawn-bank-linker";

console.log("Script reloaded");

for (let i: number = 0; i < Memory.myMemory.myRooms.length; i++) {
    const myRoom: MyRoom = Memory.myMemory.myRooms[i];
    // for (let j: number = myRoom.myCreeps.length - 1; j >= 0; j--) {
    //     const myCreep: MyCreep = myRoom.myCreeps[j];
    // }
    for (let j: number = myRoom.spawnQueue.length - 1; j >= 0; j--) {
        const queuedCreep: QueuedCreep = myRoom.spawnQueue[j];
        if (queuedCreep.priority === 4.5) {
            //FORCE_LABORER
            queuedCreep.body = SpawnLaborer.getForceBody(myRoom);
        } else if (queuedCreep.priority === 4.25) {
            //STOCKER
            queuedCreep.body = SpawnStocker.getBody(myRoom);
        } else if (queuedCreep.priority === 4) {
            //CLAIMER
            queuedCreep.body = SpawnClaimerController.getBody();
        } else if (queuedCreep.priority === 3) {
            //MINER
            for (let k: number = 0; k < myRoom.mySources.length; k++) {
                const mySource: MySource = myRoom.mySources[k];
                if (mySource.minerName === queuedCreep.name) {
                    queuedCreep.body = SpawnMiner.getBody(myRoom, mySource);
                }
            }
        } else if (queuedCreep.priority === 2) {
            //HAULER
            queuedCreep.body = SpawnHauler.getBody(myRoom);
        } else if (queuedCreep.priority === 2) {
            //BANK_LINKER
            queuedCreep.body = SpawnBankLinker.getBody();
        } else if (queuedCreep.priority === 1) {
            //LABORER
            queuedCreep.body = SpawnLaborer.getBody(myRoom);
        }
    }
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
