import {ReportController} from "../../reporting/report-controller";
import {LogHelper} from "../../global/helpers/log-helper";
import {CreepHelper} from "../../global/helpers/creep-helper";
import {MovementHelper} from "../../global/helpers/movement-helper";

export class RoleUpgrader {
    public static run(upgrader: Upgrader, myRoom: MyRoom): void {
        if (CreepHelper.handleCreepPreRole(upgrader)) {
            return;
        }

        const controller: StructureController = Game.rooms[myRoom.name].controller as StructureController;
        const creep: Creep = Game.creeps[upgrader.name];

        if (creep.store.energy < 30) {
            //Need to withdraw
            if (myRoom.controllerLink == null ||
                myRoom.controllerLink.id == null) {
                ReportController.email("ERROR: myRoom.controllerLink null in upgrader role in room " + LogHelper.roomNameAsLink(myRoom.name));
                return;
            }

            const link: StructureLink | null = Game.getObjectById<StructureLink>(myRoom.controllerLink.id);
            if (link == null) {
                ReportController.email("ERROR: Get link was null in upgrader role in room " + LogHelper.roomNameAsLink(myRoom.name));
                return;
            }

            if (creep.withdraw(link, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                MovementHelper.myMoveTo(creep, link.pos, upgrader);
                //Just give it a go, it might work
                creep.upgradeController(controller);

            } else {
                //Succesfull hopefully, try upgrade
                if (creep.upgradeController(controller) === ERR_NOT_IN_RANGE) {
                    MovementHelper.myMoveTo(creep, (controller).pos, upgrader);
                }
                if (upgrader.ticksToTravel == null) {
                    upgrader.ticksToTravel = 1500 - (creep.ticksToLive as number);
                }
            }
        } else if (creep.upgradeController(controller) === ERR_NOT_IN_RANGE) {
            MovementHelper.myMoveTo(creep, (controller).pos, upgrader);
        }


    }
}