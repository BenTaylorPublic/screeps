import {RoomHelper} from "../../global/helpers/room-helper";
import {LogHelper} from "../../global/helpers/log-helper";
import {ReportController} from "../../reporting/report-controller";
import {FlagHelper} from "../../global/helpers/flag-helper";
import {ReportCooldownConstants} from "../../global/report-cooldown-constants";

// tslint:disable-next-line: class-name
export class Stage6_6 {
    /*
    6.6 ->  6.8 : Room has controller link
    6.6 <-  6.8 : Room has no controller link
    */
    public static up(myRoom: MyRoom, room: Room): boolean {
        this.step(myRoom, room);
        if (RoomHelper.amountOfStructure(room, STRUCTURE_LINK) >= myRoom.mySources.length + 2) {
            myRoom.roomStage = 6.8;
            ReportController.email("STAGE+ 6.8 " + LogHelper.roomNameAsLink(myRoom.name) + " controller link");
            return true;
        }
        return false;
    }

    public static down(myRoom: MyRoom, room: Room): boolean {
        if (RoomHelper.amountOfStructure(room, STRUCTURE_LINK) < myRoom.mySources.length + 2) {
            myRoom.roomStage = 6.6;
            ReportController.email("STAGE- 6.6 " + LogHelper.roomNameAsLink(myRoom.name) + " controller link");
            return true;
        }
        return false;
    }

    private static step(myRoom: MyRoom, room: Room): void {
        const flag: Flag | null = FlagHelper.getFlag(["link", "controller"], myRoom.name);

        let placedControllerLink: boolean = false;

        if (flag != null) {
            const result: ScreepsReturnCode = Game.rooms[myRoom.name].createConstructionSite(flag.pos, STRUCTURE_LINK);
            if (result === OK) {
                myRoom.controllerLink = {
                    pos: RoomHelper.roomPosToMyPos(flag.pos),
                    id: null
                };
                flag.remove();
                placedControllerLink = true;
                ReportController.log("Placed a controller link construction site in " + LogHelper.roomNameAsLink(room.name));
            } else {
                ReportController.email("ERROR: Placing a controller link construction site errored in " + LogHelper.roomNameAsLink(myRoom.name));
            }
        }
        if (myRoom.controllerLink != null) {
            const linkPos: RoomPosition = RoomHelper.myPosToRoomPos((myRoom.controllerLink as MyLink).pos);
            const structures: Structure<StructureConstant>[] = linkPos.lookFor(LOOK_STRUCTURES);
            for (let j = 0; j < structures.length; j++) {
                if (structures[j].structureType === STRUCTURE_LINK) {
                    (myRoom.controllerLink as MyLink).id = structures[j].id as Id<StructureLink>;
                    return;
                }
            }
        }

        if (!placedControllerLink &&
            Game.rooms[myRoom.name].find(FIND_CONSTRUCTION_SITES).length === 0) {
            ReportController.email("ATTENTION: Room " + LogHelper.roomNameAsLink(room.name) + " needs controller link flag (link-controller)",
                ReportCooldownConstants.DAY);
        }
    }
}
