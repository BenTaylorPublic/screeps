import {CreepHelper} from "../../global/helpers/creep-helper";
import {RoomHelper} from "../../global/helpers/room-helper";
import {ReportController} from "../../reporting/report-controller";
import {LogHelper} from "../../global/helpers/log-helper";
import {MovementHelper} from "../../global/helpers/movement-helper";

export class RoleDigger {
    public static run(digger: Digger, myRoom: MyRoom): void {
        if (CreepHelper.handleCreepPreRole(digger)) {
            return;
        }

        if (Game.time < digger.digInTick) {
            return;
        }

        const creep: Creep = Game.creeps[digger.name];
        const cachePos: RoomPosition = RoomHelper.myPosToRoomPos(digger.cachePosToDigOn);

        if (cachePos.isEqualTo(creep.pos)) {
            //In location
            const mineral: Mineral | null = Game.getObjectById<Mineral>(digger.mineralId);
            if (mineral == null) {
                ReportController.email("ERROR: Digger has been given a mineral which is null. Creep ID: " + digger.name + " in " + LogHelper.roomNameAsLink(myRoom.name));
                return;
            }

            if (mineral.mineralAmount > 0) {
                if (myRoom.digging.cache == null ||
                    myRoom.digging.cache.id == null) {
                    ReportController.email("ERROR: Digger has mineral cache was null. Creep ID: " + digger.name + " in " + LogHelper.roomNameAsLink(myRoom.name));
                    return;
                }
                const cache: StructureContainer | null = Game.getObjectById<StructureContainer>(myRoom.digging.cache.id);
                if (cache != null) {
                    if (cache.store.energy < 1965) {
                        creep.harvest(mineral);
                        digger.digInTick = Game.time + 4;
                    }
                } else {
                    ReportController.email("ERROR: Mineral cache returned null with get by ID in " + LogHelper.roomNameAsLink(myRoom.name));
                }
            }
        } else {
            //Move to cache
            MovementHelper.myMoveTo(creep, cachePos, digger);
        }
    }
}