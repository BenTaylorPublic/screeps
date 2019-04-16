export const roomStageController: any = {
    run: function (myRoom: MyRoom) {
        const room: Room = Game.rooms[myRoom.name];

        /*
            Loosely based on RCL
            -1 is default room level

            -1  ->  0   : Get a room controller that's mine
            -1  <-  0   : Have no room controller that's mine

            0   ->  0.5 : RCL is level >= 1
            0   <-  0.5 : RCL is level < 1

            0.5 ->  1   : Room has >= 1 spawn
            0.5 <-  1   : Room has < 1 spawns

            1   ->  1.3 : RCL is level >= 2
            1   <-  1.3 : RCL is level < 2

            1.3 ->  1.6 : Room has >= 5 extensions
            1.3 ->  1.6 : Room has < 5 extensions

            1.6 ->  2   : Room has caches length >= source amount
            1.6 ->  2   : Room has caches length <= source amount

            2   ->  2.3 : RCL is level >= 3
            2   <-  2.3 : RCL is level < 3

            2.3 ->  2.6 : Room has >= 1 tower
            2.3 <-  2.6 : Room has < 1 tower

            2.6 ->  3   : Room has >= 10 extensions
            2.6 <-  3   : Room has < 10 extensions

            3   ->  3.3 : RCL is level >= 4
            3   <-  3.3 : RCL is level < 4

            3.3 ->  3.6 : Room has >= 20 extensions
            3.3 <-  3.6 : Room has < 20 extensions

            3.6 ->  4   : Room has a storage bank
            3.6 <-  4   : Room does not have a storage bank
         */

        if (room.controller == null ||
            room.controller.my === false) {
            //Room has no controller, or is not my room
            myRoom.roomStage = -1;
            return; //Do not continue
        }

        //You can only go up if you are on the one being tested
        if (myRoom.roomStage === 0) {
            stage0Up(myRoom, room);
        }
        if (myRoom.roomStage === 0.5) {
            stage0_5Up(myRoom, room);
        }
        if (myRoom.roomStage === 1) {
            stage1Up(myRoom, room);
        }
        if (myRoom.roomStage === 1.3) {
            stage1_3Up(myRoom, room);
        }
        if (myRoom.roomStage === 1.6) {
            stage1_6Up(myRoom, room);
        }
        if (myRoom.roomStage === 2) {
            stage2Up(myRoom, room);
        }
        if (myRoom.roomStage === 2.3) {
            stage2_3Up(myRoom, room);
        }
        if (myRoom.roomStage === 2.6) {
            stage2_6Up(myRoom, room);
        }
        if (myRoom.roomStage === 3) {
            stage3Up(myRoom, room);
        }
        if (myRoom.roomStage === 3.3) {
            stage3_3Up(myRoom, room);
        }
        if (myRoom.roomStage === 3.6) {
            stage3_6Up(myRoom, room);
        }

        //You can always go down, to any stage
        if (myRoom.roomStage >= 4) {
            stage4Down(myRoom, room);
        }
        if (myRoom.roomStage >= 3.6) {
            stage3_6Down(myRoom, room);
        }
        if (myRoom.roomStage >= 3.3) {
            stage3_3Down(myRoom, room);
        }
        if (myRoom.roomStage >= 3) {
            stage3Down(myRoom, room);
        }
        if (myRoom.roomStage >= 2.6) {
            stage2_6Down(myRoom, room);
        }
        if (myRoom.roomStage >= 2.3) {
            stage2_3Down(myRoom, room);
        }
        if (myRoom.roomStage >= 2) {
            stage2Down(myRoom, room);
        }
        if (myRoom.roomStage >= 1.6) {
            stage1_6Down(myRoom, room);
        }
        if (myRoom.roomStage >= 1.3) {
            stage1_3Down(myRoom, room);
        }
        if (myRoom.roomStage >= 1) {
            stage1Down(myRoom, room);
        }
        if (myRoom.roomStage >= 0.5) {
            stage0_5Down(myRoom, room);
        }
    }
};

function stage0Up(myRoom: MyRoom, room: Room): boolean {
    // -1  ->  0   : Get a room controller that's mine
    if (room.controller != null &&
        room.controller.level >= 1) {
        myRoom.roomStage = 0.5;
        console.log("LOG: Room " + myRoom.name + " increased to room stage 0.5");
        return true;
    }
    return false;
}

