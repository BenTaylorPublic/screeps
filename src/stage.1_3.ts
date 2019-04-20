import { globalFunctions } from "global.functions";

export const stage1_3: StageController = {
    /*
    1.3 ->  1.6 : Room has >= 5 extensions
    1.3 <-  1.6 : Room has < 5 extensions
    */
    up: function (myRoom: MyRoom, room: Room): boolean {
        if (globalFunctions.amountOfStructure(room, STRUCTURE_EXTENSION) >= 5) {
            myRoom.roomStage = 1.6;
            console.log("LOG: Room " + myRoom.name + " increased to room stage 1.6");
            return true;
        }
        return false;
    },
    down: function (myRoom: MyRoom, room: Room): boolean {
        if (globalFunctions.amountOfStructure(room, STRUCTURE_EXTENSION) < 5) {
            myRoom.roomStage = 1.3;
            console.log("LOG: Room " + myRoom.name + " decreased to room stage 1.3");
            return true;
        }
        return false;
    },
    step: function (myRoom: MyRoom, room: Room): void {
        globalFunctions.buildExtensions(myRoom, 5);
    }
};
