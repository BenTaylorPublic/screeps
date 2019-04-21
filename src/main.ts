import { roomController } from "room.controller";
import { memoryController } from "memory.controller";
import { roleClaimer } from "role.claimer";
import { liveController } from "live.controller";

console.log("Script reloaded");
setupMyMemory();

//One time memory setting
for (let i = 0; i < Memory.myRooms.length; i++) {
    const myRoom: MyRoom = Memory.myRooms[i];
    myRoom.bankLinkerName = null;
    for (let j = 0; j < myRoom.mySources.length; j++) {
        const mySource: MySource = myRoom.mySources[j];
        mySource.link = null;
        mySource.state = "Cache";
        //TODO: Use current cache pos to set up new one
        // Then remove old key
        // Must be done in js
    }
    for (let h = 0; h < myRoom.myCreeps.length; h++) {
        const myCreep: MyCreep = myRoom.myCreeps[h];
        if (myCreep.role === "Miner") {
            (myCreep as Miner).linkIdToDepositTo = null;
        }
    }
}

export const loop: any = function () {
    memoryController.run();

    for (let i = 0; i < Memory.myMemory.myRooms.length; i++) {
        roomController.run(Memory.myMemory.myRooms[i]);
    }

    liveController.run();

    for (let i = 0; i < Memory.myMemory.myTravelingCreeps.length; i++) {
        const travelingCreep: MyCreep = Memory.myMemory.myTravelingCreeps[i];
        if (travelingCreep.role === "Claimer") {
            roleClaimer.run(travelingCreep);
        }
    }

};

function setupMyMemory(): void {
    if (Memory.myMemory == null) {
        Memory.myMemory = {
            globalId: 0,
            myRooms: []
        };
    }
}
