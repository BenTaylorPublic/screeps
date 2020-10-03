import {CreepHelper} from "../../global/helpers/creep-helper";
import {FlagHelper} from "../../global/helpers/flag-helper";
import {RoomHelper} from "../../global/helpers/room-helper";
import {MovementHelper} from "../../global/helpers/movement-helper";

export class RoleLegolas {
    public static run(legolas: Legolas): void {
        if (CreepHelper.handleCreepPreRole(legolas)) {
            return;
        }

        const creep: Creep = Game.creeps[legolas.name];

        const standOnFlag: Flag | null = FlagHelper.getFlag1(["test", "stand", "on"], creep.room.name);
        if (standOnFlag != null &&
            !RoomHelper.posMatches3(creep.pos, standOnFlag.pos)) {
            MovementHelper.myMoveTo(creep, standOnFlag.pos, legolas);
        } else {
            return;
        }
    }
}