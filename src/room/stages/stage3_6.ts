import {RoomHelper} from "../../global/helpers/room-helper";
import {LogHelper} from "../../global/helpers/log-helper";
import {FlagHelper} from "../../global/helpers/flag-helper";
import {ReportController} from "../../reporting/report-controller";
import {ReportCooldownConstants} from "../../global/report-cooldown-constants";

// tslint:disable-next-line: class-name
export class Stage3_6 {
    /*
    3.6 ->  4   : Room has a storage bank
    3.6 <-  4   : Room does not have a storage bank
    */
    public static up(myRoom: MyRoom, room: Room): boolean {
        this.step(myRoom, room);
        if (RoomHelper.amountOfStructure(room, STRUCTURE_STORAGE) >= 1) {
            myRoom.roomStage = 4;
            ReportController.email("STAGE+ 4 " + LogHelper.roomNameAsLink(myRoom.name) + " bank");

            //Setting the bank object to null, so it's usable for the rest of the tick
            const bankPos: RoomPosition = RoomHelper.myPosToRoomPos((myRoom.bank as Bank).bankPos);
            const structures: Structure<StructureConstant>[] = bankPos.lookFor(LOOK_STRUCTURES);
            for (let j = 0; j < structures.length; j++) {
                if (structures[j].structureType === STRUCTURE_STORAGE) {
                    (myRoom.bank as Bank).object = structures[j] as StructureStorage;
                    break;
                }
            }
            return true;
        }
        return false;
    }

    public static down(myRoom: MyRoom, room: Room): boolean {
        if (RoomHelper.amountOfStructure(room, STRUCTURE_STORAGE) < 1) {
            myRoom.roomStage = 3.6;
            ReportController.email("STAGE- 3.6 " + LogHelper.roomNameAsLink(myRoom.name) + " bank");
            return true;
        }
        return false;
    }

    private static step(myRoom: MyRoom, room: Room): void {
        const bankLinkerPosFlag: Flag | null = FlagHelper.getFlag(["bank", "linker", "pos"], myRoom.name);
        if (bankLinkerPosFlag == null) {
            return;
        }
        bankLinkerPosFlag.remove();
        const storage: StructureStorage[] = room.find<StructureStorage>(FIND_STRUCTURES, {
            filter: (structure: Structure) => {
                return structure.structureType === STRUCTURE_STORAGE;
            }
        });
        if (storage.length === 1) {
            myRoom.bank = {
                bankPos: {
                    x: storage[0].pos.x,
                    y: storage[0].pos.y,
                    roomName: myRoom.name
                },
                bankLinkerName: null,
                bankLinkerPos: RoomHelper.roomPosToMyPos(bankLinkerPosFlag.pos),
                bankLink: null,
                object: null
            };
            return;
        }
        const flag: Flag | null = FlagHelper.getFlag(["storage"], myRoom.name);
        let placedBank: boolean = false;
        if (flag != null) {
            const result: ScreepsReturnCode = Game.rooms[myRoom.name].createConstructionSite(flag.pos, STRUCTURE_STORAGE);
            if (result === OK) {
                ReportController.log("Placed storage bank construction site in " + LogHelper.roomNameAsLink(room.name));
                flag.remove();
                placedBank = true;
            } else {
                ReportController.email("ERROR: Placing a storage bank construction site errored in " + LogHelper.roomNameAsLink(room.name));
            }
        }

        if (Game.rooms[myRoom.name].find(FIND_CONSTRUCTION_SITES).length === 0 &&
            RoomHelper.amountOfStructure(room, STRUCTURE_STORAGE) < 1 &&
            !placedBank) {
            ReportController.email("ATTENTION: Room " + LogHelper.roomNameAsLink(myRoom.name) + " needs a bank flag (storage)",
                ReportCooldownConstants.DAY);
        }
    }
}
