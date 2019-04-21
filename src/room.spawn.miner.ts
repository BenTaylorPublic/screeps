import { globalFunctions } from "global.functions";

export const roomSpawnMiner: any = {
    trySpawnMiner: function (myRoom: MyRoom) {
        if (myRoom.roomStage < 2) {
            //At stage 2, the caches are built, and 5 extensions
            return;
        }

        for (let i = 0; i < myRoom.mySources.length; i++) {
            const mySource: MySource = myRoom.mySources[i];
            if (mySource.minerName == null) {
                //Needs a new miner
                const newCreep: Miner | null = spawnMiner(myRoom, mySource);
                if (newCreep != null) {
                    myRoom.myCreeps.push(newCreep);
                    console.log("LOG: Spawned a new Miner");
                    return;
                }
            }
        }
    }
};

function spawnMiner(myRoom: MyRoom, mySource: MySource): Miner | null {

    if (myRoom.spawns.length === 0) {
        console.log("ERR: Attempted to spawn miner in a room with no spawner (1)");
        return null;
    }
    const spawn: StructureSpawn = Game.spawns[myRoom.spawns[0].name];

    if (spawn == null) {
        console.log("ERR: Attempted to spawn miner in a room with no spawner (2)");
        return null;
    }

    if (mySource.cachePos == null) {
        console.log("ERR: Attempted to spawn miner to a source with no cache container pos");
        return null;
    }

    let body: BodyPartConstant[];

    let linkId: string | null = null;
    //Convery the linkPos to an ID for the miner
    if (mySource.link != null) {
        linkId = mySource.link.id;
        body = [MOVE, CARRY, WORK, WORK, WORK, WORK, WORK];
    } else {
        //No carry
        body = [MOVE, WORK, WORK, WORK, WORK, WORK];
    }

    //Have a valid spawn now
    const id = globalFunctions.getId();
    const result: ScreepsReturnCode =
        spawn.spawnCreep(
            body,
            "Creep" + id,
            {
                memory:
                {
                    name: "Creep" + id,
                    role: "Miner",
                    assignedRoomName: spawn.room.name
                }
            }
        );

    if (result === OK) {
        mySource.minerName = "Creep" + id;
        return {
            name: "Creep" + id,
            role: "Miner",
            assignedRoomName: spawn.room.name,
            cachePosToMineOn: mySource.cachePos,
            linkIdToDepositTo: linkId,
            sourceId: mySource.id
        };
    }

    return null;
}
