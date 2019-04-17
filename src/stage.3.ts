export const stage3: StageController = {
    /*
    3   ->  3.3 : RCL is level >= 4
    3   <-  3.3 : RCL is level < 4
    */
    up: function (myRoom: MyRoom, room: Room): boolean {
        if (room.controller != null &&
            room.controller.level >= 4) {
            myRoom.roomStage = 3.3;
            console.log("LOG: Room " + myRoom.name + " increased to room stage 3.3");
            return true;
        }
        return false;
    },
    down: function (myRoom: MyRoom, room: Room): boolean {
        if (room.controller == null ||
            room.controller.level < 4) {
            myRoom.roomStage = 3;
            console.log("LOG: Room " + myRoom.name + " decreased to room stage 3");
            return true;
        }
        return false;
    },
    step: function (myRoom: MyRoom, room: Room): void {
        //No steps
    }
};
