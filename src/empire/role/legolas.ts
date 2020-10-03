import {CreepHelper} from "../../global/helpers/creep-helper";

export class RoleLegolas {
    public static run(legolas: Legolas): void {
        if (CreepHelper.handleCreepPreRole(legolas)) {
            return;
        }

        const creep: Creep = Game.creeps[legolas.name];
        console.log("TODO: " + creep.name);
    }
}