import {ReportController} from "../../reporting/report-controller";
import {LogHelper} from "../../global/helpers/log-helper";
import {Constants} from "../../global/constants/constants";
import {CreepHelper} from "../../global/helpers/creep-helper";
import {SpawnConstants} from "../../global/constants/spawn-constants";
import {SpawnQueueController} from "../../global/spawn-queue-controller";

export class SpawnUpgrader {
    public static spawnUpgraderLogic(myRoom: MyRoom): void {
        if (myRoom.roomStage < Constants.CONTROLLER_LINKED_STAGE ||
            myRoom.bank == null) {
            //Only spawn upgraders through this method if the bank is there and controller is linked
            return;
        }

        for (let i = 0; i < myRoom.myCreeps.length; i++) {
            const myCreep: MyCreep = myRoom.myCreeps[i];
            if (myCreep.role === "Upgrader") {

                const ticksToTravel: number | null = (myCreep as Upgrader).ticksToTravel;
                const creep: Creep = Game.creeps[myCreep.name];
                if (ticksToTravel == null ||
                    creep.ticksToLive == null ||
                    creep.ticksToLive >= ticksToTravel + Constants.UPGRADER_TICKS_TO_SPAWN) {
                    //This one is still healthy enough
                    return;
                }
            }
        }
        const bank: StructureStorage | null = myRoom.bank.object;
        if (bank == null) {
            ReportController.email("ERROR: Bank is null when checking if it's full in " + LogHelper.roomNameAsLink(myRoom.name));
            return;
        }

        if (bank.store.energy < Constants.AMOUNT_OF_BANK_ENERGY_REQUIRED_TO_SPAWN_UPGRADER &&
            (Game.rooms[myRoom.name].controller as StructureController).ticksToDowngrade >= Constants.STAGE_8_SPAWN_UPGRADERS_WHEN_CONTROLLER_BENEATH) {
            return;
        }

        //We can spawn one!
        const upgrader: Upgrader = this.spawnUpgrader(myRoom);
        myRoom.myCreeps.push(upgrader);
        ReportController.log("Queued a new Upgrader in " + LogHelper.roomNameAsLink(myRoom.name));
    }

    public static getBody(myRoom: MyRoom): BodyPartConstant[] {
        //If modifying this, update Constants.UPGRADER_TICKS_TO_SPAWN
        return [CARRY,
            MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
            //15 work is controllers cap
            WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK];
    }

    private static spawnUpgrader(myRoom: MyRoom): Upgrader {
        const name: string = CreepHelper.getName();
        const priority: number = SpawnConstants.UPGRADER;
        SpawnQueueController.queueCreepSpawn(myRoom, priority, name, "Upgrader");

        return {
            name: name,
            role: "Upgrader",
            assignedRoomName: myRoom.name,
            spawningStatus: "queued",
            roomMoveTarget: {
                pos: null,
                path: []
            },
            ticksToTravel: null
        };
    }
}