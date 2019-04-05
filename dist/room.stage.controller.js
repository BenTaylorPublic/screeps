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

            0   ->  0.5 : RCL is level 1
            0   <-  0.5 : RCL is level 0

            0.5 ->  1   : Room has >=1 spawn
            0.5 <-  1   : Room has 0 spawns

            1   ->  2   : RCL is level 2
            1   <-  2   : RCL is level <= 1

            2.2 = rcl 3, start building tower
            2.4 = tower built, start building containers
            2.6 = caches and bank built, start creating miners and haulers
            2.8 = miners and haulers all assigned
            3   = bank hit cap, spawn builders
            TODO: Define more stages
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
        stage3Down(myRoom, room);
        stage2_8Down(myRoom, room);
        stage2_6Down(myRoom, room);
        stage2_4Down(myRoom, room);
        stage2_2Down(myRoom, room);
        stage2Down(myRoom, room);
        stage1Down(myRoom, room);
        stage0_5Down(myRoom, room);
    }
};
function stage0Up(myRoom, room) {
    if (room.controller != null &&
        room.controller.level >= 1) {
        myRoom.roomStage = 0.5;
        console.log("LOG: Room " + myRoom.name + " increased to room stage 0.5");
        return true;
    }
    return false;
}
function stage0_5Down(myRoom, room) {
    if (room.controller == null ||
        room.controller.level === 0) {
        myRoom.roomStage = 0;
        console.log("LOG: Room " + myRoom.name + " decreased to room stage 0");
        return true;
    }
    return false;
}
function stage0_5Up(myRoom, room) {
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
    for (const spawnName in Game.spawns) {
        if (Game.spawns[spawnName].room.name === myRoom.name) {
            //Spawn has been made
            return false;
        }
    }
    myRoom.roomStage = 0.5;
    console.log("LOG: Room " + myRoom.name + " decreased to room stage 0.5");
    return true;
}
function stage1Up(myRoom, room) {
    if (room.controller != null &&
        room.controller.level >= 2) {
        myRoom.roomStage = 2;
        console.log("LOG: Room " + myRoom.name + " increased to room stage 2");
        return true;
    }
    return false;
}
function stage2Down(myRoom, room) {
    if (room.controller == null ||
        room.controller.level <= 1) {
        myRoom.roomStage = 1;
        console.log("LOG: Room " + myRoom.name + " decreased to room stage 1");
        return true;
    }
    return false;
}
function stage2Up(myRoom, room) {
    if (room.controller != null &&
        room.controller.level >= 3) {
        myRoom.roomStage = 2.2;
        console.log("LOG: Room " + myRoom.name + " increased to room stage 2.2");
        return true;
    }
    return false;
}
function stage2_2Down(myRoom, room) {
    if (room.controller == null ||
        room.controller.level <= 2) {
        myRoom.roomStage = 2;
        console.log("LOG: Room " + myRoom.name + " decreased to room stage 2");
        return true;
    }
    return false;
}
function stage2_2Up(myRoom, room) {
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
    const towers = room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return structure.structureType === STRUCTURE_TOWER;
        }
    });
    if (towers.length === 0) {
        myRoom.roomStage = 2.2;
        console.log("LOG: Room " + myRoom.name + " decreased to room stage 2.2");
        return true;
    }
    return false;
}
function stage2_4Up(myRoom, room) {
    const containers = room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return structure.structureType === STRUCTURE_CONTAINER;
        }
    });
    //TODO: Doesn't work with storage bank
    if (containers.length >= room.find(FIND_SOURCES_ACTIVE).length + 1) {
        //Caches and bank must be built
        myRoom.roomStage = 2.6;
        console.log("LOG: Room " + myRoom.name + " increased to room stage 2.6");
        return true;
    }
    return false;
}
function stage2_6Down(myRoom, room) {
    const containers = room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return structure.structureType === STRUCTURE_CONTAINER;
        }
    });
    //TODO: Doesn't work with storage bank
    if (containers.length < room.find(FIND_SOURCES_ACTIVE).length + 1) {
        //Caches and bank must be built
        myRoom.roomStage = 2.4;
        console.log("LOG: Room " + myRoom.name + " decreased to room stage 2.4");
        return true;
    }
    return false;
}
function stage2_6Up(myRoom, room) {
    let haulerAmount = 0;
    let minerAmount = 0;
    for (let i = 0; i < myRoom.myCreeps.length; i++) {
        const myCreep = myRoom.myCreeps[i];
        if (myCreep.role === "Hauler") {
            haulerAmount++;
        }
        else if (myCreep.role === "Miner") {
            minerAmount++;
        }
    }
    const amountOfSources = room.find(FIND_SOURCES_ACTIVE).length;
    if (haulerAmount >= amountOfSources &&
        minerAmount >= amountOfSources) {
        myRoom.roomStage = 2.8;
        console.log("LOG: Room " + myRoom.name + " increased to room stage 2.8");
        return true;
    }
    return false;
}
function stage2_8Down(myRoom, room) {
    //Impossible to downgrade from this
    return false;
}
function stage2_8Up(myRoom, room) {
    //Ensure there's a bank container OR storage, and its full
    if (myRoom.bankPos == null) {
        console.log("ERR: Room's bank pos was null");
        return false;
    }
    const bankPos = new RoomPosition(myRoom.bankPos.x, myRoom.bankPos.y, myRoom.bankPos.roomName);
    let bank = null;
    const structures = bankPos.lookFor(LOOK_STRUCTURES);
    for (let i = 0; i < structures.length; i++) {
        const structure = structures[i];
        if (structure.structureType === STRUCTURE_CONTAINER) {
            bank = structure;
            break;
        }
        else if (structure.structureType === STRUCTURE_STORAGE) {
            bank = structure;
            break;
        }
    }
    if (bank == null) {
        console.log("ERR: Bank is null when checking if it's full");
        return false;
    }
    if (bank.store[RESOURCE_ENERGY] === bank.storeCapacity) {
        myRoom.roomStage = 3;
        console.log("LOG: Room " + myRoom.name + " increased to room stage 3");
        return true;
    }
    return false;
}
function stage3Down(myRoom, room) {
    //Impossible to downgrade from this
    return false;
}
