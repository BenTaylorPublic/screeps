import { global } from "global";

export const roomSpawnHauler: any = {
    trySpawnHauler: function (myRoom: MyRoom) {
        if (myRoom.roomStage < 2.6) {
            return;
        }

        for (let i = 0; i < myRoom.mySources.length; i++) {
            const mySource: MySource = myRoom.mySources[i];
            if (mySource.haulerNames.length === 0 ||
                (myRoom.roomStage >= 3 && mySource.haulerNames.length < 2)) {
                //Spawn a new hauler
                const newCreep: Hauler | null = spawnHauler(myRoom, mySource);
                if (newCreep != null) {
                    myRoom.myCreeps.push(newCreep);
                    mySource.haulerNames.push(newCreep.name);
                    console.log("LOG: Spawned a new hauler");
                    return;
                }
            }

        }
    }
};

function spawnHauler(myRoom: MyRoom, mySource: MySource): Hauler | null {
    if (myRoom.spawns.length === 0) {
        console.log("ERR: Attempted to spawn hauler in a room with no spawner (1)");
        return null;
    }
    const spawn: StructureSpawn = Game.spawns[myRoom.spawns[0].name];

    if (spawn == null) {
        console.log("ERR: Attempted to spawn hauler in a room with no spawner (2)");
        return null;
    }

    if (mySource.cachePos == null) {
        console.log("ERR: Attempted to spawn hauler for a source with no cache pos");
        return null;
    }

    //Have a valid spawn now
    const useBestBody: boolean = myRoom.roomStage >= 3;
    const body: BodyPartConstant[] = global.generateBody([MOVE, CARRY], [MOVE, CARRY], spawn.room, useBestBody);

    const id = global.getId();
    const result: ScreepsReturnCode =
        spawn.spawnCreep(
            body,
            "Creep" + id,
            {
                memory:
                {
                    name: "Creep" + id,
                    role: "Hauler",
                    assignedRoomName: spawn.room.name
                }
            }
        );

    if (result === OK) {
        return {
            name: "Creep" + id,
            role: "Hauler",
            assignedRoomName: spawn.room.name,
            cachePosToPickupFrom: mySource.cachePos,
            pickup: true
        };
    }
    return null;
}
