import { RoomController } from "room.controller";
import { MemoryController } from "memory.controller";
import { RoleClaimer } from "role.claimer";
import { LiveController } from "live.controller";

console.log("Script reloaded");
setupMyMemory();

//One time memory setting
for (let i = 0; i < Memory.myRooms.length; i++) {
    const myRoom: MyRoom = Memory.myRooms[i];
    myRoom.bankLinkerName = null;
    for (let j = 0; j < myRoom.mySources.length; j++) {
        const mySource: MySource = myRoom.mySources[j];
        mySource.link = null;
        mySource.state = "NoCache";
        mySource.cache = null;
    }
    for (let h = 0; h < myRoom.myCreeps.length; h++) {
        const myCreep: MyCreep = myRoom.myCreeps[h];
        if (myCreep.role === "Miner") {
            (myCreep as Miner).linkIdToDepositTo = null;
        }
    }
}

export const loop: any = function () {
    MemoryController.run();

    for (let i = 0; i < Memory.myMemory.myRooms.length; i++) {
        RoomController.run(Memory.myMemory.myRooms[i]);
    }

    LiveController.run();

    for (let i = 0; i < Memory.myMemory.myTravelingCreeps.length; i++) {
        const travelingCreep: MyCreep = Memory.myMemory.myTravelingCreeps[i];
        if (travelingCreep.role === "Claimer") {
            RoleClaimer.run(travelingCreep as Claimer);
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
