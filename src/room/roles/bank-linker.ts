import {ReportController} from "../../reporting/report-controller";
import {CreepHelper} from "../../global/helpers/creep-helper";
import {LogHelper} from "../../global/helpers/log-helper";
import {MovementHelper} from "../../global/helpers/movement-helper";
import {RoomHelper} from "../../global/helpers/room-helper";
import {Constants} from "../../global/constants/constants";


export class RoleBankLinker {
    public static run(bankLinker: BankLinker, myRoom: MyRoom, transfer: Transfer | null): void {
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

        this.creepLogic(bankLinker, room, creep, bank, link, transfer);
    }

    private static creepLogic(bankLinker: BankLinker, room: Room, creep: Creep, bank: StructureStorage, link: StructureLink, transfer: Transfer | null): void {

        if (bankLinker.state === "Default") {
            if (creep.store.getFreeCapacity() === 0) {
                creep.transfer(bank, RESOURCE_ENERGY);
            } else if (link.store.energy >= Constants.BANK_LINKER_CAPACITY) {
                creep.withdraw(link, RESOURCE_ENERGY);
            } else if (this.terminalNeedsEnergy(room, transfer) &&
                bank.store.energy >= Constants.BANK_LINKER_CAPACITY) {
                creep.withdraw(bank, RESOURCE_ENERGY);
                bankLinker.state = "ResourceToTerminal";
            } else if (transfer != null) {
                this.tryHandleTransfer(bankLinker, room, creep, bank, transfer);
            }
        } else if (bankLinker.state === "EnergyToTerminal") {
            const terminals: StructureTerminal[] = room.find<StructureTerminal>(FIND_MY_STRUCTURES, {
                filter(structure: AnyStructure): boolean {
                    return structure.structureType === STRUCTURE_TERMINAL;
                }
            });
            if (terminals.length === 1) {
                creep.transfer(terminals[0], RESOURCE_ENERGY);
            }
            bankLinker.state = "Default";
        } else if (bankLinker.state === "ResourceToTerminal") {
            const terminal: StructureTerminal | null = this.getTerminal(room);
            if (terminal != null) {
                const resources: ResourceConstant[] = Object.keys(creep.store) as ResourceConstant[];
                for (let i: number = 0; i < resources.length; i++) {
                    creep.transfer(terminal, resources[i]);
                }
            }
            if (transfer != null) {
                transfer.amountLeft -= Constants.BANK_LINKER_CAPACITY;
            }
            bankLinker.state = "Default";
        } else if (bankLinker.state === "ResourceToBank") {
            const terminal: StructureTerminal | null = this.getTerminal(room);
            if (terminal != null) {
                const resources: ResourceConstant[] = Object.keys(creep.store) as ResourceConstant[];
                for (let i: number = 0; i < resources.length; i++) {
                    creep.transfer(bank, resources[i]);
                }
            }
            if (transfer != null) {
                transfer.amountLeft -= Constants.BANK_LINKER_CAPACITY;
            }
            bankLinker.state = "Default";
        }
    }

    private static tryHandleTransfer(bankLinker: BankLinker, room: Room, creep: Creep, bank: StructureStorage, transfer: Transfer): void {
        if (transfer.state === "Loading") {
            creep.withdraw(bank, transfer.resource);
            bankLinker.state = "ResourceToTerminal";
        } else if (transfer.state === "Unloading") {
            const terminal: StructureTerminal | null = this.getTerminal(room);
            if (terminal != null) {
                creep.withdraw(terminal, transfer.resource);
                bankLinker.state = "ResourceToBank";
            }
        }
    }

    private static terminalNeedsEnergy(room: Room, transfer: Transfer | null): boolean {
        const terminal: StructureTerminal | null = this.getTerminal(room);
        if (terminal == null) {
            return false;
        }
        if (transfer != null &&
            transfer.resource === "energy" &&
            transfer.roomFrom === room.name &&
            transfer.state === "Loading") {
            return terminal.store.getUsedCapacity(RESOURCE_ENERGY) < (transfer.amount + Constants.TERMINAL_GOAL_ENERGY);
        } else {
            return terminal.store.getUsedCapacity(RESOURCE_ENERGY) < Constants.TERMINAL_GOAL_ENERGY;
        }
    }

    private static getTerminal(room: Room): StructureTerminal | null {
        const terminals: StructureTerminal[] = room.find<StructureTerminal>(FIND_MY_STRUCTURES, {
            filter(structure: AnyStructure): boolean {
                return structure.structureType === STRUCTURE_TERMINAL;
            }
        });
        if (terminals.length === 1) {
            return terminals[0];
        }
        return null;
    }
}
