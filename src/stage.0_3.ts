import { globalFunctions } from "global.functions";

export const stage0_3: StageController = {
    /*
    0.3 ->  0.6   : Room has >= 1 spawn
    0.3 <-  0.6   : Room has < 1 spawns
    */
    up: function (myRoom: MyRoom, room: Room): boolean {
        if (globalFunctions.amountOfStructure(room, STRUCTURE_SPAWN) >= 1) {
            //Spawn has been made
            myRoom.roomStage = 0.6;
            console.log("LOG: Room " + myRoom.name + " increased to room stage 0.6");
            return true;
        }
        return false;
    },
    down: function (myRoom: MyRoom, room: Room): boolean {
        if (globalFunctions.amountOfStructure(room, STRUCTURE_SPAWN) === 0) {
            //Spawn has been made
            myRoom.roomStage = 0.3;
            console.log("LOG: Room " + myRoom.name + " decreased to room stage 0.3");
            return true;
        }
        return false;
    },
    step: function (myRoom: MyRoom, room: Room): void {
        console.log("ATTENTION: Room " + room.name + " needs first spawn");
    }
};