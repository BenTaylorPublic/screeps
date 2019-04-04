import { roomController } from "room.controller";
import { memoryController } from "memory.controller";

console.log("Script reloaded");
setupMyMemory();

const room: MyRoom = Memory.myMemory.myRooms[0];
for (let i = 0; i < room.myCreeps.length; i++) {
    const myCreep: MyCreep = room.myCreeps[i];
    if (myCreep.role === "Miner") {
        const miner: Miner = myCreep as Miner;
        if (miner.cachePosToMineOn.x === 19) {
            miner.cachePosToMineOn.x = 10;
        }
    }
}

export const loop: any = function () {
    memoryController.run();

    for (let i = 0; i < Memory.myMemory.myRooms.length; i++) {
        roomController.run(Memory.myMemory.myRooms[i]);
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
