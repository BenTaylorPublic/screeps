import {ReportController} from "../../reporting/report-controller";
import {Constants} from "../../global/constants";

export class RoleAttackOneCreep {
    public static run(attackOneCreep: AttackOneCreep, attackOneState: AttackOneStateType, rallyOrRoomTargetFlag: Flag): void {
        const creep: Creep = Game.creeps[attackOneCreep.name];
        if (creep == null) {
            ReportController.log("ERROR", "Attack One Creep is null. Creep ID: " + attackOneCreep.name);
            return;
        }

        console.log(attackOneState);
        console.log(JSON.stringify(rallyOrRoomTargetFlag.pos));

        if (attackOneState === "Rally" || attackOneState === "Conscripting") {
            if (!creep.pos.inRangeTo(rallyOrRoomTargetFlag.pos, Constants.RALLY_FLAG_RANGE)) {
                //Not in range
                creep.say("Moving");
                creep.moveTo(rallyOrRoomTargetFlag.pos);
                return;
            } else {
                //In range of rally flag, just wait
                creep.say("Rallying");
            }
        } else if (attackOneState === "Charge") {
            if (creep.room.name !== rallyOrRoomTargetFlag.pos.roomName) {
                creep.say("Charge!");
                creep.moveTo(rallyOrRoomTargetFlag.pos);
            } else {
                //In the target room!
                this.attackLogic(attackOneCreep, creep);
            }
        }
    }

    private static attackLogic(attackOneCreep: AttackOneCreep, creep: Creep): void {
        if (this.findClosestStructureAndAttackIt(creep, FIND_HOSTILE_SPAWNS)) {
            creep.say("⚔️Spawn");
            return;
        }
        if (this.findClosestStructureAndAttackIt(creep, FIND_HOSTILE_STRUCTURES, {
            filter: (structure: Structure) => {
                return structure.structureType === STRUCTURE_TOWER;
            }
        })) {
            creep.say("⚔️Tower");
            return;
        }

        const creeps: Creep[] = creep.room.find(FIND_HOSTILE_CREEPS) as Creep[];
        let closestCreep: Creep | null = null;
        let closestCreepDistance: number = 999;
        for (let i: number = creeps.length - 1; i > 0; i--) {
            const path: PathStep[] = creep.pos.findPathTo(creeps[i].pos);
            if (path.length === 0) {
                //No path
                creeps.splice(i, 1);
            } else if (path.length < closestCreepDistance) {
                closestCreep = creeps[i];
                closestCreepDistance = path.length;
            }
        }

        if (closestCreep != null) {
            this.attackTarget(creep, closestCreep);
            creep.say("⚔️Creep");
            return;
        } else {
            //Kill the closest wall because we probably can't read anything
            if (this.findClosestStructureAndAttackIt(creep, FIND_HOSTILE_STRUCTURES, {
                filter: (structure: Structure) => {
                    return structure.structureType === STRUCTURE_RAMPART;
                }
            })) {
                creep.say("⚔️Rampart");
                return;
            }
            if (this.findClosestStructureAndAttackIt(creep, FIND_HOSTILE_STRUCTURES, {
                filter: (structure: Structure) => {
                    return structure.structureType === STRUCTURE_WALL;
                }
            })) {
                creep.say("⚔️Wall");
                return;
            }
        }
    }

    //Returns true if found a target
    private static findClosestStructureAndAttackIt(creep: Creep, searchThing: FindConstant, options?: FilterOptions<FindConstant>): boolean {

        const structures: Structure[] = creep.room.find(searchThing, options) as Structure[];
        let closestStructure: Structure | null = null;
        let closestStructureDistance: number = 999;
        for (let i: number = structures.length - 1; i > 0; i--) {
            const path: PathStep[] = creep.pos.findPathTo(structures[i].pos);
            if (path.length === 0) {
                //No path
                structures.splice(i, 1);
            } else if (path.length < closestStructureDistance) {
                closestStructure = structures[i];
                closestStructureDistance = path.length;
            }
        }

        if (closestStructure != null) {
            this.attackTarget(creep, closestStructure);
            return true;
        }
        return false;
    }

    private static attackTarget(creep: Creep, target: Structure | Creep): void {
        if (creep.pos.inRangeTo(target.pos, 1)) {
            creep.attack(target);
        } else {
            creep.moveTo(target);
        }
    }
}
