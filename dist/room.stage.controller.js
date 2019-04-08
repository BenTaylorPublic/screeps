"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roomStageController = {
    run: function (myRoom) {
        const room = Game.rooms[myRoom.name];
        /*
            Loosely based on RCL
            -1 is default room level

            -1  ->  0   : Get a room controller that's mine
            -1  <-  0   : Have no room controller that's mine

            0   ->  0.5 : RCL is level >= 1
            0   <-  0.5 : RCL is level < 1

            0.5 ->  1   : Room has >= 1 spawn
            0.5 <-  1   : Room has < 1 spawns

            1   ->  2   : RCL is level >= 2
            1   <-  2   : RCL is level < 2

            2   ->  2.2 : RCL is level >= 3
            2   <-  2.2 : RCL is level < 3

            2.2 ->  2.4 : Room has >= 1 tower
            2.2 <-  2.4 : Room has < 1 tower

            2.4 ->  2.6 : Room has caches and a bank (container OR storage)
            2.4 <-  2.6 : Not every source has a cache, or bank is missing

            2.6 ->  2.8 : For atleast 1 source, have a miner and >= 1 hauler
            2.6 <-  2.8 : No sources have a miner and >= 1 hauler

            2.8 ->  3   : >= 1 Laborer
            2.8 <-  3   : No laborers
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
        if (myRoom.roomStage === 2) {
            stage2Up(myRoom, room);
        }
        if (myRoom.roomStage === 2.2) {
            stage2_2Up(myRoom, room);
        }
        if (myRoom.roomStage === 2.4) {
            stage2_4Up(myRoom, room);
        }
        if (myRoom.roomStage === 2.6) {
            stage2_6Up(myRoom, room);
        }
        if (myRoom.roomStage === 2.8) {
            stage2_8Up(myRoom, room);
        }
        //You can always go down, to any stage
        if (myRoom.roomStage >= 3) {
            stage3Down(myRoom, room);
        }
        if (myRoom.roomStage >= 2.8) {
            stage2_8Down(myRoom, room);
        }
        if (myRoom.roomStage >= 2.6) {
            stage2_6Down(myRoom, room);
        }
        if (myRoom.roomStage >= 2.4) {
            stage2_4Down(myRoom, room);
        }
        if (myRoom.roomStage >= 2.2) {
            stage2_2Down(myRoom, room);
        }
        if (myRoom.roomStage >= 2) {
            stage2Down(myRoom, room);
        }
        if (myRoom.roomStage >= 1) {
            stage1Down(myRoom, room);
        }
        if (myRoom.roomStage >= 0.5) {
            stage0_5Down(myRoom, room);
        }
    }
};
function stage0Up(myRoom, room) {
    // -1  ->  0   : Get a room controller that's mine
    if (room.controller != null &&
        room.controller.level >= 1) {
        myRoom.roomStage = 0.5;
        console.log("LOG: Room " + myRoom.name + " increased to room stage 0.5");
        return true;
    }
    return false;
}
function stage0_5Down(myRoom, room) {
    // -1  <-  0   : Have no room controller that's mine
    if (room.controller == null ||
        room.controller.level < 1) {
        myRoom.roomStage = 0;
        console.log("LOG: Room " + myRoom.name + " decreased to room stage 0");
        return true;
    }
    return false;
}
function stage0_5Up(myRoom, room) {
    // 0.5 ->  1   : Room has >= 1 spawn
    //TODO: Works for now, but when myRoom.spawn is an array, use that
    for (const spawnName in Game.spawns) {
        if (Game.spawns[spawnName].room.name === myRoom.name) {
            //Spawn has been made
            myRoom.roomStage = 1;
            console.log("LOG: Room " + myRoom.name + " increased to room stage 1");
            return true;
        }
    }
    return false;
}
function stage1Down(myRoom, room) {
    // 0.5 <-  1   : Room has < 1 spawns
    //TODO: Works for now, but when myRoom.spawn is an array, use that
    for (const spawnName in Game.spawns) {
        if (Game.spawns[spawnName].room.name === myRoom.name) {
            //Spawn has already been made
            return false;
        }
    }
    myRoom.roomStage = 0.5;
    console.log("LOG: Room " + myRoom.name + " decreased to room stage 0.5");
    return true;
}
function stage1Up(myRoom, room) {
    // 1   ->  2   : RCL is level >= 2
    if (room.controller != null &&
        room.controller.level >= 2) {
        myRoom.roomStage = 2;
        console.log("LOG: Room " + myRoom.name + " increased to room stage 2");
        return true;
    }
    return false;
}
function stage2Down(myRoom, room) {
    // 1   <-  2   : RCL is level < 2
    if (room.controller == null ||
        room.controller.level < 2) {
        myRoom.roomStage = 1;
        console.log("LOG: Room " + myRoom.name + " decreased to room stage 1");
        return true;
    }
    return false;
}
function stage2Up(myRoom, room) {
    // 2   ->  2.2 : RCL is level >= 3
    if (room.controller != null &&
        room.controller.level >= 3) {
        myRoom.roomStage = 2.2;
        console.log("LOG: Room " + myRoom.name + " increased to room stage 2.2");
        return true;
    }
    return false;
}
function stage2_2Down(myRoom, room) {
    // 2   <-  2.2 : RCL is level < 3
    if (room.controller == null ||
        room.controller.level < 3) {
        myRoom.roomStage = 2;
        console.log("LOG: Room " + myRoom.name + " decreased to room stage 2");
        return true;
    }
    return false;
}
function stage2_2Up(myRoom, room) {
    // 2.2 ->  2.4 : Room has >= 1 tower
    const towers = room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return structure.structureType === STRUCTURE_TOWER;
        }
    });
    if (towers.length >= 1) {
        //Tower has been built
        myRoom.roomStage = 2.4;
        console.log("LOG: Room " + myRoom.name + " increased to room stage 2.4");
        return true;
    }
    return false;
}
function stage2_4Down(myRoom, room) {
    // 2.2 <-  2.4 : Room has < 1 tower
    const towers = room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return structure.structureType === STRUCTURE_TOWER;
        }
    });
    if (towers.length < 1) {
        myRoom.roomStage = 2.2;
        console.log("LOG: Room " + myRoom.name + " decreased to room stage 2.2");
        return true;
    }
    return false;
}
function stage2_4Up(myRoom, room) {
    // 2.4 ->  2.6 : Room has caches and a bank (container OR storage)
    for (let i = 0; i < myRoom.mySources.length; i++) {
        const mySource = myRoom.mySources[i];
        if (mySource.cachePos == null) {
            return false;
        }
        const cachePos = new RoomPosition(mySource.cachePos.x, mySource.cachePos.y, mySource.cachePos.roomName);
        let cache = null;
        const structures1 = cachePos.lookFor(LOOK_STRUCTURES);
        for (let j = 0; j < structures1.length; j++) {
            const structure = structures1[j];
            if (structure.structureType === STRUCTURE_CONTAINER) {
                cache = structure;
            }
        }
        if (cache == null) {
            return false;
        }
        //If it gets to here, this source has a cache, so go to the next source
    }
    //Checking if the bank is built
    if (myRoom.bankPos == null) {
        return false;
    }
    const bankPos = new RoomPosition(myRoom.bankPos.x, myRoom.bankPos.y, myRoom.bankPos.roomName);
    let bankFound = false;
    const structures2 = bankPos.lookFor(LOOK_STRUCTURES);
    for (let i = 0; i < structures2.length; i++) {
        const structure = structures2[i];
        if (structure.structureType === STRUCTURE_CONTAINER) {
            bankFound = true;
            break;
        }
        else if (structure.structureType === STRUCTURE_STORAGE) {
            bankFound = true;
            break;
        }
    }
    if (!bankFound) {
        return false;
    }
    //Sources have caches, bank has a container or storage
    myRoom.roomStage = 2.6;
    console.log("LOG: Room " + myRoom.name + " increased to room stage 2.6");
    return true;
}
function stage2_6Down(myRoom, room) {
    // 2.4 <-  2.6 : Not every source has a cache, or bank is missing
    let foundSomethingWrong = false;
    for (let i = 0; i < myRoom.mySources.length; i++) {
        const mySource = myRoom.mySources[i];
        if (mySource.cachePos == null) {
            foundSomethingWrong = true;
            break;
        }
        const cachePos = new RoomPosition(mySource.cachePos.x, mySource.cachePos.y, mySource.cachePos.roomName);
        let cache = null;
        const structures1 = cachePos.lookFor(LOOK_STRUCTURES);
        for (let j = 0; j < structures1.length; j++) {
            const structure = structures1[j];
            if (structure.structureType === STRUCTURE_CONTAINER) {
                cache = structure;
            }
        }
        if (cache == null) {
            foundSomethingWrong = true;
            break;
        }
        //If it gets to here, this source has a cache, so go to the next source
    }
    //Checking if the bank is built
    if (myRoom.bankPos == null) {
        foundSomethingWrong = true;
    }
    else {
        const bankPos = new RoomPosition(myRoom.bankPos.x, myRoom.bankPos.y, myRoom.bankPos.roomName);
        let bankFound = false;
        const structures2 = bankPos.lookFor(LOOK_STRUCTURES);
        for (let i = 0; i < structures2.length; i++) {
            const structure = structures2[i];
            if (structure.structureType === STRUCTURE_CONTAINER) {
                bankFound = true;
                break;
            }
            else if (structure.structureType === STRUCTURE_STORAGE) {
                bankFound = true;
                break;
            }
        }
        if (!bankFound) {
            foundSomethingWrong = true;
        }
    }
    if (foundSomethingWrong) {
        myRoom.roomStage = 2.4;
        console.log("LOG: Room " + myRoom.name + " decreased to room stage 2.4");
        return true;
    }
    return false;
}
function stage2_6Up(myRoom, room) {
    // 2.6 ->  2.8 : For atleast 1 source, have a miner and >= 1 hauler
    for (let i = 0; i < myRoom.mySources.length; i++) {
        const mySource = myRoom.mySources[i];
        if (mySource.minerName != null &&
            mySource.haulerNames.length > 0) {
            myRoom.roomStage = 2.8;
            console.log("LOG: Room " + myRoom.name + " increased to room stage 2.8");
            return true;
        }
    }
    return false;
}
function stage2_8Down(myRoom, room) {
    // 2.6 <-  2.8 : No sources have a miner and >= 1 hauler
    for (let i = 0; i < myRoom.mySources.length; i++) {
        const mySource = myRoom.mySources[i];
        if (mySource.minerName != null &&
            mySource.haulerNames.length >= 1) {
            return false;
        }
    }
    myRoom.roomStage = 2.6;
    console.log("LOG: Room " + myRoom.name + " decreased to room stage 2.6");
    return true;
}
function stage2_8Up(myRoom, room) {
    // 2.8 ->  3   : >= 1 Laborer
    let laborerCount = 0;
    for (let i = 0; i < myRoom.myCreeps.length; i++) {
        const myCreep = myRoom.myCreeps[i];
        if (myCreep.role === "Laborer") {
            laborerCount++;
            break;
        }
    }
    if (laborerCount > 0) {
        myRoom.roomStage = 3;
        console.log("LOG: Room " + myRoom.name + " increased to room stage 3");
        return true;
    }
    return false;
}
function stage3Down(myRoom, room) {
    // 2.8 <-  3   : No laborers
    let laborerCount = 0;
    for (let i = 0; i < myRoom.myCreeps.length; i++) {
        const myCreep = myRoom.myCreeps[i];
        if (myCreep.role === "Laborer") {
            laborerCount++;
            break;
        }
    }
    if (laborerCount > 0) {
        return false;
    }
    myRoom.roomStage = 2.8;
    console.log("LOG: Room " + myRoom.name + " decreased to room stage 2.8");
    return true;
}
