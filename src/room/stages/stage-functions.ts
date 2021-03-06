import {RoomHelper} from "../../global/helpers/room-helper";
import {LogHelper} from "../../global/helpers/log-helper";
import {FlagHelper} from "../../global/helpers/flag-helper";
import {ReportController} from "../../reporting/report-controller";
import {ReportCooldownConstants} from "../../global/report-cooldown-constants";

export class StageFunctions {

    public static buildExtensions(myRoom: MyRoom, room: Room, numberOfExtensionsToBuild: number): void {
        const flags: Flag[] = FlagHelper.getFlags2(["ex"], room.name, numberOfExtensionsToBuild);
        let placedAtleastOne: boolean = false;
        for (let i = 0; i < flags.length; i++) {
            const roomFlag: Flag = flags[i];
            const flagNameSplit: string[] = roomFlag.name.split("-");
            const extensionNumber: number = Number(flagNameSplit[1]);
            if (extensionNumber <= numberOfExtensionsToBuild) {
                const result: ScreepsReturnCode = Game.rooms[myRoom.name].createConstructionSite(roomFlag.pos, STRUCTURE_EXTENSION);
                if (result === OK) {
                    ReportController.log("Placed extension construction site in " + LogHelper.roomNameAsLink(myRoom.name));
                    roomFlag.remove();
                    placedAtleastOne = true;
                } else if (result !== ERR_RCL_NOT_ENOUGH) {
                    ReportController.email("ERROR: Placing a extension construction site errored " + result + " in " + LogHelper.roomNameAsLink(myRoom.name));
                }
            }
        }

        if (!placedAtleastOne &&
            Game.rooms[myRoom.name].find(FIND_CONSTRUCTION_SITES).length === 0 &&
            RoomHelper.amountOfStructure(room, STRUCTURE_EXTENSION) < numberOfExtensionsToBuild) {
            ReportController.email("ATTENTION: Room " + LogHelper.roomNameAsLink(myRoom.name) + " needs more extensions (optional flag, up to ex-{1-40})",
                ReportCooldownConstants.DAY);
        }
    }

    public static buildTowers(myRoom: MyRoom, room: Room, numberOfTowersToBuild: number): void {
        const flags: Flag[] = FlagHelper.getFlags2(["tower"], room.name, numberOfTowersToBuild);

        let placedOne: boolean = false;
        for (let i = 0; i < flags.length; i++) {
            const flag: Flag = flags[i];
            const result: ScreepsReturnCode = Game.rooms[myRoom.name].createConstructionSite(flag.pos, STRUCTURE_TOWER);
            if (result === OK) {
                ReportController.log("Placed tower construction site in " + LogHelper.roomNameAsLink(myRoom.name));
                flag.remove();
                placedOne = true;
            } else {
                ReportController.email("ERROR: Placing a tower construction site errored in " + LogHelper.roomNameAsLink(myRoom.name));
            }
        }

        if (Game.rooms[myRoom.name].find(FIND_CONSTRUCTION_SITES).length === 0 &&
            (RoomHelper.amountOfStructure(room, STRUCTURE_TOWER) < numberOfTowersToBuild) &&
            !placedOne) {
            ReportController.email("ATTENTION: Room " + LogHelper.roomNameAsLink(myRoom.name) + " needs more towers (optional flag, tower-{1-6})",
                ReportCooldownConstants.DAY);
        }
    }

    public static setupSourceLink(myRoom: MyRoom): void {
        const flags: Flag[] = FlagHelper.getFlags1(["link", "source"], myRoom.name);

        let placedFully: boolean = false;

        for (let i = 0; i < flags.length; i++) {
            const flag: Flag = flags[i];
            const result: ScreepsReturnCode = Game.rooms[myRoom.name].createConstructionSite(flag.pos, STRUCTURE_LINK);
            if (result === OK) {
                for (let j = 0; j < myRoom.mySources.length; j++) {
                    const mySource: MySource = myRoom.mySources[j];
                    const source: Source | null = Game.getObjectById<Source>(mySource.id);
                    if (source == null) {
                        ReportController.email("ERROR: Source was null when trying to get it by ID in " + LogHelper.roomNameAsLink(myRoom.name));
                    } else {
                        if (source.pos.inRangeTo(flag.pos, 2)) {
                            mySource.link = {
                                pos: RoomHelper.roomPosToMyPos(flag.pos),
                                id: null
                            };
                            placedFully = true;
                        } // Else it's hopefully the other source in the room...
                    }
                }
                if (placedFully) {
                    ReportController.log("Placed source link construction site in " + LogHelper.roomNameAsLink(myRoom.name));
                    flag.remove();
                } else {
                    ReportController.email("ERROR: Placed a construction site at a flag but couldn't find a source to give it to in " + LogHelper.roomNameAsLink(myRoom.name));
                }
            } //Don't worry about errors
        }

        for (let i = 0; i < myRoom.mySources.length; i++) {
            const mySource: MySource = myRoom.mySources[i];
            if (mySource.link != null &&
                mySource.link.id == null) {
                const linkPos: RoomPosition = RoomHelper.myPosToRoomPos(mySource.link.pos);
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
            ReportController.email("ATTENTION: Room " + LogHelper.roomNameAsLink(myRoom.name) + " needs source link flag (link-source-X)",
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
                if (mySource.haulerName != null) {
                    const creep: Creep | null = Game.creeps[mySource.haulerName];
                    if (creep != null) {
                        creep.say("dthb4dshnr");
                        creep.suicide();
                    }
                    mySource.haulerName = null;
                }

                // Kill the miner if he doesn't have 1 Carry part
                if (mySource.minerName != null) {
                    const creep: Creep | null = Game.creeps[mySource.minerName];
                    if (creep != null &&
                        creep.getActiveBodyparts(CARRY) === 0) {
                        creep.say("dthb4dshnr");
                        creep.suicide();
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
                    }
                }
            }
        }
    }

    public static buildSpawns(myRoom: MyRoom, room: Room, amount: number): void {
        const flags: Flag[] = FlagHelper.getFlags1(["spawn"], myRoom.name);

        let placedSpawn: boolean = false;
        if (flags.length === 1) {
            const result: ScreepsReturnCode = flags[0].pos.createConstructionSite(STRUCTURE_SPAWN);
            if (result === OK) {
                placedSpawn = true;
                flags[0].remove();
            }
        }

        if (!placedSpawn &&
            room.find(FIND_CONSTRUCTION_SITES).length === 0 &&
            RoomHelper.amountOfStructure(room, STRUCTURE_SPAWN) < amount) {
            ReportController.email("ATTENTION: Room " + LogHelper.roomNameAsLink(room.name) + " needs a spawn (optional flag, spawn)",
                ReportCooldownConstants.DAY);
        }
    }
}
