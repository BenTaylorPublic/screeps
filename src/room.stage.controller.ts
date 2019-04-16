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

            1   ->  1.5 : RCL is level >= 2
            1   <-  1.5 : RCL is level < 2

            1.5 ->  2   : Room has >= 5 extensions
            1.5 <-  2   : Room has < 5 extensions

            2   ->  2.2 : RCL is level >= 3
            2   <-  2.2 : RCL is level < 3

            2.2 ->  2.4 : Room has >= 1 tower
            2.2 <-  2.4 : Room has < 1 tower

            2.4 ->  2.6 : Room has caches and a bank (container OR storage)
            2.4 <-  2.6 : Not every source has a cache, or bank is missing

            2.6 ->  2.8 : For atleast 1 source, have a miner and >= 1 hauler
            2.6 <-  2.8 : No sources have a miner and >= 1 hauler

            2.8 ->  3   : Room has >= 10 extensions
            2.8 <-  3   : Room has < 10 extensions

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
        if (myRoom.roomStage === 1.5) {
            stage1_5Up(myRoom, room);
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
        if (myRoom.roomStage >= 1.5) {
            stage1_5Down(myRoom, room);
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

function stage1Down(myRoom: MyRoom, room: Room): boolean {
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

function stage1Up(myRoom: MyRoom, room: Room): boolean {
    // 1   ->  1.5   : RCL is level >= 2
    if (room.controller != null &&
        room.controller.level >= 2) {
        myRoom.roomStage = 1.5;
        console.log("LOG: Room " + myRoom.name + " increased to room stage 1.5");
        return true;
    }
    return false;
}

function stage1_5Down(myRoom: MyRoom, room: Room): boolean {
    // 1   <-  1.5   : RCL is level < 2
    if (room.controller == null ||
        room.controller.level < 2) {
        myRoom.roomStage = 1;
        console.log("LOG: Room " + myRoom.name + " decreased to room stage 1");
        return true;
    }
    return false;
}

function stage1_5Up(myRoom: MyRoom, room: Room): boolean {
    // 1.5   ->  2   : Room has >= 5 extensions
    if (amountOfStructure(room, STRUCTURE_EXTENSION) >= 5) {
        myRoom.roomStage = 2;
        console.log("LOG: Room " + myRoom.name + " increased to room stage 2");
        return true;
    }
    return false;
}

function stage2Down(myRoom: MyRoom, room: Room): boolean {
    // 1.5   <-  2   : Room has < 5 extensions
    if (amountOfStructure(room, STRUCTURE_EXTENSION) < 5) {
        myRoom.roomStage = 1.5;
        console.log("LOG: Room " + myRoom.name + " decreased to room stage 1.5");
        return true;
    }
    return false;
}

function stage2Up(myRoom: MyRoom, room: Room): boolean {
    // 2   ->  2.2 : RCL is level >= 3
    if (room.controller != null &&
        room.controller.level >= 3) {
        myRoom.roomStage = 2.2;
        console.log("LOG: Room " + myRoom.name + " increased to room stage 2.2");
        return true;
    }
    return false;
}

function stage2_2Down(myRoom: MyRoom, room: Room): boolean {
    // 2   <-  2.2 : RCL is level < 3
    if (room.controller == null ||
        room.controller.level < 3) {
        myRoom.roomStage = 2;
        console.log("LOG: Room " + myRoom.name + " decreased to room stage 2");
        return true;
    }
    return false;
}

function stage2_2Up(myRoom: MyRoom, room: Room): boolean {
    // 2.2 ->  2.4 : Room has >= 1 tower
    const towers: StructureTower[] = room.find<StructureTower>(FIND_STRUCTURES, {
        filter: (structure: Structure) => {
            return structure.structureType === STRUCTURE_TOWER;
        }
    });

    if (towers.length >= 1) {
        //Tower has been built
        myRoom.roomStage = 2.4;
        console.log("LOG: Room " + myRoom.name + " increased to room stage 2.4");
        return true;
    }

    const constructionSites: ConstructionSite<BuildableStructureConstant>[]
        = room.find(FIND_CONSTRUCTION_SITES);
    for (let i = 0; i < constructionSites.length; i++) {
        const constructionSite: ConstructionSite<BuildableStructureConstant> = constructionSites[i];
        if (constructionSite.structureType === STRUCTURE_TOWER) {
            //The tower is being build, don't log ATTENTION
            return false;
        }
    }

    console.log("ATTENTION: Room " + myRoom.name + " needs a tower placed to progress to 2.4");
    return false;
}

function stage2_4Down(myRoom: MyRoom, room: Room): boolean {
    // 2.2 <-  2.4 : Room has < 1 tower
    const towers: StructureTower[] = room.find<StructureTower>(FIND_STRUCTURES, {
        filter: (structure: Structure) => {
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

function stage2_4Up(myRoom: MyRoom, room: Room): boolean {
    // 2.4 ->  2.6 : Room has caches and a bank (container OR storage)
    for (let i = 0; i < myRoom.mySources.length; i++) {
        const mySource: MySource = myRoom.mySources[i];
        if (mySource.cachePos == null) {
            return false;
        }

        const cachePos: RoomPosition
            = new RoomPosition(mySource.cachePos.x,
                mySource.cachePos.y,
                mySource.cachePos.roomName);

        let cache: StructureContainer | null = null;

        const structures1: Structure<StructureConstant>[] = cachePos.lookFor(LOOK_STRUCTURES);
        for (let j = 0; j < structures1.length; j++) {
            const structure: Structure = structures1[j];
            if (structure.structureType === STRUCTURE_CONTAINER) {
                cache = structure as StructureContainer;
            }
        }

        if (cache == null) {
            return false;
        }

        //If it gets to here, this source has a cache, so go to the next source
    }

    //Checking if the bank is built
    if (myRoom.bankPos == null) {
        //TODO: Check if there exists a container or storage that isn't within 1 square of a source
        //TODO: If so, assume it's a bank
        console.log("ATTENTION: Room " + myRoom.name + " needs a bank pos to progress to 2.6");
        return false;
    }

    const bankPos: RoomPosition
        = new RoomPosition(myRoom.bankPos.x,
            myRoom.bankPos.y,
            myRoom.bankPos.roomName);

    let bankFound: boolean = false;

    const structures2: Structure<StructureConstant>[] = bankPos.lookFor(LOOK_STRUCTURES);
    for (let i = 0; i < structures2.length; i++) {
        const structure: Structure = structures2[i];
        if (structure.structureType === STRUCTURE_CONTAINER) {
            bankFound = true;
            break;
        } else if (structure.structureType === STRUCTURE_STORAGE) {
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

function stage2_6Down(myRoom: MyRoom, room: Room): boolean {
    // 2.4 <-  2.6 : Not every source has a cache, or bank is missing
    let foundSomethingWrong: boolean = false;

    for (let i = 0; i < myRoom.mySources.length; i++) {
        const mySource: MySource = myRoom.mySources[i];
        if (mySource.cachePos == null) {
            foundSomethingWrong = true;
            break;
        }

        const cachePos: RoomPosition
            = new RoomPosition(mySource.cachePos.x,
                mySource.cachePos.y,
                mySource.cachePos.roomName);

        let cache: StructureContainer | null = null;

        const structures1: Structure<StructureConstant>[] = cachePos.lookFor(LOOK_STRUCTURES);
        for (let j = 0; j < structures1.length; j++) {
            const structure: Structure = structures1[j];
            if (structure.structureType === STRUCTURE_CONTAINER) {
                cache = structure as StructureContainer;
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
    } else {
        const bankPos: RoomPosition
            = new RoomPosition(myRoom.bankPos.x,
                myRoom.bankPos.y,
                myRoom.bankPos.roomName);

        let bankFound: boolean = false;

        const structures2: Structure<StructureConstant>[] = bankPos.lookFor(LOOK_STRUCTURES);
        for (let i = 0; i < structures2.length; i++) {
            const structure: Structure = structures2[i];
            if (structure.structureType === STRUCTURE_CONTAINER) {
                bankFound = true;
                break;
            } else if (structure.structureType === STRUCTURE_STORAGE) {
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

function stage2_6Up(myRoom: MyRoom, room: Room): boolean {
    // 2.6 ->  2.8 : For atleast 1 source, have a miner and >= 1 hauler
    for (let i = 0; i < myRoom.mySources.length; i++) {
        const mySource: MySource = myRoom.mySources[i];
        if (mySource.minerName != null &&
            mySource.haulerNames.length > 0) {
            myRoom.roomStage = 2.8;
            console.log("LOG: Room " + myRoom.name + " increased to room stage 2.8");
            return true;
        }
    }
    return false;
}

function stage2_8Down(myRoom: MyRoom, room: Room): boolean {
    // 2.6 <-  2.8 : No sources have a miner and >= 1 hauler
    for (let i = 0; i < myRoom.mySources.length; i++) {
        const mySource: MySource = myRoom.mySources[i];
        if (mySource.minerName != null &&
            mySource.haulerNames.length >= 1) {
            return false;
        }
    }
    myRoom.roomStage = 2.6;
    console.log("LOG: Room " + myRoom.name + " decreased to room stage 2.6");
    return true;
}

function stage2_8Up(myRoom: MyRoom, room: Room): boolean {
    // 2.8 ->  3   : Room has >= 10 extensions
    if (amountOfStructure(room, STRUCTURE_EXTENSION) >= 10) {
        myRoom.roomStage = 3;
        console.log("LOG: Room " + myRoom.name + " increased to room stage 3");
        return true;
    }
    return false;
}

function stage3Down(myRoom: MyRoom, room: Room): boolean {
    // 2.8 <-  3   : Room has < 10 extensions
    if (amountOfStructure(room, STRUCTURE_EXTENSION) < 10) {
        myRoom.roomStage = 2.8;
        console.log("LOG: Room " + myRoom.name + " decreased to room stage 2.8");
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
    const storages: StructureStorage[] = room.find<StructureStorage>(FIND_STRUCTURES, {
        filter: (structure: Structure) => {
            return structure.structureType === STRUCTURE_STORAGE;
        }
    });

    if (storages.length === 1) {
        myRoom.roomStage = 4;
        console.log("LOG: Room " + myRoom.name + " increased to room stage 4");
        return true;
    }
    return false;
}

function stage4Down(myRoom: MyRoom, room: Room): boolean {
    // 3.6 <-  4   : Room does not have a storage bank
    const storages: StructureStorage[] = room.find<StructureStorage>(FIND_STRUCTURES, {
        filter: (structure: Structure) => {
            return structure.structureType === STRUCTURE_STORAGE;
        }
    });

    if (storages.length === 0) {
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
