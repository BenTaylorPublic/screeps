import {HelperFunctions} from "../../global/helper-functions";
import {SpawnQueueController} from "../../global/spawn-queue-controller";
import {SpawnConstants} from "../../global/spawn-constants";

export class SpawnMiner {
    public static minerSpawnLogic(myRoom: MyRoom): void {
        for (let i = 0; i < myRoom.mySources.length; i++) {
            const mySource: MySource = myRoom.mySources[i];
            if (mySource.minerName == null) {
                this.spawnMiner(myRoom, mySource);
            }
        }
    }

    public static spawnMiner(myRoom: MyRoom, mySource: MySource): void {
        if (myRoom.roomStage < 2) {
            //At stage 2, the caches are built, and 5 extensions
            return;
        }

        if (mySource.minerName == null) {
            //Needs a new miner
            const newCreep: Miner = this.spawnMinerInternal(myRoom, mySource);
            myRoom.myCreeps.push(newCreep);
            console.log("LOG: Queued a new Miner in " + HelperFunctions.roomNameAsLink(myRoom.name));
            return;
        }
    }

    public static getBody(myRoom: MyRoom, mySource: MySource): BodyPartConstant[] {
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

        if (mySource.link != null &&
            mySource.link.id != null) {
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
        return body;
    }

    private static spawnMinerInternal(myRoom: MyRoom, mySource: MySource): Miner {
        const body = this.getBody(myRoom, mySource);
        const name: string = "Creep" + HelperFunctions.getId();
        SpawnQueueController.queueCreepSpawn(body, myRoom, SpawnConstants.MINER, name, "Miner");

        //Have a valid spawn now
        let workCount: number = 0;
        for (let i: number = 0; i < body.length; i++) {
            if (body[i] === WORK) {
                workCount++;
            }
        }
        let linkId: Id<StructureLink> | null = null;
        if (mySource.link != null &&
            mySource.link.id != null) {
            linkId = mySource.link.id;
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
