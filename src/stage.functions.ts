import { GlobalFunctions } from "./global.functions";

export class StageFunctions {

    public static buildExtensions(myRoom: MyRoom, numberOfExtensionsToBuild: number): void {
        const roomFlags: Flag[] = GlobalFunctions.getRoomsFlags(myRoom);
        for (let i = roomFlags.length - 1; i >= 0; i--) {
            const roomFlag: Flag = roomFlags[i];
            const flagNameSplit: string[] = roomFlag.name.split("-");
            if (flagNameSplit[0] !== "ex") {
                roomFlags.splice(i, 1);
            }
        }
        for (let i = 0; i < roomFlags.length; i++) {
            const roomFlag: Flag = roomFlags[i];
            const flagNameSplit: string[] = roomFlag.name.split("-");
            const extensionNumber: number = Number(flagNameSplit[1]);
            if (extensionNumber <= numberOfExtensionsToBuild) {
                const result: ScreepsReturnCode = Game.rooms[myRoom.name].createConstructionSite(roomFlag.pos, STRUCTURE_EXTENSION);
                if (result === OK) {
                    console.log("LOG: Placed extension construction site");
                    myRoom.myExtensionPositions.push({
                        x: roomFlag.pos.x,
                        y: roomFlag.pos.y,
                        roomName: myRoom.name
                    });
                    roomFlag.remove();
                } else {
                    console.log("ERR: Placing a extension construction site errored");
                }
            }
        }

        if (Game.rooms[myRoom.name].find(FIND_CONSTRUCTION_SITES).length === 0) {
            console.log("ATTENTION: Room " + myRoom.name + " needs more extension flags (up to ex-" + numberOfExtensionsToBuild.toString() + ")");
        }
    }

    public static buildTowers(myRoom: MyRoom, numberOfTowersToBuild: number): void {
        const roomFlags: Flag[] = GlobalFunctions.getRoomsFlags(myRoom);
        for (let i = roomFlags.length - 1; i >= 0; i--) {
            const roomFlag: Flag = roomFlags[i];
            const flagNameSplit: string[] = roomFlag.name.split("-");
            if (flagNameSplit[0] !== "tower") {
                roomFlags.splice(i, 1);
            }
        }
        for (let i = 0; i < roomFlags.length; i++) {
            const roomFlag: Flag = roomFlags[i];
            const flagNameSplit: string[] = roomFlag.name.split("-");
            const towerNumber: number = Number(flagNameSplit[1]);
            if (towerNumber <= numberOfTowersToBuild) {
                const result: ScreepsReturnCode = Game.rooms[myRoom.name].createConstructionSite(roomFlag.pos, STRUCTURE_TOWER);
                if (result === OK) {
                    console.log("LOG: Placed tower construction site");
                    myRoom.myTowerPositions.push({
                        x: roomFlag.pos.x,
                        y: roomFlag.pos.y,
                        roomName: myRoom.name
                    });
                    roomFlag.remove();
                } else {
                    console.log("ERR: Placing a tower construction site errored");
                }
            }
        }
    }

    public static setupSourceLink(myRoom: MyRoom): void {
        const roomFlags: Flag[] = GlobalFunctions.getRoomsFlags(myRoom);
        for (let i = roomFlags.length - 1; i >= 0; i--) {
            const roomFlag: Flag = roomFlags[i];
            const flagNameSplit: string[] = roomFlag.name.split("-");
            if (flagNameSplit[0] !== "link" ||
                flagNameSplit[1] === "bank") {
                roomFlags.splice(i, 1);
            }
        }

        let placedFully: boolean = false;

        for (let i = 0; i < roomFlags.length; i++) {
            const roomFlag: Flag = roomFlags[i];
            const result: ScreepsReturnCode = Game.rooms[myRoom.name].createConstructionSite(roomFlag.pos, STRUCTURE_LINK);
            if (result === OK) {
                for (let j = 0; j < myRoom.mySources.length; j++) {
                    const mySource: MySource = myRoom.mySources[j];
                    const source: Source | null = Game.getObjectById<Source>(mySource.id);
                    if (source == null) {
                        console.log("ERR: Source was null when trying to get it by ID");
                    } else {
                        if (source.pos.inRangeTo(roomFlag.pos, 2)) {
                            mySource.link = {
                                pos: GlobalFunctions.roomPosToMyPos(roomFlag.pos),
                                id: null
                            };
                            placedFully = true;
                        } // Else it's hopefully the other source in the room...
                    }
                }
                if (placedFully) {
                    console.log("LOG: Placed source link construction site");
                    roomFlag.remove();
                } else {
                    console.log("ERR: Placed a construction site at a flag but couldn't find a source to give it to");
                }
            } //Don't worry about errors
        }

        for (let i = 0; i < myRoom.mySources.length; i++) {
            const mySource: MySource = myRoom.mySources[i];
            if (mySource.link != null &&
                mySource.link.id == null) {
                const linkPos: RoomPosition = GlobalFunctions.myPosToRoomPos(mySource.link.pos);
                const structures: Structure<StructureConstant>[] = linkPos.lookFor(LOOK_STRUCTURES);
                for (let j = 0; j < structures.length; j++) {
                    if (structures[j].structureType === STRUCTURE_LINK) {
                        mySource.link.id = structures[j].id;
                        mySource.state = "Link";
                        break;
                    }
                }
            }
        }

        if (!placedFully &&
            Game.rooms[myRoom.name].find(FIND_CONSTRUCTION_SITES).length === 0) {
            console.log("ATTENTION: Room " + myRoom.name + " needs source link flag (link-X)");
        }
    }

    public static clearHaulersAndCaches(myRoom: MyRoom): void {
        for (let i = 0; i < myRoom.mySources.length; i++) {
            const mySource: MySource = myRoom.mySources[i];
            if (mySource.state === "Link" &&
                mySource.link != null &&
                mySource.link.id != null) {
                console.log("LOG: " + myRoom.name + " is transitioning to room stage 5. Killing a bunch creeps and buildings");
                // Source has a link that's setup
                // Kill all the haulers
                for (let j = 0; j < mySource.haulerNames.length; j++) {
                    const haulerName: string = mySource.haulerNames[j];
                    const creep: Creep | null = Game.creeps[haulerName];
                    if (creep != null) {
                        creep.say("dthb4dshnr");
                        creep.suicide();
                        console.log("LOG: " + myRoom.name + " killed a hauler");
                    }
                }
                mySource.haulerNames = [];

                // Kill the miner if he doesn't have 1 Carry part
                if (mySource.minerName != null) {
                    const creep: Creep | null = Game.creeps[mySource.minerName];
                    if (creep != null &&
                        creep.getActiveBodyparts(CARRY) === 0) {
                        creep.say("dthb4dshnr");
                        creep.suicide();
                        mySource.minerName = null;
                        console.log("LOG: " + myRoom.name + " killed a miner with no CARRY");
                    }
                }

                // Destroy the caches
                if (mySource.cache != null &&
                    mySource.cache.id != null) {
                    const cache: StructureContainer | null = Game.getObjectById<StructureContainer>(mySource.cache.id);
                    if (cache == null) {
                        mySource.cache.id = null;
                    } else {
                        cache.destroy();
                        mySource.cache.id = null;
                        console.log("LOG: " + myRoom.name + " destroyed a cache");
                    }
                }
            }
        }
    }
}
