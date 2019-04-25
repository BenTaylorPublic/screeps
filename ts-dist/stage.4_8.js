"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Stage4_8 {
    static up(myRoom, room) {
        this.step(myRoom, room);
        for (let i = 0; i < myRoom.mySources.length; i++) {
            const mySource = myRoom.mySources[i];
            if (mySource.state === "Link" &&
                mySource.link != null &&
                mySource.link.id != null &&
                mySource.cache != null &&
                mySource.cache.id == null &&
                mySource.haulerNames.length === 0) {
                myRoom.roomStage = 5;
                console.log("LOG: Room " + myRoom.name + " increased to room stage 5");
                return true;
            }
        }
        return false;
    }
    static down(myRoom, room) {
        let foundLinkedSource = false;
        for (let i = 0; i < myRoom.mySources.length; i++) {
            const mySource = myRoom.mySources[i];
            if (mySource.state === "Link" &&
                mySource.link != null &&
                mySource.link.id != null &&
                mySource.cache != null &&
                mySource.cache.id == null &&
                mySource.haulerNames.length === 0) {
                foundLinkedSource = true;
                break;
            }
        }
        if (!foundLinkedSource) {
            myRoom.roomStage = 4.8;
            console.log("LOG: Room " + myRoom.name + " decreased to room stage 4.8");
            return true;
        }
        return false;
    }
    static step(myRoom, room) {
        for (let i = 0; i < myRoom.mySources.length; i++) {
            const mySource = myRoom.mySources[i];
            if (mySource.state === "Link" &&
                mySource.link != null &&
                mySource.link.id != null) {
                for (let j = 0; j < mySource.haulerNames.length; j++) {
                    const haulerName = mySource.haulerNames[j];
                    const creep = Game.creeps[haulerName];
                    if (creep != null) {
                        creep.say("dthb4dshnr");
                        creep.suicide();
                    }
                }
                mySource.haulerNames = [];
                if (mySource.minerName != null) {
                    const creep = Game.creeps[mySource.minerName];
                    if (creep != null &&
                        creep.getActiveBodyparts(CARRY) === 0) {
                        creep.say("dthb4dshnr");
                        creep.suicide();
                        mySource.minerName = null;
                    }
                }
                if (mySource.cache != null &&
                    mySource.cache.id != null) {
                    const cache = Game.getObjectById(mySource.cache.id);
                    if (cache == null) {
                        mySource.cache.id = null;
                    }
                    else {
                        cache.destroy();
                        mySource.cache.id = null;
                    }
                }
            }
        }
    }
}
exports.Stage4_8 = Stage4_8;
