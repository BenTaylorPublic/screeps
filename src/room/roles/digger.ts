import {CreepHelper} from "../../global/helpers/creep-helper";

export class RoleDigger {
    public static run(digger: Digger, myRoom: MyRoom): void {
        if (CreepHelper.handleCreepPreRole(digger)) {
            return;
        }

        // const creep: Creep = Game.creeps[digger.name];
    }
}