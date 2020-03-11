import {HelperFunctions} from "../../global/helpers/helper-functions";
import {ReportController} from "../../reporting/report-controller";
import {ReportCooldownConstants} from "../../global/report-cooldown-constants";

export class StageFunctions {

    public static buildExtensions(myRoom: MyRoom, room: Room, numberOfExtensionsToBuild: number): void {
        const roomFlags: Flag[] = HelperFunctions.getRoomsFlags(myRoom);
        for (let i = roomFlags.length - 1; i >= 0; i--) {
            const roomFlag: Flag = roomFlags[i];
            const flagNameSplit: string[] = roomFlag.name.split("-");
            if (flagNameSplit[0] !== "ex") {
                roomFlags.splice(i, 1);
            }
        }
        let placedAtleastOne: boolean = false;
        for (let i = 0; i < roomFlags.length; i++) {
            const roomFlag: Flag = roomFlags[i];
            const flagNameSplit: string[] = roomFlag.name.split("-");
            const extensionNumber: number = Number(flagNameSplit[1]);
            if (extensionNumber <= numberOfExtensionsToBuild) {
                const result: ScreepsReturnCode = Game.rooms[myRoom.name].createConstructionSite(roomFlag.pos, STRUCTURE_EXTENSION);
                if (result === OK) {
                    ReportController.log("Placed extension construction site in " + HelperFunctions.roomNameAsLink(myRoom.name));
                    roomFlag.remove();
                    placedAtleastOne = true;
                } else if (result !== ERR_RCL_NOT_ENOUGH) {
                    ReportController.email("ERROR: Placing a extension construction site errored " + result + " in " + HelperFunctions.roomNameAsLink(myRoom.name));
                }
            }
        }

        if (!placedAtleastOne &&
            Game.rooms[myRoom.name].find(FIND_CONSTRUCTION_SITES).length === 0 &&
            HelperFunctions.amountOfStructure(room, STRUCTURE_EXTENSION) < numberOfExtensionsToBuild) {
            ReportController.email("ATTENTION: Room " + HelperFunctions.roomNameAsLink(myRoom.name) + " needs more extension flags (up to ex-" + numberOfExtensionsToBuild.toString() + ")",
                ReportCooldownConstants.DAY);
        }
    }

