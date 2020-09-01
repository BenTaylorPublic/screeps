import {RoomTowerController} from "./structures/tower";
import {RoleMiner} from "./roles/miner";
import {RoleHauler} from "./roles/hauler";
import {RoomStageController} from "./room-stage-controller";
import {RoleLaborer} from "./roles/laborer";
import {RoomSpawnController} from "./spawns/room-spawn-controller";
import {RoleBankLinker} from "./roles/bank-linker";
import {RoomLinkController} from "./structures/link";
import {ReportController} from "../reporting/report-controller";
import {RoleStocker} from "./roles/stocker";
import {LogHelper} from "../global/helpers/log-helper";
import {RoomDefenseController} from "./room-defense-controller";
import {RoleDigger} from "./roles/digger";
import {RoomLabController} from "./structures/lab";
import {RoomNukerController} from "./structures/nuker";
import {RoleUpgrader} from "./roles/upgrader";
import {RoomPowerSpawnController} from "./structures/power-spawn";

export class RoomController {
    public static run(myRoom: MyRoom, transfer: Transfer | null): void {
        if (Game.rooms[myRoom.name] == null) {
            //No longer have vision of this room
            ReportController.email("ERROR: No longer have vision of room " + LogHelper.roomNameAsLink(myRoom.name));
            return;
        }
        //Can still see the room

        const room: Room = Game.rooms[myRoom.name];
        RoomStageController.run(myRoom, room);
        RoomSpawnController.run(myRoom, room);
        RoomTowerController.run(myRoom, room);
        RoomDefenseController.run(myRoom, room);
        RoomNukerController.run(myRoom, room);
        RoomPowerSpawnController.run(myRoom, room);

        const laborersStock: boolean = this.shouldLaborersStock(myRoom);

        const bankLinkerShouldStockLink: boolean = RoomLinkController.run(myRoom);

        const labOrder: LabOrder | null = RoomLabController.run(myRoom);

        // Creep logic
        for (let i = 0; i < myRoom.myCreeps.length; i++) {
            const myCreep: MyCreep = myRoom.myCreeps[i];
            if (myCreep.role === "Miner") {
                RoleMiner.run(myCreep as Miner, myRoom);
            } else if (myCreep.role === "BankLinker") {
                RoleBankLinker.run(myCreep as BankLinker, myRoom, transfer, bankLinkerShouldStockLink);
            } else if (myCreep.role === "Stocker") {
                RoleStocker.run(myCreep as Stocker, myRoom, labOrder);
            } else if (myCreep.role === "Laborer") {
                RoleLaborer.run(myCreep as Laborer, myRoom, laborersStock);
            } else if (myCreep.role === "Upgrader") {
                RoleUpgrader.run(myCreep as Upgrader, myRoom);
            } else if (myCreep.role === "Digger") {
                RoleDigger.run(myCreep as Digger, myRoom);
            } else if (myCreep.role === "Hauler") {
                RoleHauler.run(myCreep as Hauler, myRoom);
            }
        }

        //Deleting the bank
        if (myRoom.bank != null) {
            myRoom.bank.object = null;
        }
    }

    private static shouldLaborersStock(myRoom: MyRoom): boolean {

        if (myRoom.roomStage < 4) {
            return true;
        }

        if (Game.rooms[myRoom.name].energyAvailable > 600) {
            return false;
        }

        if (((myRoom.bank as Bank).object as StructureStorage).store.energy >= 1250) {
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