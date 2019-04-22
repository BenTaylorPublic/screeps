import { GlobalFunctions } from "global.functions";

export const stage4_2: StageController = {
    /*
    4.2 ->  4.4 : Room has >= 2 tower
    4.2 <-  4.4 : Room has < 2 tower
    */
    up: function (myRoom: MyRoom, room: Room): boolean {
        stage4_2.step(myRoom, room);
        if (GlobalFunctions.amountOfStructure(room, STRUCTURE_TOWER) >= 2) {
            myRoom.roomStage = 4.4;
            console.log("LOG: Room " + myRoom.name + " increased to room stage 4.4");
            return true;
        }
        return false;
    },
    down: function (myRoom: MyRoom, room: Room): boolean {
        if (GlobalFunctions.amountOfStructure(room, STRUCTURE_TOWER) < 2) {
            myRoom.roomStage = 4.2;
            console.log("LOG: Room " + myRoom.name + " decreased to room stage 4.2");
            return true;
        }
        return false;
    },
    step: function (myRoom: MyRoom, room: Room): void {
        GlobalFunctions.buildTowers(myRoom, 2);
    }
};
