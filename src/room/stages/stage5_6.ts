import {HelperFunctions} from "../../global/helper-functions";
import {ReportController} from "../../reporting/report-controller";
import {ReportCooldownConstants} from "../../global/report-cooldown-constants";

// tslint:disable-next-line: class-name
export class Stage5_6 {
    /*
    5.6 ->  5.8 : Room has extractor
    5.6 <-  5.8 : Room has no extractor
    */
    public static up(myRoom: MyRoom, room: Room): boolean {
        this.step(myRoom, room);
        if (HelperFunctions.amountOfStructure(room, STRUCTURE_EXTRACTOR) >= 1) {
            myRoom.roomStage = 5.8;
            ReportController.email("STAGE+: Room " + HelperFunctions.roomNameAsLink(myRoom.name) + " increased to room stage 5.8");
            return true;
        }
        return false;
    }

    public static down(myRoom: MyRoom, room: Room): boolean {
        if (HelperFunctions.amountOfStructure(room, STRUCTURE_EXTRACTOR) < 1) {
            myRoom.roomStage = 5.6;
            ReportController.email("STAGE-: Room " + HelperFunctions.roomNameAsLink(myRoom.name) + " decreased to room stage 5.6");
            return true;
        }
        return false;
    }

    private static step(myRoom: MyRoom, room: Room): void {
        let placedExtractor: boolean = false;
        const minerals: Mineral<MineralConstant>[] = room.find(FIND_MINERALS);
        if (minerals.length === 1) {
            const mineral: Mineral = minerals[0];
            const result: ScreepsReturnCode = mineral.pos.createConstructionSite(STRUCTURE_EXTRACTOR);
            if (result === OK) {
                placedExtractor = true;
            }
        }

        if (!placedExtractor &&
            room.find(FIND_CONSTRUCTION_SITES).length === 0) {
            ReportController.email("ATTENTION: Room " + HelperFunctions.roomNameAsLink(room.name) + " couldn't place an extractor",
                ReportCooldownConstants.DAY);
        }
    }
}
