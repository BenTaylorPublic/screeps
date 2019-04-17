export const stageDefault: StageController = {
    /*
    -1  ->  0   : Get a room controller that's mine
    -1  <-  0   : Have no room controller that's mine
    */
    up: function (myRoom: MyRoom, room: Room): boolean {
        if (room.controller != null &&
            room.controller.my === true) {
            myRoom.roomStage = 0;
            console.log("LOG: Room " + myRoom.name + " increased to room stage 0");
            return true;
        }
        return false;
    },
    down: function (myRoom: MyRoom, room: Room): boolean {
        if (room.controller == null ||
            room.controller.my === false) {
            myRoom.roomStage = -1;
            console.log("LOG: Room " + myRoom.name + " decreased to room stage -1");
            return true;
        }
        return false;
    },
    step: function (myRoom: MyRoom, room: Room): void {
        //No steps
    }
};
