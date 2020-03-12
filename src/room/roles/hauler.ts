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

        if (hauler.pickup === false &&
            creep.store.energy === 0) {
            hauler.pickup = true;
            creep.say("pickup");
        } else if (hauler.pickup === true &&
            creep.store.energy === creep.store.getCapacity()) {
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
                    ReportController.email("Source cache is null for hauler: " + hauler.name + " in " + LogHelper.roomNameAsLink(myRoom.name) + ". Marking as NoCache");
                    for (let i = 0; i < myRoom.mySources.length; i++) {
                        const cache: MyCache | null = myRoom.mySources[i].cache;
                        if (cache != null &&
                            RoomHelper.posMatches2(cache.pos, hauler.cachePosToPickupFrom)) {
                            myRoom.mySources[i].cache = null;
                            myRoom.mySources[i].state = "NoCache";
                            creep.suicide();
                            return;
                        }
                    }
                    ReportController.email("ERROR: Failed to mark source as NoCache");
                    return;
                }
                if (cacheToGrabFrom.store[RESOURCE_ENERGY] >= creep.store.getFreeCapacity()) {
                    creep.withdraw(cacheToGrabFrom, RESOURCE_ENERGY);
                }
            } else {
                MovementHelper.myMoveTo(creep, cacheToGrabFromPos, hauler);
            }
        } else {
            //Deliver

            if (myRoom.bankPos == null) {
                ReportController.email("ERROR: Room's bank pos was null in " + LogHelper.roomNameAsLink(myRoom.name));
                return;
            }

            const bankPos: RoomPosition = RoomHelper.myPosToRoomPos(myRoom.bankPos);

            if (bankPos.isNearTo(creep)) {
                const bank: StructureStorage | null = myRoom.bank;
                if (bank == null) {
                    ReportController.email("ERROR: Room's bank was null in " + LogHelper.roomNameAsLink(myRoom.name));
                    return;
                }
                creep.transfer(bank, RESOURCE_ENERGY);
            } else {
                MovementHelper.myMoveTo(creep, bankPos, hauler);
            }
        }
    }
}
