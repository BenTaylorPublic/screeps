import {RoomTowerController} from "./structures/tower";
import {RoleMiner} from "./roles/miner";
import {RoleHauler} from "./roles/hauler";
import {RoomStageController} from "./room-stage-controller";
import {RoleLaborer} from "./roles/laborer";
import {RoomSpawnController} from "./spawns/room-spawn-controller";
import {RoleBankLinker} from "./roles/bank-linker";
import {RoomSourceLinkController} from "./structures/source-link";
import {ReportController} from "../reporting/report-controller";
import {RoleStocker} from "./roles/stocker";
import {HelperFunctions} from "../global/helpers/helper-functions";
import {RoomDefenseController} from "./room-defense-controller";

export class RoomController {
    public static run(myRoom: MyRoom): void {
        if (Game.rooms[myRoom.name] == null) {
            //No longer have vision of this room
            ReportController.email("ERROR: No longer have vision of room " + HelperFunctions.roomNameAsLink(myRoom.name));
            return;
        }
        //Can still see the room

        const room: Room = Game.rooms[myRoom.name];
        RoomStageController.run(myRoom, room);
        RoomSpawnController.run(myRoom, room);
        RoomTowerController.run(myRoom, room);
        RoomDefenseController.run(myRoom, room);

        const laborersStock: boolean = this.shouldLaborersStock(myRoom);

        // Creep logic
        for (let i = 0; i < myRoom.myCreeps.length; i++) {
            const myCreep: MyCreep = myRoom.myCreeps[i];
            if (myCreep.role === "Miner") {
                RoleMiner.run(myCreep as Miner, myRoom);
            } else if (myCreep.role === "Hauler") {
                RoleHauler.run(myCreep as Hauler, myRoom);
            } else if (myCreep.role === "Laborer") {
                RoleLaborer.run(myCreep as Laborer, myRoom, laborersStock);
            } else if (myCreep.role === "BankLinker") {
                RoleBankLinker.run(myCreep as BankLinker, myRoom);
            } else if (myCreep.role === "Stocker") {
                RoleStocker.run(myCreep as Stocker, myRoom);
            }
        }

        // Room source link logic
        for (let i = 0; i < myRoom.mySources.length; i++) {
            const mySource: MySource = myRoom.mySources[i];
            if (mySource.link != null) {
                RoomSourceLinkController.run(myRoom, mySource.link);
            }
        }
    }

    private static shouldLaborersStock(myRoom: MyRoom): boolean {

        if (myRoom.roomStage < 4) {
            return true;
        }

        if (Game.rooms[myRoom.name].energyAvailable > 600) {
            return false;
        }

        if ((myRoom.bank as StructureStorage).store.energy >= 1250) {
            return false;
        }

        //So we're low energy
        //If all miners are queued, they need to stock
        let foundMinerWhosAlive: boolean = false;
        let foundStockerWhosAlive: boolean = false;
        for (let j = 0; j < myRoom.myCreeps.length; j++) {
            const myCreep: MyCreep = myRoom.myCreeps[j];
            if (myCreep.role === "Miner" &&
                myCreep.spawningStatus !== "queued") {
                foundMinerWhosAlive = true;
            }
            if (myCreep.role === "Stocker" &&
                myCreep.spawningStatus !== "queued") {
                foundStockerWhosAlive = true;
            }
        }
        //If there's a stocker alive and a miner, it's fine, return false
        //Otherwise, we need laborer to stock
        if (foundStockerWhosAlive) {
            return !foundMinerWhosAlive;
        }
        return true;
    }
}