import { global } from "global";

export const stage2_3: StageController = {
    /*
    2.3 ->  2.6 : Room has >= 1 tower
    2.3 <-  2.6 : Room has < 1 tower
    */
    up: function (myRoom: MyRoom, room: Room): boolean {
        if (global.amountOfStructure(room, STRUCTURE_TOWER) >= 1) {
            myRoom.roomStage = 2.6;
            console.log("LOG: Room " + myRoom.name + " increased to room stage 2.6");
            return true;
        }
        return false;
    },
    down: function (myRoom: MyRoom, room: Room): boolean {
        if (global.amountOfStructure(room, STRUCTURE_TOWER) < 1) {
            myRoom.roomStage = 2.3;
            console.log("LOG: Room " + myRoom.name + " decreased to room stage 2.3");
            return true;
        }
        return false;
    },
    step: function (myRoom: MyRoom, room: Room): void {
        global.buildTowers(myRoom, 1);
    }
};
