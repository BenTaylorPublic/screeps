import {StageFunctions} from "./stage-functions";
import {ReportController} from "../../reporting/report-controller";
import {ReportCooldownConstants} from "../../global/report-cooldown-constants";
import {RoomHelper} from "../../global/helpers/room-helper";
import {LogHelper} from "../../global/helpers/log-helper";
import {FlagHelper} from "../../global/helpers/flag-helper";

// tslint:disable-next-line: class-name
export class Stage4_6 {
    /*
    4.6 ->  4.8 : Room has 2 links
    4.6 <-  4.8 : Room has < 2 links
    */
    public static up(myRoom: MyRoom, room: Room): boolean {
        this.step(myRoom, room);
        if (RoomHelper.amountOfStructure(room, STRUCTURE_LINK) >= 2) {
            myRoom.roomStage = 4.8;
            ReportController.email("STAGE+ 4.8 " + LogHelper.roomNameAsLink(myRoom.name) + " 2 links");
            return true;
        }
        return false;
    }

    public static down(myRoom: MyRoom, room: Room): boolean {
        if (RoomHelper.amountOfStructure(room, STRUCTURE_LINK) < 2) {
            myRoom.roomStage = 4.6;
            ReportController.email("STAGE- 4.6 " + LogHelper.roomNameAsLink(myRoom.name) + " 2 links");
            return true;
        }
        return false;
    }

    private static step(myRoom: MyRoom, room: Room): void {

        //Bank link logic
        const flag: Flag | null = FlagHelper.getFlag(["link", "bank"], myRoom.name);

        let placedBankLink: boolean = false;

        if (flag != null) {
            const result: ScreepsReturnCode = Game.rooms[myRoom.name].createConstructionSite(flag.pos, STRUCTURE_LINK);
            if (result === OK) {
                myRoom.bankLink = {
                    pos: RoomHelper.roomPosToMyPos(flag.pos),
                    id: null
                };
                flag.remove();
                placedBankLink = true;
                ReportController.log("Placed a bank link construction site in " + LogHelper.roomNameAsLink(room.name));
            } else {
                ReportController.email("ERROR: Placing a bank link construction site errored in " + LogHelper.roomNameAsLink(myRoom.name));
            }
        }
        if (myRoom.bankLink != null) {
            const linkPos: RoomPosition = RoomHelper.myPosToRoomPos(myRoom.bankLink.pos);
            const structures: Structure<StructureConstant>[] = linkPos.lookFor(LOOK_STRUCTURES);
            for (let j = 0; j < structures.length; j++) {
                if (structures[j].structureType === STRUCTURE_LINK) {
                    myRoom.bankLink.id = structures[j].id as Id<StructureLink>;
                    break;
                }
            }
        }

        if (!placedBankLink &&
            Game.rooms[myRoom.name].find(FIND_CONSTRUCTION_SITES).length === 0) {
            ReportController.email("ATTENTION: Room " + LogHelper.roomNameAsLink(room.name) + " needs bank link flag (link-bank-X)",
                ReportCooldownConstants.DAY);
        }

        //Source links
        StageFunctions.setupSourceLink(myRoom);
    }
}
