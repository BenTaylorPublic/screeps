import {RoomHelper} from "../../global/helpers/room-helper";
import {LogHelper} from "../../global/helpers/log-helper";
import {FlagHelper} from "../../global/helpers/flag-helper";
import {ReportController} from "../../reporting/report-controller";
import {ReportCooldownConstants} from "../../global/report-cooldown-constants";

// tslint:disable-next-line: class-name
export class Stage5_8 {
    /*
    5.8 ->  6 : Room has terminal
    5.8 <-  6 : Room has no terminal
    */
    public static up(myRoom: MyRoom, room: Room): boolean {
        this.step(myRoom, room);
        if (RoomHelper.amountOfStructure(room, STRUCTURE_TERMINAL) >= 1) {
            myRoom.roomStage = 6;
            ReportController.email("STAGE+ 6 " + LogHelper.roomNameAsLink(myRoom.name) + " terminal");
            return true;
        }
        return false;
    }

    public static down(myRoom: MyRoom, room: Room): boolean {
        if (RoomHelper.amountOfStructure(room, STRUCTURE_TERMINAL) < 1) {
            myRoom.roomStage = 5.8;
            ReportController.email("STAGE- 5.8 " + LogHelper.roomNameAsLink(myRoom.name) + " terminal");
            return true;
        }
        return false;
    }

    private static step(myRoom: MyRoom, room: Room): void {
        const flag: Flag | null = FlagHelper.getFlag1(["terminal"], myRoom.name);

        let placedTerminal: boolean = false;
        if (flag != null) {
            const result: ScreepsReturnCode = flag.pos.createConstructionSite(STRUCTURE_TERMINAL);
            if (result === OK) {
                placedTerminal = true;
                flag.remove();
            }
        }

        if (!placedTerminal &&
            room.find(FIND_CONSTRUCTION_SITES).length === 0 &&
            RoomHelper.amountOfStructure(room, STRUCTURE_TERMINAL) < 1) {
            ReportController.email("ATTENTION: Room " + LogHelper.roomNameAsLink(room.name) + " needs a terminal flag (terminal)",
                ReportCooldownConstants.DAY);
        }
    }
}
