"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class RoleBankLinker {
    static run(bankLinker, myRoom) {
        const creep = Game.creeps[bankLinker.name];
        if (creep == null) {
            console.log("ERR: BankLinker creep is null. Creep ID: " + bankLinker.name);
            return;
        }
        if (bankLinker.assignedRoomName !== creep.room.name) {
            creep.say("Fukn Lost");
            creep.moveTo(new RoomPosition(25, 25, bankLinker.assignedRoomName));
            return;
        }
        if (creep.carry[RESOURCE_ENERGY] === creep.carryCapacity) {
            const bank = myRoom.bank;
            if (bank == null) {
                console.log("ERR: Bank was null for a bank linker");
                return;
            }
            if (creep.transfer(bank, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                creep.moveTo(bank);
            }
        }
        else {
            if (myRoom.bankLink == null ||
                myRoom.bankLink.id == null) {
                console.log("ERR: Bank Link was null for a bank linker");
                return;
            }
            const link = Game.getObjectById(myRoom.bankLink.id);
            if (link == null) {
                console.log("ERR: Bank Link was null for a bank linker");
                return;
            }
            if (creep.withdraw(link, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                creep.moveTo(link);
            }
        }
    }
}
exports.RoleBankLinker = RoleBankLinker;