    public static buildTowers(myRoom: MyRoom, room: Room, numberOfTowersToBuild: number): void {
        const roomFlags: Flag[] = HelperFunctions.getRoomsFlags(myRoom);
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
                    ReportController.log("Placed tower construction site in " + HelperFunctions.roomNameAsLink(myRoom.name));
                    roomFlag.remove();
                } else {
                    ReportController.email("ERROR: Placing a tower construction site errored in " + HelperFunctions.roomNameAsLink(myRoom.name));
                }
            }
        }

        if (Game.rooms[myRoom.name].find(FIND_CONSTRUCTION_SITES).length === 0 &&
            (HelperFunctions.amountOfStructure(room, STRUCTURE_TOWER) < numberOfTowersToBuild)) {
            ReportController.email("ATTENTION: Room " + HelperFunctions.roomNameAsLink(myRoom.name) + " needs more tower flags (up to tower-" + numberOfTowersToBuild + ")",
                ReportCooldownConstants.DAY);
        }
    }

    public static setupSourceLink(myRoom: MyRoom): void {
        const roomFlags: Flag[] = HelperFunctions.getRoomsFlags(myRoom);
        for (let i = roomFlags.length - 1; i >= 0; i--) {
            const roomFlag: Flag = roomFlags[i];
            const flagNameSplit: string[] = roomFlag.name.split("-");
            if (flagNameSplit[0] !== "link" ||
                flagNameSplit[1] !== "source") {
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
                        ReportController.email("ERROR: Source was null when trying to get it by ID in " + HelperFunctions.roomNameAsLink(myRoom.name));
                    } else {
                        if (source.pos.inRangeTo(roomFlag.pos, 2)) {
                            mySource.link = {
                                pos: HelperFunctions.roomPosToMyPos(roomFlag.pos),
                                id: null
                            };
                            placedFully = true;
                        } // Else it's hopefully the other source in the room...
                    }
                }
                if (placedFully) {
                    ReportController.log("Placed source link construction site in " + HelperFunctions.roomNameAsLink(myRoom.name));
                    roomFlag.remove();
                } else {
                    ReportController.email("ERROR: Placed a construction site at a flag but couldn't find a source to give it to in " + HelperFunctions.roomNameAsLink(myRoom.name));
                }
            } //Don't worry about errors
        }

        for (let i = 0; i < myRoom.mySources.length; i++) {
            const mySource: MySource = myRoom.mySources[i];
            if (mySource.link != null &&
                mySource.link.id == null) {
                const linkPos: RoomPosition = HelperFunctions.myPosToRoomPos(mySource.link.pos);
                const structures: Structure<StructureConstant>[] = linkPos.lookFor(LOOK_STRUCTURES);
                for (let j = 0; j < structures.length; j++) {
                    if (structures[j].structureType === STRUCTURE_LINK) {
                        mySource.link.id = structures[j].id as Id<StructureLink>;
                        mySource.state = "Link";
                        break;
                    }
                }
            }
        }

        if (!placedFully &&
            Game.rooms[myRoom.name].find(FIND_CONSTRUCTION_SITES).length === 0) {
            ReportController.email("ATTENTION: Room " + HelperFunctions.roomNameAsLink(myRoom.name) + " needs source link flag (link-source-X)",
                ReportCooldownConstants.DAY);
        }
    }


    public static clearHaulersAndCaches(myRoom: MyRoom): void {
        for (let i = 0; i < myRoom.mySources.length; i++) {
            const mySource: MySource = myRoom.mySources[i];
            if (mySource.state === "Link" &&
                mySource.link != null &&
                mySource.link.id != null) {
                // Source has a link that's setup
                // Kill all the haulers
                for (let j = 0; j < mySource.haulerNames.length; j++) {
                    const haulerName: string = mySource.haulerNames[j];
                    const creep: Creep | null = Game.creeps[haulerName];
                    if (creep != null) {
                        creep.say("dthb4dshnr");
                        creep.suicide();
                        ReportController.log("" + HelperFunctions.roomNameAsLink(myRoom.name) + " clearHaulersAndCaches killed a hauler");
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
                        ReportController.log("" + HelperFunctions.roomNameAsLink(myRoom.name) + " clearHaulersAndCaches killed a miner with no CARRY");
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
                        ReportController.log("" + HelperFunctions.roomNameAsLink(myRoom.name) + " clearHaulersAndCaches destroyed a cache");
                    }
                }
            }
        }
    }

    public static buildSpawns(myRoom: MyRoom, room: Room, amount: number): void {
        const roomFlags: Flag[] = HelperFunctions.getRoomsFlags(myRoom);
        for (let i = roomFlags.length - 1; i >= 0; i--) {
            const roomFlag: Flag = roomFlags[i];
            const flagNameSplit: string[] = roomFlag.name.split("-");
            if (flagNameSplit[0] !== "spawn") {
                roomFlags.splice(i, 1);
            }
        }

        let placedSpawn: boolean = false;
        if (roomFlags.length === 1) {
            const result: ScreepsReturnCode = roomFlags[0].pos.createConstructionSite(STRUCTURE_SPAWN);
            if (result === OK) {
                placedSpawn = true;
                roomFlags[0].remove();
            }
        }

        if (!placedSpawn &&
            room.find(FIND_CONSTRUCTION_SITES).length === 0 &&
            HelperFunctions.amountOfStructure(room, STRUCTURE_SPAWN) < amount) {
            ReportController.email("ATTENTION: Room " + HelperFunctions.roomNameAsLink(room.name) + " needs a spawn flag (spawn)",
                ReportCooldownConstants.DAY);
        }
    }
}
