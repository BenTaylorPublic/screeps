import { GlobalFunctions } from "global.functions";

export const stage0_5: StageController = {
    /*
    0.5 ->  1   : Room has >= 1 spawn
    0.5 <-  1   : Room has < 1 spawns
    */
    up: function (myRoom: MyRoom, room: Room): boolean {
        stage0_5.step(myRoom, room);
        if (GlobalFunctions.amountOfStructure(room, STRUCTURE_SPAWN) >= 1) {
            //Spawn has been made
            myRoom.roomStage = 1;
            console.log("LOG: Room " + myRoom.name + " increased to room stage 1");
            return true;
        }
        return false;
    },
    down: function (myRoom: MyRoom, room: Room): boolean {
        if (GlobalFunctions.amountOfStructure(room, STRUCTURE_SPAWN) === 0) {
            //Spawn has been made
            myRoom.roomStage = 0.5;
            console.log("LOG: Room " + myRoom.name + " decreased to room stage 0.5");
            return true;
        }
        return false;
    },
    step: function (myRoom: MyRoom, room: Room): void {
        console.log("ATTENTION: Room " + room.name + " needs first spawn");
    }
};
