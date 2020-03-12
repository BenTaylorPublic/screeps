import {ReportController} from "../../reporting/report-controller";
import {ReportCooldownConstants} from "../../global/report-cooldown-constants";
import {RoomHelper} from "../../global/helpers/room-helper";
import {LogHelper} from "../../global/helpers/log-helper";
import {FlagHelper} from "../../global/helpers/flag-helper";

// tslint:disable-next-line: class-name
export class Stage1_6 {
    /*
    1.6 ->  2   : Room has caches length >= source amount
    1.6 <-  2   : Room has caches length < source amount
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
        myRoom.roomStage = 2;
        ReportController.email("STAGE+: Room " + LogHelper.roomNameAsLink(myRoom.name) + " increased to room stage 2");
        return true;
    }

    public static down(myRoom: MyRoom, room: Room): boolean {
        for (let i = 0; i < myRoom.mySources.length; i++) {
            const mySource: MySource = myRoom.mySources[i];
            if ((mySource.cache == null ||
                mySource.cache.id == null) &&
                (mySource.link == null ||
                    mySource.link.id == null)) {
                myRoom.roomStage = 1.6;
                ReportController.email("STAGE-: Room " + LogHelper.roomNameAsLink(myRoom.name) + " decreased to room stage 1.6");
                return true;
            }
        }
        return false;
    }

    private static step(myRoom: MyRoom, room: Room): void {
        const roomFlags: Flag[] = FlagHelper.getRoomsFlags(myRoom);
        for (let i = roomFlags.length - 1; i >= 0; i--) {
            const roomFlag: Flag = roomFlags[i];
            const flagNameSplit: string[] = roomFlag.name.split("-");
            if (flagNameSplit[0] !== "cont") {
                roomFlags.splice(i, 1);
            }
        }

        let flagsPlaced: number = 0;
        for (let i = 0; i < roomFlags.length; i++) {
            const roomFlag: Flag = roomFlags[i];
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

        if (room.find(FIND_CONSTRUCTION_SITES).length === 0 &&
            flagsPlaced + RoomHelper.amountOfStructure(room, STRUCTURE_CONTAINER) < myRoom.mySources.length) {
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
