import { controllerLogic1 } from "controller.logic1";

console.log("Starting script v16");

export const loop: any = function () {
    clearDeadCreeps();
    ensureAllRoomsInMyMemory();
    validateRoomsInMyMemory();

    for (let i = 0; i < Memory.myMemory.myRooms.length; i++) {
        const myRoom: MyRoom = Memory.myMemory.myRooms[i];
        controllerLogic1.run(myRoom);
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
            console.log("Adding a new room " + roomName);
            const newMyRoom: MyRoom = {
                name: roomName,
                myCreeps: [],
                spawnId: undefined,
                mySources: [],
                myContainers: []
            };
            const sources: Source[] = room.find(FIND_SOURCES);
            for (let i = 0; i < sources.length; i++) {
                const source: Source = sources[i];
                newMyRoom.mySources.push({ id: source.id, cacheContainerId: undefined });
            }
            //myCreeps, spawnId, myContainers will be populated by logic when they're created

            //Initially add all existing creeps
            for (const creepName in Game.creeps) {
                const creep: Creep = Game.creeps[creepName];
                creep.memory.assignedRoomName = roomName;
                if (creep.memory.role == null) {
                    creep.memory.role = "BasicWorker";
                }
                newMyRoom.myCreeps.push({
                    name: creepName,
                    role: creep.memory.role,
                    assignedRoomName: roomName
                });
            }
            Memory.myMemory.myRooms.push(newMyRoom);
        }
    }
}

function validateRoomsInMyMemory(): void {
    //Validation of the myRooms
    for (let i = 0; i < Memory.myMemory.myRooms.length; i++) {
        const myRoom: MyRoom = Memory.myMemory.myRooms[i];
        const room: Room = Game.rooms[myRoom.name];
        if (room == null) {
            console.error("Lost vision of a room " + name);
            continue;
        }

        for (let j = myRoom.myCreeps.length - 1; j >= 0; j--) {
            const creepName: string = myRoom.myCreeps[j].name;
            if (Game.creeps[creepName] == null) {
                //Creep is dead
                myRoom.myCreeps.splice(j, 1);
                console.log("Creep is dead and has been removed from a room");
            }
        }
    }
}
