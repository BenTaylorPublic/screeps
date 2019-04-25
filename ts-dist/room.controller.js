"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const room_tower_controller_1 = require("./room.tower.controller");
const role_miner_1 = require("./role.miner");
const role_hauler_1 = require("./role.hauler");
const room_stage_controller_1 = require("./room.stage.controller");
const role_laborer_1 = require("./role.laborer");
const room_spawn_controller_1 = require("./room.spawn.controller");
const role_bankLinker_1 = require("./role.bankLinker");
const room_source_link_1 = require("./room.source.link");
class RoomController {
    static run(myRoom) {
        if (Game.rooms[myRoom.name] == null) {
            console.log("ERR: No longer have vision of room " + myRoom.name);
            return;
        }
        const room = Game.rooms[myRoom.name];
        if (Game.time % 10 === 0) {
            room_stage_controller_1.RoomStageController.run(myRoom);
        }
        room_spawn_controller_1.RoomSpawnController.run(myRoom);
        const towers = room.find(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_TOWER, my: true } });
        for (let i = 0; i < towers.length; i++) {
            room_tower_controller_1.RoomTowerController.run(towers[i]);
        }
        for (let i = 0; i < myRoom.myCreeps.length; i++) {
            const myCreep = myRoom.myCreeps[i];
            if (myCreep.role === "Miner") {
                role_miner_1.RoleMiner.run(myCreep);
            }
            else if (myCreep.role === "Hauler") {
                role_hauler_1.RoleHauler.run(myCreep, myRoom);
            }
            else if (myCreep.role === "Laborer") {
                role_laborer_1.RoleLaborer.run(myCreep, myRoom);
            }
            else if (myCreep.role === "BankLinker") {
                role_bankLinker_1.RoleBankLinker.run(myCreep, myRoom);
            }
        }
        for (let i = 0; i < myRoom.mySources.length; i++) {
            const mySource = myRoom.mySources[i];
            if (mySource.link != null) {
                room_source_link_1.RoomSourceLink.run(myRoom, mySource.link);
            }
        }
    }
}
exports.RoomController = RoomController;
