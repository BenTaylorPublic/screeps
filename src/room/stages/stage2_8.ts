import {ReportController} from "../../reporting/report-controller";
import {ReportCooldownConstants} from "../../global/report-cooldown-constants";
import {RoomHelper} from "../../global/helpers/room-helper";
import {LogHelper} from "../../global/helpers/log-helper";
import {FlagHelper} from "../../global/helpers/flag-helper";

// tslint:disable-next-line: class-name
export class Stage2_8 {
    /*
    2.8 ->  3   : Room has caches length >= source amount
    2.8 <-  3   : Room has caches length < source amount
    */
    public static up(myRoom: MyRoom, room: Room): boolean {
        this.step(myRoom, room);
        for (let i = 0; i < myRoom.mySources.length; i++) {
            const mySource: MySource = myRoom.mySources[i];
            if ((mySource.cache == null ||
                mySource.cache.id == null) &&
                (mySource.link == null ||
                    mySource.link.id == null)) {
                return false;
            }
        }
        myRoom.roomStage = 3;
        ReportController.email("STAGE+ 3 " + LogHelper.roomNameAsLink(myRoom.name) + " caches");
        return true;
    }

    public static down(myRoom: MyRoom, room: Room): boolean {
        for (let i = 0; i < myRoom.mySources.length; i++) {
            const mySource: MySource = myRoom.mySources[i];
            if ((mySource.cache == null ||
                mySource.cache.id == null) &&
                (mySource.link == null ||
                    mySource.link.id == null)) {
                myRoom.roomStage = 2.8;
                ReportController.email("STAGE- 2.8 " + LogHelper.roomNameAsLink(myRoom.name) + " caches");
                return true;
            }
        }
        return false;
    }

    private static step(myRoom: MyRoom, room: Room): void {
        const flags: Flag[] = FlagHelper.getFlags1(["cont"], myRoom.name);

        let flagsPlaced: number = 0;
        for (let i = 0; i < flags.length; i++) {
            const roomFlag: Flag = flags[i];
            const result: ScreepsReturnCode = Game.rooms[myRoom.name].createConstructionSite(roomFlag.pos, STRUCTURE_CONTAINER);
            if (result === OK || this.containerInPos(roomFlag.pos)) {
                let placedFully: boolean = false;
                for (let j = 0; j < myRoom.mySources.length; j++) {
                    const mySource: MySource = myRoom.mySources[j];
                    const source: Source | null = Game.getObjectById<Source>(mySource.id);
                    if (source == null) {
                        ReportController.email("ERROR: Source was null when trying to get it by ID in " + LogHelper.roomNameAsLink(myRoom.name));
                    } else {
                        if (source.pos.inRangeTo(roomFlag.pos, 1)) {
                            mySource.cache = {
                                pos: {
                                    x: roomFlag.pos.x,
                                    y: roomFlag.pos.y,
                                    roomName: myRoom.name
                                },
                                id: null
                            };
                            mySource.state = "Cache";
                            flagsPlaced++;
                            placedFully = true;
                        } // Else it's hopefully the other source in the room...
                    }
                }
                if (placedFully) {
                    ReportController.log("Placed container cache construction site in " + LogHelper.roomNameAsLink(room.name));
                    roomFlag.remove();
                } else {
                    ReportController.email("ERROR: Placed a construction site at a flag but couldn't find a source to give it to, in " + LogHelper.roomNameAsLink(myRoom.name));
                }

            } else {
                ReportController.email("ERROR: Placing a container cache construction site errored in " + LogHelper.roomNameAsLink(myRoom.name));
            }
        }

        for (let i = 0; i < myRoom.mySources.length; i++) {
            const mySource: MySource = myRoom.mySources[i];
            if (mySource.cache != null &&
                mySource.cache.id == null) {
                const cachePos: RoomPosition = RoomHelper.myPosToRoomPos(mySource.cache.pos);
                const structures: Structure<StructureConstant>[] = cachePos.lookFor(LOOK_STRUCTURES);
                for (let j = 0; j < structures.length; j++) {
                    if (structures[j].structureType === STRUCTURE_CONTAINER) {
                        mySource.cache.id = structures[j].id as Id<StructureContainer>;
                        break;
                    }
                }
            }
        }

        const amountOfContainers: number = RoomHelper.amountOfStructure(room, STRUCTURE_CONTAINER);
        if (amountOfContainers >= myRoom.mySources.length) {
            const containers: StructureContainer[] = room.find<StructureContainer>(FIND_STRUCTURES, {
                filter: (structure: Structure) => {
                    return structure.structureType === STRUCTURE_CONTAINER;
                }
            });

            for (let i = 0; i < containers.length; i++) {
                const container: StructureContainer = containers[i];
                for (let j = 0; j < myRoom.mySources.length; j++) {
                    const mySource: MySource = myRoom.mySources[j];
                    if (mySource.state !== "NoCache") {
                        continue;
                    }
                    const source: Source = Game.getObjectById(myRoom.mySources[j].id) as Source;
                    if (source.pos.inRangeTo(containers[i].pos, 1)) {
                        mySource.state = "Cache";
                        mySource.cache = {
                            pos: {
                                x: container.pos.x,
                                y: container.pos.y,
                                roomName: myRoom.name
                            },
                            id: container.id
                        };
                        ReportController.log("Fixed container cache in " + LogHelper.roomNameAsLink(room.name));

                    }
                }
            }
        }

        if (room.find(FIND_CONSTRUCTION_SITES).length === 0 &&
            flagsPlaced + amountOfContainers < myRoom.mySources.length) {
            ReportController.email("ATTENTION: Room " + LogHelper.roomNameAsLink(room.name) + " needs cache container flag (cont)",
                ReportCooldownConstants.DAY);
        }
    }

    private static containerInPos(pos: RoomPosition): boolean {
        const structures = pos.lookFor(LOOK_STRUCTURES);
        for (let j = 0; j < structures.length; j++) {
            if (structures[j].structureType === STRUCTURE_CONTAINER) {
                return true;
            }
        }
        return false;
    }
}
