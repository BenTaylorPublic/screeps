import { globalFunctions } from "global.functions";

export const stage2_3: StageController = {
    /*
    2.3 ->  2.6 : Room has >= 1 tower
    2.3 <-  2.6 : Room has < 1 tower
    */
    up: function (myRoom: MyRoom, room: Room): boolean {
        if (globalFunctions.amountOfStructure(room, STRUCTURE_TOWER) >= 1) {
            myRoom.roomStage = 2.6;
            console.log("LOG: Room " + myRoom.name + " increased to room stage 2.6");
            return true;
        }
        return false;
    },
    down: function (myRoom: MyRoom, room: Room): boolean {
        if (globalFunctions.amountOfStructure(room, STRUCTURE_TOWER) < 1) {
            myRoom.roomStage = 2.3;
            console.log("LOG: Room " + myRoom.name + " decreased to room stage 2.3");
            return true;
        }
        return false;
    },
    step: function (myRoom: MyRoom, room: Room): void {
        globalFunctions.buildTowers(myRoom, 1);
    }
};
