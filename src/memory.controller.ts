export const memoryController: any = {
    run: function () {
        clearDeadCreeps();
        ensureAllRoomsInMyMemory();
        validateRoomsInMyMemory();
    }
};

function clearDeadCreeps(): void {
    //Clear all dead creeps
    for (const i in Memory.creeps) {
        if (!Game.creeps[i]) {
            delete Memory.creeps[i];
        }
    }
}

function ensureAllRoomsInMyMemory(): void {

    //Ensuring all the rooms are in Memory.myMemory.myRooms
    for (const roomName in Game.rooms) {
        const room: Room = Game.rooms[roomName];

        let alreadyInMemory: boolean = false;
        if (room.controller == null ||
            room.controller.my === false) {
            //No need to process rooms that don't have controllers or are not mine
            //We only have access to these rooms through travelers (probs)
            alreadyInMemory = true;
        }

        for (let i = 0; i < Memory.myMemory.myRooms.length; i++) {
            const myRoom = Memory.myMemory.myRooms[i];
            if (myRoom.name === roomName) {
                alreadyInMemory = true;
            }
        }

        if (!alreadyInMemory) {
            //Add it
            console.log("LOG: Adding a new room " + roomName);
            const newMyRoom: MyRoom = {
                name: roomName,
                myCreeps: [],
                spawnName: null,
                mySources: [],
                roomStage: 0,
                bankPos: null
            };
            const sources: Source[] = room.find(FIND_SOURCES);
            for (let i = 0; i < sources.length; i++) {
                const source: Source = sources[i];
                newMyRoom.mySources.push({
                    id: source.id,
                    minerName: null,
                    haulerNames: [],
                    cachePos: null
                });
            }
            //Check the spawn
            const spawns: StructureSpawn[] = room.find<StructureSpawn>(FIND_MY_STRUCTURES,
                {
                    filter: { structureType: STRUCTURE_SPAWN }
                }
            );
            if (spawns.length >= 1) {
                newMyRoom.spawnName = spawns[0].name;
            }

            Memory.myMemory.myRooms.push(newMyRoom);
        }
    }
}

function validateRoomsInMyMemory(): void {
    //Validation of the myRooms
    for (let i = Memory.myMemory.myRooms.length - 1; i >= 0; i--) {
        const myRoom: MyRoom = Memory.myMemory.myRooms[i];
        const room: Room = Game.rooms[myRoom.name];
        if (room == null) {
            console.log("LOG: Lost vision of a room " + myRoom.name);
            Memory.myMemory.myRooms.splice(i, 1);
            continue;
        }

        for (let j = myRoom.myCreeps.length - 1; j >= 0; j--) {
            const myCreep: MyCreep = myRoom.myCreeps[j];
            if (Game.creeps[myCreep.name] == null) {
                handleCreepDying(myRoom, myCreep);
                myRoom.myCreeps.splice(j, 1);
            }
        }
    }
}

function handleCreepDying(myRoom: MyRoom, myCreep: MyCreep): void {
    //Creep is dead
    if (myCreep.role === "Miner") {
        //Need to check what source it was on
        for (let i = 0; i < myRoom.mySources.length; i++) {
            const mySource: MySource = myRoom.mySources[i];
            if (mySource.minerName === myCreep.name) {
                mySource.minerName = null;
            }
        }
        console.log("LOG: A Miner has died");
    } else if (myCreep.role === "Hauler") {
        for (let i = 0; i < myRoom.mySources.length; i++) {
            const mySource: MySource = myRoom.mySources[i];
            for (let j = mySource.haulerNames.length - 1; j >= 0; j--) {
                if (mySource.haulerNames[j] === myCreep.name) {
                    mySource.haulerNames.splice(j, 1);
                }
            }
        }
        console.log("LOG: A Hauler has died");
    } else if (myCreep.role === "MinerAndWorker") {
        console.log("LOG: A MinerAndWorker has died");
    } else if (myCreep.role === "Laborer") {
        console.log("LOG: A Laborer has died");
    } else {
        console.log("LOG: A Creep with a weird role has died: " + myCreep.role);
    }
}
