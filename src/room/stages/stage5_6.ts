import {RoomHelper} from "../../global/helpers/room-helper";
import {LogHelper} from "../../global/helpers/log-helper";
import {ReportController} from "../../reporting/report-controller";
import {ReportCooldownConstants} from "../../global/report-cooldown-constants";
import {FlagHelper} from "../../global/helpers/flag-helper";

// tslint:disable-next-line: class-name
export class Stage5_6 {
    /*
    5.6 ->  5.8 : Room has extractor and 1 container
    5.6 <-  5.8 : Room has no extractor or no containers
    */
    public static up(myRoom: MyRoom, room: Room): boolean {
        this.step(myRoom, room);
        if (RoomHelper.amountOfStructure(room, STRUCTURE_EXTRACTOR) >= 1 &&
            RoomHelper.amountOfStructure(room, STRUCTURE_CONTAINER) >= 1) {
            myRoom.roomStage = 5.8;
            ReportController.email("STAGE+ 5.8 " + LogHelper.roomNameAsLink(myRoom.name) + " extractor + digger cont");
            return true;
        }
        return false;
    }

    public static down(myRoom: MyRoom, room: Room): boolean {
        if (RoomHelper.amountOfStructure(room, STRUCTURE_EXTRACTOR) < 1 ||
            RoomHelper.amountOfStructure(room, STRUCTURE_CONTAINER) < 1) {
            myRoom.roomStage = 5.6;
            ReportController.email("STAGE- 5.6 " + LogHelper.roomNameAsLink(myRoom.name) + " extractor + digger cont");
            return true;
        }
        return false;
    }

    private static step(myRoom: MyRoom, room: Room): void {
        let placedSomething: boolean = false;
        const minerals: Mineral[] = room.find(FIND_MINERALS);
        if (minerals.length === 1) {
            const mineral: Mineral = minerals[0];
            const result: ScreepsReturnCode = mineral.pos.createConstructionSite(STRUCTURE_EXTRACTOR);
            if (result === OK) {
                placedSomething = true;
            }
        }

        const flag: Flag | null = FlagHelper.getFlag1(["digger", "cont"], myRoom.name);
        if (flag != null) {
            flag.remove();
            const result: ScreepsReturnCode = flag.pos.createConstructionSite(STRUCTURE_CONTAINER);
            if (result === OK) {
                placedSomething = true;
            }
        }
        const extractors: StructureExtractor[] = room.find<StructureExtractor>(FIND_STRUCTURES, {
            filter: (structure: Structure) => {
                return structure.structureType === STRUCTURE_EXTRACTOR;
            }
        });
        if (extractors.length === 1) {
            const containers: StructureContainer[] = room.find<StructureContainer>(FIND_STRUCTURES, {
                filter: (structure: Structure) => {
                    return structure.structureType === STRUCTURE_CONTAINER;
                }
            });

            for (let i = 0; i < containers.length; i++) {
                const container: StructureContainer = containers[i];
                if (extractors[0].pos.inRangeTo(containers[i].pos, 1)) {
                    myRoom.digging.cache = {
                        pos: {
                            x: container.pos.x,
                            y: container.pos.y,
                            roomName: myRoom.name
                        },
                        id: container.id
                    };
                }
            }
        }

        if (!placedSomething &&
            room.find(FIND_CONSTRUCTION_SITES).length === 0 &&
            RoomHelper.amountOfStructure(room, STRUCTURE_CONTAINER) < 1) {
            ReportController.email("ATTENTION: Room " + LogHelper.roomNameAsLink(room.name) + " needs a digger cont (digger-cont)",
                ReportCooldownConstants.DAY);
        }
    }
}
