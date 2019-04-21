import { globalFunctions } from "global.functions";

export const stage3_6: StageController = {
    /*
    3.6 ->  4   : Room has a storage bank
    3.6 <-  4   : Room does not have a storage bank
    */
    up: function (myRoom: MyRoom, room: Room): boolean {
        stage3_6.step(myRoom, room);
        if (globalFunctions.amountOfStructure(room, STRUCTURE_STORAGE) >= 1) {
            myRoom.roomStage = 4;
            console.log("LOG: Room " + myRoom.name + " increased to room stage 4");
            return true;
        }
        return false;
    },
    down: function (myRoom: MyRoom, room: Room): boolean {
        if (globalFunctions.amountOfStructure(room, STRUCTURE_STORAGE) < 1) {
            myRoom.roomStage = 3.6;
            console.log("LOG: Room " + myRoom.name + " decreased to room stage 3.6");
            return true;
        }
        return false;
    },
    step: function (myRoom: MyRoom, room: Room): void {
        const storage: StructureStorage[] = room.find<StructureStorage>(FIND_STRUCTURES, {
            filter: (structure: Structure) => {
                return structure.structureType === STRUCTURE_STORAGE;
            }
        });
        if (storage.length === 1) {
            myRoom.bankPos = {
                x: storage[0].pos.x,
                y: storage[0].pos.y,
                roomName: myRoom.name
            };
            return;
        }
        const roomFlags: Flag[] = globalFunctions.getRoomsFlags(myRoom);
        for (let i = 0; i < roomFlags.length; i++) {
            const roomFlag: Flag = roomFlags[i];
            if (roomFlag.name === "storage") {
                const result: ScreepsReturnCode = Game.rooms[myRoom.name].createConstructionSite(roomFlag.pos, STRUCTURE_STORAGE);
                if (result === OK) {
                    console.log("LOG: Placed storage bank construction site");
                    roomFlag.remove();

                } else {
                    console.log("ERR: Placing a storage bank construction site errored");
                }
            }
        }
    }
};
