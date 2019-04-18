import { globalFunctions } from "global.functions";

export const stage0_6: StageController = {
    /*
    0.6 ->  1   : Room has caches length >= source amount
    0.6 <-  1   : Room has caches length < source amount
    */
    up: function (myRoom: MyRoom, room: Room): boolean {
        const amountOfSource: number = room.find(FIND_SOURCES).length;
        if (globalFunctions.amountOfStructure(room, STRUCTURE_CONTAINER) >= amountOfSource) {
            myRoom.roomStage = 1;
            console.log("LOG: Room " + myRoom.name + " increased to room stage 1");
            return true;
        }
        return false;
    },
    down: function (myRoom: MyRoom, room: Room): boolean {
        const amountOfSource: number = room.find(FIND_SOURCES).length;
        if (globalFunctions.amountOfStructure(room, STRUCTURE_CONTAINER) < amountOfSource) {
            myRoom.roomStage = 0.6;
            console.log("LOG: Room " + myRoom.name + " decreased to room stage 0.6");
            return true;
        }
        return false;
    },
    step: function (myRoom: MyRoom): void {
        const roomFlags: Flag[] = globalFunctions.getRoomsFlags(myRoom);
        let flagsPlaced: number = 0;
        for (let i = 0; i < roomFlags.length; i++) {
            const roomFlag: Flag = roomFlags[i];
            const flagNameSplit: string[] = roomFlag.name.split("-");
            if (flagNameSplit[0] === "cont") {
                const result: ScreepsReturnCode = Game.rooms[myRoom.name].createConstructionSite(roomFlag.pos, STRUCTURE_CONTAINER);
                if (result === OK) {
                    console.log("LOG: Placed container cache construction site");
                    roomFlag.remove();
                    for (let j = 0; j < myRoom.mySources.length; j++) {
                        const mySource: MySource = myRoom.mySources[j];
                        const source: Source | null = Game.getObjectById<Source>(mySource.id);
                        if (source == null) {
                            console.log("ERR: Source was null when trying to get it by ID");
                        } else {
                            if (source.pos.inRangeTo(roomFlag.pos, 1)) {
                                mySource.cachePos = {
                                    x: roomFlag.pos.x,
                                    y: roomFlag.pos.y,
                                    roomName: myRoom.name
                                };
                                flagsPlaced++;
                            } // Else it's hopefully the other source in the room...
                        }
                    }

                } else {
                    console.log("ERR: Placing a container cache construction site errored");
                }
            }
        }

        if (flagsPlaced !== myRoom.mySources.length) {
            console.log("ATTENTION: Room " + myRoom.name + " needs cache container flag");
        }
    }
};
