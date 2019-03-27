import { basicWorkerRole } from "basicworker.role.all";
import { devController } from "dev.controller";
console.log("Starting script v4");
export const loop: any = function () {
    let creepCount: number = 0;

    //Clear all dead creeps
    for (const i in Memory.creeps) {
        if (!Game.creeps[i]) {
            delete Memory.creeps[i];
        }
    }

    if (Memory.myMemory.prod) {
        //Prod
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
    } else if (!Memory.myMemory.prod) {
        //Dev

        //Ensuring all the rooms are in Memory.myMemory.myRooms
        for (const roomName in Game.rooms) {
            const room: Room = Game.rooms[roomName];

            let alreadyInMemory: boolean = false;
            if (room.controller == null ||
                room.controller.my) {
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
                console.log("Adding a new room");
                const newMyRoom: MyRoom = {
                    name: roomName,
                    creepNames: [],
                    spawn: undefined,
                    sources: [],
                    myContainers: []
                };
                for (const creepName in Game.creeps) {
                    if (Game.creeps[creepName].memory.assignedRoomName === roomName) {
                        newMyRoom.creepNames.push(creepName);
                    }
                }
                const sources: Source[] = room.find(FIND_SOURCES);
                for (let i = 0; i < sources.length; i++) {
                    const source: Source = sources[i];
                    newMyRoom.sources.push({ id: source.id, cacheContainerId: undefined });
                }
                const spawns: StructureSpawn[] = room.find(FIND_MY_SPAWNS);
                if (spawns.length >= 1) {
                    newMyRoom.spawn = spawns[0].id;
                }
                //Containers is left as an empty array
                //If a room isn't in memory, and has my containers
                //Idk what happened to it lol
            }
        }

        for (let i = 0; i < Memory.myMemory.myRooms.length; i++) {
            const myRoom: MyRoom = Memory.myMemory.myRooms[i];
            if (Game.rooms[myRoom.name] == null) {
                console.error("Lost vision of a room " + name);
                continue;
            }
            /*
            TODO: Do some validation on the myRoom.
            Ensure all of these are correct:
                creepNames
                spawn
                sources
                containers
            */
        }

        for (let i = 0; i < Memory.myMemory.myRooms.length; i++) {
            const myRoom: MyRoom = Memory.myMemory.myRooms[i];
            devController.run(myRoom);
        }
    }

};

function spawnBasicWorker(spawn: StructureSpawn): Creep {
    const id = getId();
    spawn.spawnCreep([MOVE, CARRY, WORK], "Creep" + id, { memory: { stage: 1, role: "BasicWorker", harvesting: true } });
    return Game.creeps["Creep" + id];
}

function getId(): number {
    const toReturn: number = Memory.myMemory.globalId;
    Memory.myMemory.globalId++;
    return toReturn;
}
