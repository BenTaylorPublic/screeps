"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const minerAndWorker_role_1 = require("minerAndWorker.role");
const room_tower_controller_1 = require("room.tower.controller");
const miner_role_1 = require("miner.role");
const hauler_role_1 = require("hauler.role");
const room_stage_controller_1 = require("room.stage.controller");
const laborer_role_1 = require("laborer.role");
const room_building_controller_1 = require("room.building.controller");
const room_spawning_controller_1 = require("room.spawning.controller");
exports.roomController = {
    run: function (myRoom) {
        if (Game.rooms[myRoom.name] == null) {
            //No longer have vision of this room
            console.log("ERR: No longer have vision of room " + myRoom.name);
            return;
        }
        //Can still see the room
        const room = Game.rooms[myRoom.name];
        if (Game.time % 10 === 0) {
            //Only run every 10 ticks
            room_stage_controller_1.roomStageController.run(myRoom);
            room_building_controller_1.roomBuildingController.run(myRoom);
        }
        room_spawning_controller_1.roomSpawningController.run(myRoom);
        //Tower logic
        const towers = room.find(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_TOWER, my: true } });
        for (let i = 0; i < towers.length; i++) {
            room_tower_controller_1.roomTowerController.run(towers[i]);
        }
        //MinerAndWorker logic
        for (let i = 0; i < myRoom.myCreeps.length; i++) {
            const myCreep = myRoom.myCreeps[i];
            if (myCreep.role === "MinerAndWorker") {
                minerAndWorker_role_1.minerAndWorkerRole.run(myCreep);
            }
            else if (myCreep.role === "Miner") {
                miner_role_1.minerRole.run(myCreep);
            }
            else if (myCreep.role === "Hauler") {
                hauler_role_1.haulerRole.run(myCreep, myRoom);
            }
            else if (myCreep.role === "Laborer") {
                laborer_role_1.laborerRole.run(myCreep, myRoom);
            }
        }
    }
};
