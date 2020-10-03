import {SpawnQueueController} from "../../global/spawn-queue-controller";
import {SpawnConstants} from "../../global/constants/spawn-constants";
import {CreepHelper} from "../../global/helpers/creep-helper";
import {Constants} from "../../global/constants/constants";

export class SpawnDigger {
    public static spawnDigger(myRoom: MyRoom): void {
        if (Game.time % 100 !== 0) {
            return;
        }
        if (myRoom.roomStage < Constants.MINERAL_START_STAGE ||
            !myRoom.digging.active ||
            myRoom.digging.diggerName != null ||
            myRoom.digging.cache == null) {
            return;
        } else {
            const minerals: Mineral[] = Game.rooms[myRoom.name].find(FIND_MINERALS);
            if (minerals.length === 1 &&
                minerals[0].mineralAmount === 0) {
                return;
            }
        }

        const digger: Digger = this.spawnDiggerInternal(myRoom, myRoom.digging.cache.pos);
        myRoom.myCreeps.push(digger);
        myRoom.digging.diggerName = digger.name;
    }

    public static getBody(myRoom: MyRoom): BodyPartConstant[] {
        return CreepHelper.generateBody(
            [MOVE, WORK, WORK, WORK, WORK, WORK],
            [MOVE, WORK, WORK, WORK, WORK, WORK],
            Game.rooms[myRoom.name],
            true,
            42
        );
    }

    private static spawnDiggerInternal(myRoom: MyRoom, cachePos: MyRoomPos): Digger {
        const name: string = CreepHelper.getName();
        SpawnQueueController.queueCreepSpawn(myRoom, SpawnConstants.DIGGER, name, "Digger");

        return {
            name: name,
            role: "Digger",
            assignedRoomName: myRoom.name,
            spawningStatus: "queued",
            roomMoveTarget: {
                pos: null,
                path: []
            },
            cachePosToDigOn: cachePos,
            mineralId: myRoom.digging.mineralId,
            digInTick: 0
        };
    }
}
