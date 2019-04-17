export const stage1: StageController = {
    /*
    1   ->  1.5 : RCL is level >= 2
    1   <-  1.5 : RCL is level < 2
    */
    up: function (myRoom: MyRoom, room: Room): boolean {
        if (room.controller != null &&
            room.controller.level >= 2) {
            myRoom.roomStage = 1.5;
            console.log("LOG: Room " + myRoom.name + " increased to room stage 1.5");
            return true;
        }
        return false;
    },
    down: function (myRoom: MyRoom, room: Room): boolean {
        if (room.controller == null ||
            room.controller.level < 2) {
            myRoom.roomStage = 1;
            console.log("LOG: Room " + myRoom.name + " decreased to room stage 1");
            return true;
        }
        return false;
    },
    step: function (myRoom: MyRoom, room: Room): void {
        //No steps
    }
};
