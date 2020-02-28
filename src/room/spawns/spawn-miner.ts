import {HelperFunctions} from "../../global/helper-functions";
import {SpawnQueueController} from "../../global/spawn-queue-controller";
import {SpawnConstants} from "../../global/spawn-constants";

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
                const newCreep: Miner = this.spawnMiner(myRoom, mySource);
                myRoom.myCreeps.push(newCreep);
                console.log("LOG: Queued a new Miner");
                return;
            }
        }
    }

    private static spawnMiner(myRoom: MyRoom, mySource: MySource): Miner {
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

        const name: string = "Creep" + Game.time;
        SpawnQueueController.queueCreepSpawn(body, myRoom, SpawnConstants.MINER, name);

        //Have a valid spawn now
        let workCount: number = 0;
        for (let i: number = 0; i < body.length; i++) {
            if (body[i] === WORK) {
                workCount++;
            }
        }

        mySource.minerName = name;
        return {
            name: name,
            role: "Miner",
            assignedRoomName: myRoom.name,
            spawningStatus: "queued",
            roomMoveTarget: {
                pos: null,
                path: []
            },
            cachePosToMineOn: (mySource.cache as MyCache).pos,
            linkIdToDepositTo: linkId,
            sourceId: mySource.id,
            amountOfWork: workCount
        };
    }

}
