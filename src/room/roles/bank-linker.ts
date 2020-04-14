import {ReportController} from "../../reporting/report-controller";
import {CreepHelper} from "../../global/helpers/creep-helper";
import {LogHelper} from "../../global/helpers/log-helper";
import {MovementHelper} from "../../global/helpers/movement-helper";
import {RoomHelper} from "../../global/helpers/room-helper";
import {Constants} from "../../global/constants/constants";


export class RoleBankLinker {
    public static run(bankLinker: BankLinker, myRoom: MyRoom): void {
        if (CreepHelper.handleCreepPreRole(bankLinker)) {
            return;
        }

        const creep: Creep = Game.creeps[bankLinker.name];

        if (!bankLinker.inPos) {
            if (myRoom.bankLinkerPos == null) {
                ReportController.email("ERROR: BankLinkerPos was null for a bank linker in " + LogHelper.roomNameAsLink(myRoom.name));
                return;
            }
            const position: RoomPosition = RoomHelper.myPosToRoomPos(myRoom.bankLinkerPos);
            if (creep.pos.getRangeTo(position) === 0) {
                bankLinker.inPos = true;
            } else {
                MovementHelper.myMoveTo(creep, position, bankLinker);
                return;
            }
        }
        const room: Room = Game.rooms[myRoom.name];
        const bank: StructureStorage | null = myRoom.bank;
        if (bank == null) {
            ReportController.email("ERROR: Bank was null for a bank linker in " + LogHelper.roomNameAsLink(myRoom.name));
            return;
        }
        if (myRoom.bankLink == null ||
            myRoom.bankLink.id == null) {
            ReportController.email("ERROR: Bank Link was null for a bank linker in " + LogHelper.roomNameAsLink(myRoom.name));
            return;
        }
        const link: StructureLink | null = Game.getObjectById(myRoom.bankLink.id);
        if (link == null) {
            ReportController.email("ERROR: Bank Link was null for a bank linker in " + LogHelper.roomNameAsLink(myRoom.name));
            return;
        }

        this.creepLogic(bankLinker, room, creep, bank, link);
    }

    private static creepLogic(bankLinker: BankLinker, room: Room, creep: Creep, bank: StructureStorage, link: StructureLink): void {

        if (bankLinker.state === "LinkToBank") {
            if (creep.store.getFreeCapacity() === 0) {
                creep.transfer(bank, RESOURCE_ENERGY);
            } else if (link.store.energy >= creep.store.getCapacity()) {
                creep.withdraw(link, RESOURCE_ENERGY);
            } else if (this.terminalNeedsEnergy(room) &&
                bank.store.energy >= creep.store.getCapacity()) {
                creep.withdraw(bank, RESOURCE_ENERGY);
                bankLinker.state = "EnergyToTerminal";
            }
        } else if (bankLinker.state === "EnergyToTerminal") {
            const terminals: StructureTerminal[] | null = room.find<StructureTerminal>(FIND_MY_STRUCTURES, {
                filter(structure: AnyStructure): boolean {
                    return structure.structureType === STRUCTURE_TERMINAL;
                }
            });
            if (terminals.length === 1) {
                creep.transfer(terminals[0], RESOURCE_ENERGY);
            }
            bankLinker.state = "LinkToBank";
        }
    }

    private static terminalNeedsEnergy(room: Room): boolean {
        const terminals: StructureTerminal[] | null = room.find<StructureTerminal>(FIND_MY_STRUCTURES, {
            filter(structure: AnyStructure): boolean {
                return structure.structureType === STRUCTURE_TERMINAL;
            }
        });
        return terminals.length === 1 &&
            terminals[0].store.getUsedCapacity(RESOURCE_ENERGY) < Constants.TERMINAL_GOAL_ENERGY;
    }
}
