export const stage0: StageController = {
    /*
    0   ->  0.5 : RCL is level >= 1
    0   <-  0.5 : RCL is level < 1
    */
    up: function (myRoom: MyRoom, room: Room): boolean {
        if (room.controller != null &&
            room.controller.level >= 1) {
            myRoom.roomStage = 0.5;
            console.log("LOG: Room " + myRoom.name + " increased to room stage 0.5");
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
