import { globalFunctions } from "global.functions";

export const stage4_4: StageController = {
    /*
    4.4 ->  4.6   : Room has >= 30 extensions
    4.4 <-  4.6   : Room has < 30 extensions
    */
    up: function (myRoom: MyRoom, room: Room): boolean {
        if (globalFunctions.amountOfStructure(room, STRUCTURE_EXTENSION) >= 30) {
            myRoom.roomStage = 4.6;
            console.log("LOG: Room " + myRoom.name + " increased to room stage 4.6");
            return true;
        }
        return false;
    },
    down: function (myRoom: MyRoom, room: Room): boolean {
        if (globalFunctions.amountOfStructure(room, STRUCTURE_EXTENSION) < 30) {
            myRoom.roomStage = 4.4;
            console.log("LOG: Room " + myRoom.name + " decreased to room stage 4.4");
            return true;
        }
        return false;
    },
    step: function (myRoom: MyRoom, room: Room): void {
        globalFunctions.buildExtensions(myRoom, 30);
    }
};
