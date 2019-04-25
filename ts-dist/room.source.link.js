"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class RoomSourceLink {
    static run(myRoom, myLink) {
        if (myLink.id === null) {
            return;
        }
        if (myRoom.bankLink == null ||
            myRoom.bankLink.id == null) {
            return;
        }
        const link = Game.getObjectById(myLink.id);
        if (link === null) {
            console.log("ERR: Link was null when accessed by ID. Setting it to null");
            myLink.id = null;
            return;
        }
        if (link.energy === link.energyCapacity) {
            const bankLink = Game.getObjectById(myRoom.bankLink.id);
            if (bankLink === null) {
                console.log("ERR: Bank link was null when accessed by ID. Setting it to null");
                myRoom.bankLink.id = null;
                return;
            }
            link.transferEnergy(bankLink);
        }
    }
}
exports.RoomSourceLink = RoomSourceLink;
