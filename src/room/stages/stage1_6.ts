import {HelperFunctions} from "../../global/helper-functions";
import {ReportController} from "../../reporting/report-controller";
import {SpawnMiner} from "../spawns/spawn-miner";

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
        ReportController.log("STAGE", "Room " + myRoom.name + " increased to room stage 2");
        for (let i = 0; i < myRoom.mySources.length; i++) {
            const mySource: MySource = myRoom.mySources[i];
            SpawnMiner.spawnMiner(myRoom, mySource);
        }
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
                ReportController.log("STAGE", "Room " + myRoom.name + " decreased to room stage 1.6");
                return true;
            }
        }
        return false;
    }

    private static step(myRoom: MyRoom, room: Room): void {
        const roomFlags: Flag[] = HelperFunctions.getRoomsFlags(myRoom);
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
                        ReportController.log("ERROR", "Source was null when trying to get it by ID");
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
                    console.log("LOG: Placed container cache construction site");
                    roomFlag.remove();
                } else {
                    ReportController.log("ERROR", "Placed a construction site at a flag but couldn't find a source to give it to");
                }

            } else {
                ReportController.log("ERROR", "Placing a container cache construction site errored");
            }
        }

        for (let i = 0; i < myRoom.mySources.length; i++) {
            const mySource: MySource = myRoom.mySources[i];
            if (mySource.cache != null &&
                mySource.cache.id == null) {
                const cachePos: RoomPosition = HelperFunctions.myPosToRoomPos(mySource.cache.pos);
                const structures: Structure<StructureConstant>[] = cachePos.lookFor(LOOK_STRUCTURES);
                for (let j = 0; j < structures.length; j++) {
                    if (structures[j].structureType === STRUCTURE_CONTAINER) {
                        mySource.cache.id = structures[j].id as Id<StructureContainer>;
                        break;
                    }
                }
            }
        }

        if (flagsPlaced !== myRoom.mySources.length &&
            room.find(FIND_CONSTRUCTION_SITES).length === 0) {
            console.log("ATTENTION: Room " + myRoom.name + " needs cache container flag (cont)");
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
