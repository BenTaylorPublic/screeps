import { minerAndWorkerRole } from "minerAndWorker.role";
import { roomTowerController } from "room.tower.controller";
import { minerRole } from "miner.role";
import { haulerRole } from "hauler.role";
import { roomStageController } from "room.stage.controller";
import { laborerRole } from "laborer.role";
import { roomBuildingController } from "room.building.controller";
import { roomSpawningController } from "room.spawning.controller";

export const roomController: any = {
    run: function (myRoom: MyRoom) {

        if (Game.rooms[myRoom.name] == null) {
            //No longer have vision of this room
            console.log("ERR: No longer have vision of room " + myRoom.name);
            return;
        }
        //Can still see the room

        const room: Room = Game.rooms[myRoom.name];

        if (Game.time % 10 === 0) {
            //Only run every 10 ticks
            roomStageController.run(myRoom);
            roomBuildingController.run(myRoom);
        }
        roomSpawningController.run(myRoom);

        //Tower logic
        const towers: StructureTower[] = room.find<StructureTower>(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_TOWER, my: true } });
        for (let i = 0; i < towers.length; i++) {
            roomTowerController.run(towers[i]);
        }

        //MinerAndWorker logic
        for (let i = 0; i < myRoom.myCreeps.length; i++) {
            const myCreep: MyCreep = myRoom.myCreeps[i];
            if (myCreep.role === "MinerAndWorker") {
                minerAndWorkerRole.run(myCreep);
            } else if (myCreep.role === "Miner") {
                minerRole.run(myCreep);
            } else if (myCreep.role === "Hauler") {
                haulerRole.run(myCreep, myRoom);
            } else if (myCreep.role === "Laborer") {
                laborerRole.run(myCreep, myRoom);
            }
        }
    }
};




