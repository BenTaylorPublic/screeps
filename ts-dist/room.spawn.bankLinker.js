"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const global_functions_1 = require("./global.functions");
class RoomSpawnBankLinker {
    static run(myRoom) {
        if (myRoom.roomStage < 5) {
            return;
        }
        if (myRoom.bankLinkerName != null) {
            return;
        }
        const bankLinker = this.spawnBankLinker(myRoom);
        if (bankLinker != null) {
            myRoom.myCreeps.push(bankLinker);
            myRoom.bankLinkerName = bankLinker.name;
        }
    }
    static spawnBankLinker(myRoom) {
        if (myRoom.spawns.length === 0) {
            console.log("ERR: Attempted to spawn BankLinker in a room with no spawner (1)");
            return null;
        }
        const spawn = Game.spawns[myRoom.spawns[0].name];
        if (spawn == null) {
            console.log("ERR: Attempted to spawn BankLinker in a room with no spawner (2)");
            return null;
        }
        const id = global_functions_1.GlobalFunctions.getId();
        const result = spawn.spawnCreep([MOVE, CARRY], "Creep" + id, {
            memory: {
                name: "Creep" + id,
                role: "BankLinker",
                assignedRoomName: spawn.room.name
            }
        });
        if (result === OK) {
            return {
                name: "Creep" + id,
                role: "BankLinker",
                assignedRoomName: spawn.room.name
            };
        }
        return null;
    }
}
exports.RoomSpawnBankLinker = RoomSpawnBankLinker;
