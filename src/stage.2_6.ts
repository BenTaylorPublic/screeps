import { globalFunctions } from "global.functions";

export const stage2_6: StageController = {
    /*
    2.6 ->  3   : Room has >= 10 extensions
    2.6 <-  3   : Room has < 10 extensions
    */
    up: function (myRoom: MyRoom, room: Room): boolean {
        stage2_6.step(myRoom, room);
        if (globalFunctions.amountOfStructure(room, STRUCTURE_EXTENSION) >= 10) {
            myRoom.roomStage = 3;
            console.log("LOG: Room " + myRoom.name + " increased to room stage 3");
            return true;
        }
        return false;
    },
    down: function (myRoom: MyRoom, room: Room): boolean {
        if (globalFunctions.amountOfStructure(room, STRUCTURE_EXTENSION) < 10) {
            myRoom.roomStage = 2.6;
            console.log("LOG: Room " + myRoom.name + " decreased to room stage 2.6");
            return true;
        }
        return false;
    },
    step: function (myRoom: MyRoom, room: Room): void {
        globalFunctions.buildExtensions(myRoom, 10);
    }
};