function stage0_5Down(myRoom: MyRoom, room: Room): boolean {
    // 0  <-  0.5   : RCL is level < 1
    if (room.controller == null ||
        room.controller.level < 1) {
        myRoom.roomStage = 0;
        console.log("LOG: Room " + myRoom.name + " decreased to room stage 0");
        return true;
    }
    return false;
}

function stage0_5Up(myRoom: MyRoom, room: Room): boolean {
    // 0.5 ->  1   : Room has >= 1 spawn
    if (amountOfStructure(room, STRUCTURE_SPAWN) >= 1) {
        //Spawn has been made
        myRoom.roomStage = 1;
        console.log("LOG: Room " + myRoom.name + " increased to room stage 1");
        return true;
    }
    return false;
}

function stage1Down(myRoom: MyRoom, room: Room): boolean {
    // 0.5 <-  1   : Room has < 1 spawns
    if (amountOfStructure(room, STRUCTURE_SPAWN) === 0) {
        //Spawn has been made
        myRoom.roomStage = 0.5;
        console.log("LOG: Room " + myRoom.name + " decreased to room stage 0.5");
        return true;
    }
    return false;
}

function stage1Up(myRoom: MyRoom, room: Room): boolean {
    // 1   ->  1.3   : RCL is level >= 2
    if (room.controller != null &&
        room.controller.level >= 2) {
        myRoom.roomStage = 1.3;
        console.log("LOG: Room " + myRoom.name + " increased to room stage 1.3");
        return true;
    }
    return false;
}


function stage2Up(myRoom: MyRoom, room: Room): boolean {
    // 2   ->  2.2 : RCL is level >= 3
    if (room.controller != null &&
        room.controller.level >= 3) {
        myRoom.roomStage = 2.3;
        console.log("LOG: Room " + myRoom.name + " increased to room stage 2.3");
        return true;
    }
    return false;
}

function stage3Up(myRoom: MyRoom, room: Room): boolean {
    // 3   ->  3.3 : RCL is level >= 4
    if (room.controller != null &&
        room.controller.level >= 4) {
        myRoom.roomStage = 3.3;
        console.log("LOG: Room " + myRoom.name + " increased to room stage 3.3");
        return true;
    }
    return false;
}

function stage3_3Down(myRoom: MyRoom, room: Room): boolean {
    // 3   <-  3.3 : RCL is level < 4
    if (room.controller == null ||
        room.controller.level < 4) {
        myRoom.roomStage = 3;
        console.log("LOG: Room " + myRoom.name + " decreased to room stage 3");
        return true;
    }
    return false;
}

function stage3_3Up(myRoom: MyRoom, room: Room): boolean {
    // 3.3 ->  3.6 : Room has >= 20 extensions
    if (amountOfStructure(room, STRUCTURE_EXTENSION) >= 20) {
        myRoom.roomStage = 3.6;
        console.log("LOG: Room " + myRoom.name + " increased to room stage 3.6");
        return true;
    }
    return false;
}

function stage3_6Down(myRoom: MyRoom, room: Room): boolean {
    // 3.3 <-  3.6 : Room has < 20 extensions
    if (amountOfStructure(room, STRUCTURE_EXTENSION) < 20) {
        myRoom.roomStage = 3.3;
        console.log("LOG: Room " + myRoom.name + " decreased to room stage 3.3");
        return true;
    }
    return false;
}

function stage3_6Up(myRoom: MyRoom, room: Room): boolean {
    // 3.6 ->  4   : Room has a storage bank
    if (amountOfStructure(room, STRUCTURE_STORAGE) === 1) {
        myRoom.roomStage = 4;
        console.log("LOG: Room " + myRoom.name + " increased to room stage 4");
        return true;
    }
    return false;
}

function stage4Down(myRoom: MyRoom, room: Room): boolean {
    // 3.6 <-  4   : Room does not have a storage bank
    if (amountOfStructure(room, STRUCTURE_STORAGE) === 0) {
        myRoom.roomStage = 3.6;
        console.log("LOG: Room " + myRoom.name + " decreased to room stage 3");
        return true;
    }
    return false;
}

/*
    NOT STAGE UP/DOWN HELPERS
 */
function amountOfStructure(room: Room, structureConstant: StructureConstant): number {
    const extensions: StructureExtension[] = room.find<StructureExtension>(FIND_STRUCTURES, {
        filter: (structure: Structure) => {
            return structure.structureType === structureConstant;
        }
    });
    return extensions.length;
}
