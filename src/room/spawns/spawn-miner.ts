import {HelperFunctions} from "../../global/helper-functions";
import {ReportController} from "../../reporting/report-controller";

export class SpawnMiner {
    public static trySpawnMiner(myRoom: MyRoom): void {
        if (myRoom.roomStage < 2) {
            //At stage 2, the caches are built, and 5 extensions
            return;
        }

        for (let i = 0; i < myRoom.mySources.length; i++) {
            const mySource: MySource = myRoom.mySources[i];
            if (mySource.minerName == null) {
                //Needs a new miner
                const newCreep: Miner | null = this.spawnMiner(myRoom, mySource);
                if (newCreep != null) {
                    myRoom.myCreeps.push(newCreep);
                    console.log("LOG: Spawned a new Miner");
                    return;
                }
            }
        }
    }

    private static spawnMiner(myRoom: MyRoom, mySource: MySource): Miner | null {

        if (myRoom.spawns.length === 0) {
            ReportController.log("ERROR", "Attempted to spawn miner in a room with no spawner (1)");
            return null;
        }
        const spawn: StructureSpawn = Game.spawns[myRoom.spawns[0].name];

        if (spawn == null) {
            ReportController.log("ERROR", "Attempted to spawn miner in a room with no spawner (2)");
            return null;
        }

        if (mySource.cache == null) {
            ReportController.log("ERROR", "Attempted to spawn miner to a source with no cache container pos");
            return null;
        }

        let body: BodyPartConstant[];

        let maxBodyParts: number;
        if (myRoom.mySources.length === 1) {
            if (mySource.link == null) {
                maxBodyParts = 12;
            } else {
                maxBodyParts = 14;
            }
        } else {
            if (mySource.link == null) {
                maxBodyParts = 18;
            } else {
                maxBodyParts = 42;
            }
        }

        let linkId: Id<StructureLink> | null = null;
        if (mySource.link != null) {
            linkId = mySource.link.id;
            body = HelperFunctions.generateBody(
                [MOVE, CARRY, WORK, WORK, WORK, WORK, WORK],
                [MOVE, CARRY, WORK, WORK, WORK, WORK, WORK],
                Game.rooms[myRoom.name],
                false,
                maxBodyParts
            );
        } else {
            //No carry
            body = HelperFunctions.generateBody(
                [MOVE, WORK, WORK, WORK, WORK, WORK],
                [MOVE, WORK, WORK, WORK, WORK, WORK],
                Game.rooms[myRoom.name],
                false,
                maxBodyParts
            );
        }

        //Have a valid spawn now
        const id = HelperFunctions.getId();
        const result: ScreepsReturnCode =
            spawn.spawnCreep(
                body,
                "Creep" + id
            );
        let workCount: number = 0;
        for (let i: number = 0; i < body.length; i++) {
            if (body[i] === WORK) {
                workCount++;
            }
        }

        if (result === OK) {
            mySource.minerName = "Creep" + id;
            return {
                name: "Creep" + id,
                role: "Miner",
                assignedRoomName: spawn.room.name,
                spawningStatus: "queued",
                roomMoveTarget: {
                    pos: null,
                    path: []
                },
                cachePosToMineOn: mySource.cache.pos,
                linkIdToDepositTo: linkId,
                sourceId: mySource.id,
                amountOfWork: workCount
            };
        }

        return null;
    }

}
