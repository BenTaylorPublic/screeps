import { RoomTowerController } from "./structures/tower";
import { RoleMiner } from "./roles/miner";
import { RoleHauler } from "./roles/hauler";
import { RoomStageController } from "./room-stage-controller";
import { RoleLaborer } from "./roles/laborer";
import { RoomSpawnController } from "./spawns/room-spawn-controller";
import { RoleBankLinker } from "./roles/bank-linker";
import { RoomSourceLinkController } from "./structures/source-link";

export class RoomController {
    public static run(myRoom: MyRoom): void {
        if (Game.rooms[myRoom.name] == null) {
            //No longer have vision of this room
            console.log("ERR: No longer have vision of room " + myRoom.name);
            return;
        }
        //Can still see the room

        const room: Room = Game.rooms[myRoom.name];

        if (Game.time % 10 === 0) {
            //Only run every 10 ticks
            RoomStageController.run(myRoom);
        }
        RoomSpawnController.run(myRoom);

        //Tower logic
        const towers: StructureTower[] = room.find<StructureTower>(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_TOWER, my: true } });
        for (let i = 0; i < towers.length; i++) {
            RoomTowerController.run(towers[i]);
        }

        // Creep logic
        for (let i = 0; i < myRoom.myCreeps.length; i++) {
            const myCreep: MyCreep = myRoom.myCreeps[i];
            if (myCreep.role === "Miner") {
                RoleMiner.run(myCreep as Miner);
            } else if (myCreep.role === "Hauler") {
                RoleHauler.run(myCreep as Hauler, myRoom);
            } else if (myCreep.role === "Laborer") {
                RoleLaborer.run(myCreep as Laborer, myRoom);
            } else if (myCreep.role === "BankLinker") {
                RoleBankLinker.run(myCreep as BankLinker, myRoom);
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
}



