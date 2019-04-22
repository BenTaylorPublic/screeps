import { GlobalFunctions } from "global.functions";

export const stage3_3: StageController = {
    /*
    3.3 ->  3.6 : Room has >= 20 extensions
    3.3 <-  3.6 : Room has < 20 extensions
    */
    up: function (myRoom: MyRoom, room: Room): boolean {
        stage3_3.step(myRoom, room);
        if (GlobalFunctions.amountOfStructure(room, STRUCTURE_EXTENSION) >= 20) {
            myRoom.roomStage = 3.6;
            console.log("LOG: Room " + myRoom.name + " increased to room stage 3.6");
            return true;
        }
        return false;
    },
    down: function (myRoom: MyRoom, room: Room): boolean {
        if (GlobalFunctions.amountOfStructure(room, STRUCTURE_EXTENSION) < 20) {
            myRoom.roomStage = 3.3;
            console.log("LOG: Room " + myRoom.name + " decreased to room stage 3.3");
            return true;
        }
        return false;
    },
    step: function (myRoom: MyRoom, room: Room): void {
        GlobalFunctions.buildExtensions(myRoom, 20);
    }
};
