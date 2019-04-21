export const stage4: StageController = {
    /*
    4   ->  4.2 : RCL is level >= 5
    4   <-  4.2 : RCL is level < 5
    */
    up: function (myRoom: MyRoom, room: Room): boolean {
        if (room.controller != null &&
            room.controller.level >= 5) {
            myRoom.roomStage = 4.2;
            console.log("LOG: Room " + myRoom.name + " increased to room stage 4.2");
            return true;
        }
        return false;
    },
    down: function (myRoom: MyRoom, room: Room): boolean {
        if (room.controller == null ||
            room.controller.level < 5) {
            myRoom.roomStage = 4;
            console.log("LOG: Room " + myRoom.name + " decreased to room stage 4");
            return true;
        }
        return false;
    },
    step: function (myRoom: MyRoom, room: Room): void {
        //No steps
    }
};
