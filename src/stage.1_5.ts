import { globalFunctions } from "global.functions";

export const stage1_5: StageController = {
    /*
    1.5 ->  2 : Room has >= 5 extensions
    1.5 <-  2 : Room has < 5 extensions
    */
    up: function (myRoom: MyRoom, room: Room): boolean {
        if (globalFunctions.amountOfStructure(room, STRUCTURE_EXTENSION) >= 5) {
            myRoom.roomStage = 2;
            console.log("LOG: Room " + myRoom.name + " increased to room stage 2");
            return true;
        }
        return false;
    },
    down: function (myRoom: MyRoom, room: Room): boolean {
        if (globalFunctions.amountOfStructure(room, STRUCTURE_EXTENSION) < 5) {
            myRoom.roomStage = 1.5;
            console.log("LOG: Room " + myRoom.name + " decreased to room stage 1.5");
            return true;
        }
        return false;
    },
    step: function (myRoom: MyRoom, room: Room): void {
        globalFunctions.buildExtensions(myRoom, 5);
    }
};
