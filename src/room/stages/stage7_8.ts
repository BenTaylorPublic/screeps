import {RoomHelper} from "../../global/helpers/room-helper";
import {LogHelper} from "../../global/helpers/log-helper";
import {ReportController} from "../../reporting/report-controller";
import {ReportCooldownConstants} from "../../global/report-cooldown-constants";
import {FlagHelper} from "../../global/helpers/flag-helper";

// tslint:disable-next-line: class-name
export class Stage7_8 {
    /*
    7.8 ->  7.9   : Room has >= 10 lab
    7.8 <-  7.9   : Room has < 10 labs
    */
    public static up(myRoom: MyRoom, room: Room): boolean {
        this.step(myRoom, room);
        if (RoomHelper.amountOfStructure(room, STRUCTURE_LAB) >= 10) {
            myRoom.roomStage = 7.9;
            ReportController.email("STAGE+ 7.9 " + LogHelper.roomNameAsLink(myRoom.name) + " 10 labs");
            return true;
        }
        return false;
    }

    public static down(myRoom: MyRoom, room: Room): boolean {
        if (RoomHelper.amountOfStructure(room, STRUCTURE_LAB) < 10) {
            myRoom.roomStage = 7.8;
            ReportController.email("STAGE- 7.8 " + LogHelper.roomNameAsLink(myRoom.name) + " 10 labs");
            return true;
        }
        return false;
    }

    private static step(myRoom: MyRoom, room: Room): void {
        if (RoomHelper.amountOfStructure(room, STRUCTURE_LAB) < 10) {
            if (Game.rooms[myRoom.name].find(FIND_CONSTRUCTION_SITES).length === 0) {
                ReportController.email("ATTENTION: Room " + LogHelper.roomNameAsLink(myRoom.name) + " needs more labs built, place manually",
                    ReportCooldownConstants.DAY);
            }
            return;
        }
        const labBufferFlag: Flag | null = FlagHelper.getFlag(["lab", "buffer"], myRoom.name);
        if (labBufferFlag == null) {
            ReportController.email("ATTENTION: Room " + LogHelper.roomNameAsLink(myRoom.name) + " needs a buffer lab flag (lab-buffer)",
                ReportCooldownConstants.DAY);
            return;
        }
        const labReagent1Flag: Flag | null = FlagHelper.getFlag(["lab", "reagent", "1"], myRoom.name);
        if (labReagent1Flag == null) {
            ReportController.email("ATTENTION: Room " + LogHelper.roomNameAsLink(myRoom.name) + " needs a lab reagent 1 flag (lab-reagent-1)",
                ReportCooldownConstants.DAY);
            return;
        }
        const labReagent2Flag: Flag | null = FlagHelper.getFlag(["lab", "reagent", "2"], myRoom.name);
        if (labReagent2Flag == null) {
            ReportController.email("ATTENTION: Room " + LogHelper.roomNameAsLink(myRoom.name) + " needs a lab reagent 2 flag (lab-reagent-2)",
                ReportCooldownConstants.DAY);
            return;
        }

        //Should be good
        const labs: StructureLab[] = room.find<StructureLab>(FIND_STRUCTURES, {
            filter: (structure: Structure) => {
                return structure.structureType === STRUCTURE_LAB;
            }
        });
        let bufferId: Id<StructureLab> | null = null;
        let reagent1Id: Id<StructureLab> | null = null;
        let reagent2Id: Id<StructureLab> | null = null;
        const compoundLabs: CompoundLabMemory[] = [];
        for (let i: number = 0; i < labs.length; i++) {
            const lab: StructureLab = labs[i];
            if (lab.pos.isEqualTo(labBufferFlag.pos)) {
                bufferId = lab.id;
            } else if (lab.pos.isEqualTo(labReagent1Flag.pos)) {
                reagent1Id = lab.id;
            } else if (lab.pos.isEqualTo(labReagent2Flag.pos)) {
                reagent2Id = lab.id;
            } else {
                compoundLabs.push({
                    id: lab.id,
                    cooldownTill: 0
                });
            }
        }

        if (compoundLabs.length === 7 &&
            bufferId != null &&
            reagent1Id != null &&
            reagent2Id != null) {
            myRoom.labs = {
                buffingLab: bufferId,
                reagentLab1: reagent1Id,
                reagentLab2: reagent2Id,
                compundLabs: compoundLabs
            };
        }
    }
}
