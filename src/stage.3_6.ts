import { globalFunctions } from "global.functions";

export const stage3_6: StageController = {
    /*
    3.6 ->  4   : Room has a storage bank
    3.6 <-  4   : Room does not have a storage bank
    */
    up: function (myRoom: MyRoom, room: Room): boolean {
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
        //No steps
    }
};
