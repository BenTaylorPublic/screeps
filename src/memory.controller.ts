import { globalFunctions } from "global.functions";

export const memoryController: any = {
    run: function () {
        clearDeadCreeps();
        ensureAllRoomsInMyMemory();
        validateRoomsInMyMemory();
        cleanUpTravelingCreeps();
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
        let myRoom: MyRoom | null = null;

        if (room.controller == null ||
            room.controller.my === false) {
            //No need to process rooms that don't have controllers or are not mine
            //We only have access to these rooms through travelers (probs)
            continue;
        }

        for (let i = 0; i < Memory.myMemory.myRooms.length; i++) {
            const myExistingRoom = Memory.myMemory.myRooms[i];
            if (myExistingRoom != null &&
                myExistingRoom.name === roomName) {
                myRoom = myExistingRoom;
            }
        }

        if (myRoom == null) {
            //Add it
            console.log("LOG: Adding a new room " + roomName);
            const newMyRoom: MyRoom = {
                name: roomName,
                myCreeps: [],
                spawns: [],
                mySources: [],
                roomStage: -1,
                bankPos: null,
                myExtensionPositions: [],
                myTowerPositions: []
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
            const spawns: StructureSpawn[] = room.find(FIND_MY_SPAWNS);
            for (let i = 0; i < spawns.length; i++) {
                const spawn: StructureSpawn = spawns[i];
                newMyRoom.spawns.push({
                    position: globalFunctions.roomPosToMyPos(spawn.pos),
                    name: spawn.name
                });
            }

            Memory.myMemory.myRooms.push(newMyRoom);
        } else {
            //Already in memory

            //If the room has more or less spawns than in the MyRoom, add them to it
            const spawns: StructureSpawn[] = room.find(FIND_MY_SPAWNS);
            if (spawns.length !== myRoom.spawns.length) {
                myRoom.spawns = [];
                for (let i = 0; i < spawns.length; i++) {
                    const spawn: StructureSpawn = spawns[i];
                    myRoom.spawns.push({
                        position: globalFunctions.roomPosToMyPos(spawn.pos),
                        name: spawn.name
                    });
                }
            }
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
    } else if (myCreep.role === "Laborer") {
        console.log("LOG: A Laborer has died");
    } else if (myCreep.role === "Claimer") {
        console.log("LOG: A Claimer has died");
    } else {
        console.log("LOG: A Creep with a weird role has died: " + myCreep.role);
    }
}

function cleanUpTravelingCreeps(): void {
    for (let i = Memory.myMemory.myTravelingCreeps.length - 1; i >= 0; i--) {
        const myCreep: MyCreep = Memory.myMemory.myTravelingCreeps[i];
        if (Game.creeps[myCreep.name] == null) {
            Memory.myMemory.myTravelingCreeps.splice(i, 1);
        }
    }
}
