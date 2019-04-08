import { roomTowerController } from "room.tower.controller";
import { roleMiner } from "role.miner";
import { roleHauler } from "role.hauler";
import { roomStageController } from "room.stage.controller";
import { roleLaborer } from "role.laborer";
import { roomBuildingController } from "room.building.controller";
import { roomSpawnController } from "room.spawn.controller";

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
        roomSpawnController.run(myRoom);

        //Tower logic
        const towers: StructureTower[] = room.find<StructureTower>(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_TOWER, my: true } });
        for (let i = 0; i < towers.length; i++) {
            roomTowerController.run(towers[i]);
        }

        for (let i = 0; i < myRoom.myCreeps.length; i++) {
            const myCreep: MyCreep = myRoom.myCreeps[i];
            if (myCreep.role === "Miner") {
                roleMiner.run(myCreep);
            } else if (myCreep.role === "Hauler") {
                roleHauler.run(myCreep, myRoom);
            } else if (myCreep.role === "Laborer") {
                roleLaborer.run(myCreep, myRoom);
            }
        }
    }
};




