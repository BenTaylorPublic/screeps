import {SpawnLaborer} from "./spawn-laborer";
import {SpawnHauler} from "./spawn-hauler";
import {SpawnStocker} from "./spawn-stocker";
import {SpawnMiner} from "./spawn-miner";
import {SpawnClaimerController} from "../../empire/spawn-claimer-controller";
import {SpawnBankLinker} from "./spawn-bank-linker";
import {HelperFunctions} from "../../global/helper-functions";

export class RoomSpawnController {
    public static run(myRoom: MyRoom): void {
        if (Game.time % 10) {
            SpawnLaborer.laborerSpawnLogic(myRoom);
            SpawnHauler.spawnHaulerLogic(myRoom);
            SpawnStocker.spawnStocker(myRoom);
            SpawnMiner.minerSpawnLogic(myRoom);
            if (Game.time % 100) {
                this.recalculateAllBodiesInQueue(myRoom);
            }
        }

        if (myRoom.spawnQueue.length === 0) {
            return;
        }
        const creepToSpawn: QueuedCreep = myRoom.spawnQueue[0];
        if (Game.rooms[myRoom.name].energyAvailable < creepToSpawn.energyCost) {
            //Too costly to spawn
            return;
        }

        let spawn: StructureSpawn | null = null;
        for (let i: number = 0; i < myRoom.spawns.length; i++) {
            spawn = Game.spawns[myRoom.spawns[i].name];
            if (spawn.spawning != null) {
                spawn = null;
            } else {
                break;
            }
        }
        if (spawn == null) {
            return;
        }

        const result: ScreepsReturnCode = spawn.spawnCreep(creepToSpawn.body, creepToSpawn.name);

        if (result === OK) {
            myRoom.spawnQueue.splice(0, 1);
        }
    }

    private static recalculateAllBodiesInQueue(myRoom: MyRoom): void {
        for (let i: number = myRoom.spawnQueue.length - 1; i >= 0; i--) {
            const queuedCreep: QueuedCreep = myRoom.spawnQueue[i];
            if (queuedCreep.role === "ForceLaborer") {
                queuedCreep.body = SpawnLaborer.getForceBody(myRoom);
            } else if (queuedCreep.role === "Stocker") {
                queuedCreep.body = SpawnStocker.getBody(myRoom);
            } else if (queuedCreep.role === "Claimer") {
                queuedCreep.body = SpawnClaimerController.getBody();
            } else if (queuedCreep.role === "Miner") {
                for (let k: number = 0; k < myRoom.mySources.length; k++) {
                    const mySource: MySource = myRoom.mySources[k];
                    if (mySource.minerName === queuedCreep.name) {
                        queuedCreep.body = SpawnMiner.getBody(myRoom, mySource);
                    }
                }
            } else if (queuedCreep.role === "Hauler") {
                queuedCreep.body = SpawnHauler.getBody(myRoom);
            } else if (queuedCreep.role === "BankLinker") {
                queuedCreep.body = SpawnBankLinker.getBody();
            } else if (queuedCreep.role === "Laborer") {
                queuedCreep.body = SpawnLaborer.getBody(myRoom);
            }
            queuedCreep.energyCost = HelperFunctions.bodyCost(queuedCreep.body);
        }
    }
}
