import {SpawnLaborer} from "./spawn-laborer";
import {SpawnHauler} from "./spawn-hauler";
import {SpawnStocker} from "./spawn-stocker";
import {SpawnMiner} from "./spawn-miner";
import {SpawnClaimerController} from "../../empire/spawn-claimer-controller";
import {SpawnBankLinker} from "./spawn-bank-linker";
import {ReportController} from "../../reporting/report-controller";
import {AttackHelperFunctions} from "../../empire/attack/attack-helper-functions";
import {CreepHelper} from "../../global/helpers/creep-helper";
import {ScavengeController} from "../../empire/scavenge-controller";
import {SpawnDigger} from "./spawn-digger";
import {SpawnUpgrader} from "./spawn-upgrader";

export class RoomSpawnController {
    public static run(myRoom: MyRoom, room: Room): void {
        if (Game.time % 10 === 0) {
            SpawnLaborer.laborerSpawnLogic(myRoom, room);
            SpawnHauler.spawnHaulerLogic(myRoom);
            SpawnStocker.spawnStocker(myRoom);
            SpawnMiner.minerSpawnLogic(myRoom);
            SpawnBankLinker.spawnBankLinker(myRoom);
            SpawnDigger.spawnDigger(myRoom);
            SpawnUpgrader.spawnUpgraderLogic(myRoom);
        }

        if (myRoom.spawnQueue.length === 0) {
            return;
        }
        const creepToSpawn: QueuedCreep = myRoom.spawnQueue[0];
        const body: BodyPartConstant[] = this.getBody(creepToSpawn, myRoom);
        const energyCost = CreepHelper.bodyCost(body);
        if (room.energyAvailable < energyCost) {
            //Too costly to spawn
            return;
        }

        const spawns: StructureSpawn[] = room.find<StructureSpawn>(FIND_MY_STRUCTURES, {
            filter: (structure: Structure) => {
                return structure.structureType === STRUCTURE_SPAWN;
            }
        });
        let spawn: StructureSpawn | null = null;
        for (let i: number = 0; i < spawns.length; i++) {
            if (spawns[i].spawning == null) {
                spawn = spawns[i];
                break;
            }
        }
        if (spawn == null) {
            return;
        }

        const result: ScreepsReturnCode = spawn.spawnCreep(body, creepToSpawn.name);

        if (result === OK) {
            myRoom.spawnQueue.splice(0, 1);
        }
    }

    private static getBody(queuedCreep: QueuedCreep, myRoom: MyRoom): BodyPartConstant[] {
        if (queuedCreep.role === "ForceLaborer") {
            return SpawnLaborer.getForceBody(myRoom);
        } else if (queuedCreep.role === "Stocker") {
            return SpawnStocker.getBody(myRoom);
        } else if (queuedCreep.role === "Claimer") {
            return SpawnClaimerController.getBody(myRoom);
        } else if (queuedCreep.role === "Miner") {
            for (let k: number = 0; k < myRoom.mySources.length; k++) {
                const mySource: MySource = myRoom.mySources[k];
                if (mySource.minerName === queuedCreep.name) {
                    return SpawnMiner.getBody(myRoom, mySource);
                }
            }
        } else if (queuedCreep.role === "Hauler") {
            return SpawnHauler.getBody(myRoom);
        } else if (queuedCreep.role === "BankLinker") {
            return SpawnBankLinker.getBody();
        } else if (queuedCreep.role === "Laborer") {
            return SpawnLaborer.getBody(myRoom);
        } else if (queuedCreep.role === "Digger") {
            return SpawnDigger.getBody(myRoom);
        } else if (queuedCreep.role === "Scavenger") {
            return ScavengeController.getBody(myRoom);
        } else if (queuedCreep.role === "AttackQuickCreep" || queuedCreep.role === "AttackPressureCreep") {
            return AttackHelperFunctions.getBody(myRoom);
        } else if (queuedCreep.role === "Signer") {
            return [MOVE];
        }
        ReportController.email("ERROR: Creep role doesn't have a getBody function " + queuedCreep.role);
        return [];
    }
}
