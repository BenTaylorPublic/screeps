import {ReportController} from "../../reporting/report-controller";
import {RoomHelper} from "../../global/helpers/room-helper";
import {LogHelper} from "../../global/helpers/log-helper";

// tslint:disable-next-line: class-name
export class Stage4_7 {
    /*
    4.7 ->  4.8 : Room has a rampart over the bank and bank link
    4.7 <-  4.8 : Room doesn't have a rampart over the bank or bank link
    */
    public static up(myRoom: MyRoom, room: Room): boolean {
        if (myRoom.bank == null ||
            myRoom.bank.bankLink == null) {
            return false;
        }
        const bankRoomPos: RoomPosition = RoomHelper.myPosToRoomPos(myRoom.bank.bankPos);
        const bankRampart: StructureRampart | null = this.getRampart(bankRoomPos);
        if (bankRampart == null) {
            const result: ScreepsReturnCode = bankRoomPos.createConstructionSite(STRUCTURE_RAMPART);
            if (result === OK) {
                ReportController.log(`Created a bank rampart in ${LogHelper.roomNameAsLink(room.name)}`);
            }
        }

        const bankLinkRoomPos: RoomPosition = RoomHelper.myPosToRoomPos(myRoom.bank.bankLink.pos);
        const bankLinkRampart: StructureRampart | null = this.getRampart(bankLinkRoomPos);
        if (bankLinkRampart == null) {
            const result: ScreepsReturnCode = bankLinkRoomPos.createConstructionSite(STRUCTURE_RAMPART);
            if (result === OK) {
                ReportController.log(`Created a bank link rampart in ${LogHelper.roomNameAsLink(room.name)}`);
            }
        }
        if (bankRampart != null &&
            bankLinkRampart != null) {
            myRoom.roomStage = 4.8;
            ReportController.email("STAGE+ 4.8 " + LogHelper.roomNameAsLink(myRoom.name) + " ramparts for bank and bank link");
            return true;
        }
        return false;
    }

    public static down(myRoom: MyRoom, room: Room): boolean {
        if (myRoom.bank == null ||
            myRoom.bank.bankLink == null) {
            ReportController.email("STAGE- 4.7 " + LogHelper.roomNameAsLink(myRoom.name) + " ramparts for bank and bank link");
            return true;
        }
        const bankRoomPos: RoomPosition = RoomHelper.myPosToRoomPos(myRoom.bank.bankPos);
        const bankRampart: StructureRampart | null = this.getRampart(bankRoomPos);
        const bankLinkRoomPos: RoomPosition = RoomHelper.myPosToRoomPos(myRoom.bank.bankLink.pos);
        const bankLinkRampart: StructureRampart | null = this.getRampart(bankLinkRoomPos);
        if (bankRampart == null ||
            bankLinkRampart == null) {
            myRoom.roomStage = 4.7;
            ReportController.email("STAGE- 4.7 " + LogHelper.roomNameAsLink(myRoom.name) + " ramparts for bank and bank link");
            return true;
        }
        return false;
    }

    private static getRampart(roomPos: RoomPosition): StructureRampart | null {
        const roomPosStructures: Structure[] = roomPos.lookFor(LOOK_STRUCTURES);
        for (const structure of roomPosStructures) {
            if (structure.structureType === STRUCTURE_RAMPART) {
                return structure as StructureRampart;
            }
        }

        return null;
    }
}
