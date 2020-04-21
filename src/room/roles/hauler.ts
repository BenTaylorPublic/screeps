import {ReportController} from "../../reporting/report-controller";
import {CreepHelper} from "../../global/helpers/creep-helper";
import {RoomHelper} from "../../global/helpers/room-helper";
import {LogHelper} from "../../global/helpers/log-helper";
import {MovementHelper} from "../../global/helpers/movement-helper";

export class RoleHauler {
    public static run(hauler: Hauler, myRoom: MyRoom): void {
        if (CreepHelper.handleCreepPreRole(hauler)) {
            return;
        }

        const creep: Creep = Game.creeps[hauler.name];

        if (!hauler.pickup &&
            creep.store.getUsedCapacity() === 0) {
            hauler.pickup = true;
            creep.say("pickup");
        } else if (hauler.pickup &&
            creep.store.getFreeCapacity() === 0) {
            hauler.pickup = false;
            creep.say("delivering");
        }

        if (hauler.pickup) {
            //Picking up more

            const cacheToGrabFromPos: RoomPosition = RoomHelper.myPosToRoomPos(hauler.cachePosToPickupFrom);
            if (cacheToGrabFromPos.isNearTo(creep)) {

                let cacheToGrabFrom: StructureContainer | null = null;

                const structures: Structure<StructureConstant>[] = cacheToGrabFromPos.lookFor(LOOK_STRUCTURES);
                for (let i = 0; i < structures.length; i++) {
                    const structure: Structure = structures[i];
                    if (structure.structureType === STRUCTURE_CONTAINER) {
                        cacheToGrabFrom = structure as StructureContainer;
                    }
                }

                if (cacheToGrabFrom == null) {
                    ReportController.email("Source cache is null for hauler: " + hauler.name + " in " + LogHelper.roomNameAsLink(myRoom.name) + ". Commiting suicide.");
                    creep.suicide();
                    return;
                } else if (cacheToGrabFrom.store.getUsedCapacity() >= creep.store.getFreeCapacity()) {
                    const resources: ResourceConstant[] = Object.keys(cacheToGrabFrom.store) as ResourceConstant[];
                    for (let i: number = 0; i < resources.length; i++) {
                        creep.withdraw(cacheToGrabFrom, resources[i]);
                    }
                }
            } else {
                MovementHelper.myMoveTo(creep, cacheToGrabFromPos, hauler);
            }
        } else {
            //Deliver

            if (myRoom.bank == null) {
                ReportController.email("ERROR: Room's bank memory was null in " + LogHelper.roomNameAsLink(myRoom.name) + " for hauler");
                return;
            }

            const bankPos: RoomPosition = RoomHelper.myPosToRoomPos(myRoom.bank.bankPos);

            if (bankPos.isNearTo(creep)) {
                const bank: StructureStorage | null = myRoom.bank.object;
                if (bank == null) {
                    ReportController.email("ERROR: Room's bank was null in " + LogHelper.roomNameAsLink(myRoom.name));
                    return;
                }
                const resources: ResourceConstant[] = Object.keys(creep.store) as ResourceConstant[];
                for (let i: number = 0; i < resources.length; i++) {
                    if (creep.transfer(bank, resources[i]) === OK) {
                        break;
                    }
                }
            } else {
                MovementHelper.myMoveTo(creep, bankPos, hauler);
            }
        }
    }
}
