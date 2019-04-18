"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const room_tower_controller_1 = require("room.tower.controller");
const role_miner_1 = require("role.miner");
const role_hauler_1 = require("role.hauler");
const room_stage_controller_1 = require("room.stage.controller");
const role_laborer_1 = require("role.laborer");
const room_spawn_controller_1 = require("room.spawn.controller");
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
        }
        room_spawn_controller_1.roomSpawnController.run(myRoom);
        //Tower logic
        const towers = room.find(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_TOWER, my: true } });
        for (let i = 0; i < towers.length; i++) {
            room_tower_controller_1.roomTowerController.run(towers[i]);
        }
        for (let i = 0; i < myRoom.myCreeps.length; i++) {
            const myCreep = myRoom.myCreeps[i];
            if (myCreep.role === "Miner") {
                role_miner_1.roleMiner.run(myCreep);
            }
            else if (myCreep.role === "Hauler") {
                role_hauler_1.roleHauler.run(myCreep, myRoom);
            }
            else if (myCreep.role === "Laborer") {
                role_laborer_1.roleLaborer.run(myCreep, myRoom);
            }
        }
    }
};
