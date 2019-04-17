import { global } from "global";

export const stage0_6: StageController = {
    /*
    0.6 ->  1   : Room has caches length >= source amount
    0.6 <-  1   : Room has caches length < source amount
    */
    up: function (myRoom: MyRoom, room: Room): boolean {
        const amountOfSource: number = room.find(FIND_SOURCES).length;
        if (global.amountOfStructure(room, STRUCTURE_CONTAINER) >= amountOfSource) {
            myRoom.roomStage = 1;
            console.log("LOG: Room " + myRoom.name + " increased to room stage 1");
            return true;
        }
        return false;
    },
    down: function (myRoom: MyRoom, room: Room): boolean {
        const amountOfSource: number = room.find(FIND_SOURCES).length;
        if (global.amountOfStructure(room, STRUCTURE_CONTAINER) < amountOfSource) {
            myRoom.roomStage = 0.6;
            console.log("LOG: Room " + myRoom.name + " decreased to room stage 0.6");
            return true;
        }
        return false;
    },
    step: function (myRoom: MyRoom, room: Room): void {
        global.buildContainerCaches(myRoom);
    }
};
