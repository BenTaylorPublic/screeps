export const stage0: StageController = {
    /*
    0   ->  0.3 : RCL is level >= 1
    0   <-  0.3 : RCL is level < 1
    */
    up: function (myRoom: MyRoom, room: Room): boolean {
        if (room.controller != null &&
            room.controller.level >= 1) {
            myRoom.roomStage = 0.3;
            console.log("LOG: Room " + myRoom.name + " increased to room stage 0.3");
            return true;
        }
        return false;
    },
    down: function (myRoom: MyRoom, room: Room): boolean {
        if (room.controller == null ||
            room.controller.level < 1) {
            myRoom.roomStage = 0;
            console.log("LOG: Room " + myRoom.name + " decreased to room stage 0");
            return true;
        }
        return false;
    },
    step: function (myRoom: MyRoom, room: Room): void {
        //No steps
    }
};
