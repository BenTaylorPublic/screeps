import { basicWorkerRole } from "basicworker.role.all";
import { devController } from "dev.controller";
console.log("Starting script v10");
export const loop: any = function () {

    //Clear all dead creeps
    for (const i in Memory.creeps) {
        if (!Game.creeps[i]) {
            delete Memory.creeps[i];
        }
    }

    if (Memory.myMemory.prod === false) {
        //Prod
        let creepCount: number = 0;
        for (const name in Game.creeps) {
            const creep: Creep = Game.creeps[name];
            basicWorkerRole.run(creep);
            creepCount++;
        }

        if (creepCount < 6) {
            const newCreep: Creep = spawnBasicWorker(Game.spawns.Spawn1);
            console.log("spawning new creep");
            basicWorkerRole.run(newCreep);
        }
    } else if (Memory.myMemory.prod === true) {
        //Dev

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
                    creep.memory.assignedRoomName = roomName;
                    newMyRoom.myCreeps.push({
                        name: creepName,
                        role: creep.memory.role,
                        assignedRoomName: roomName
                    });
                }
            }
        }

        //Validation of the myRooms
        for (let i = 0; i < Memory.myMemory.myRooms.length; i++) {
            const myRoom: MyRoom = Memory.myMemory.myRooms[i];
            const room: Room = Game.rooms[myRoom.name];
            if (room == null) {
                console.error("Lost vision of a room " + name);
                continue;
            }

            for (let j = 0; j < myRoom.myCreeps.length; j++) {
                const creepName: string = myRoom.myCreeps[j].name;
                if (Game.creeps[creepName] == null) {
                    //Creep is dead
                    delete myRoom.myCreeps[j];
                    j--;
                    console.log("Creep is dead and has been removed from a room");
                }
            }
        }

        for (let i = 0; i < Memory.myMemory.myRooms.length; i++) {
            const myRoom: MyRoom = Memory.myMemory.myRooms[i];
            devController.run(myRoom);
        }
    }

};

function spawnBasicWorker(spawn: StructureSpawn): Creep {
    const id = getId();
    spawn.spawnCreep([MOVE, CARRY, WORK], "Creep" + id, { memory: { assignedRoomName: spawn.room.name, role: "BasicWorker", harvesting: true } });
    return Game.creeps["Creep" + id];
}

function getId(): number {
    const toReturn: number = Memory.myMemory.globalId;
    Memory.myMemory.globalId++;
    return toReturn;
}
