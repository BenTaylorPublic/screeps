import {ReportController} from "../../reporting/report-controller";
import {CreepHelper} from "../../global/helpers/creep-helper";
import {LogHelper} from "../../global/helpers/log-helper";
import {MovementHelper} from "../../global/helpers/movement-helper";
import {RoomHelper} from "../../global/helpers/room-helper";
import {Constants} from "../../global/constants/constants";
import {ReportCooldownConstants} from "../../global/report-cooldown-constants";

export class RoleBankLinker {
    public static run(bankLinker: BankLinker, myRoom: MyRoom, transfer: Transfer | null, bankLinkerShouldStockLink: boolean): void {
        if (CreepHelper.handleCreepPreRole(bankLinker)) {
            return;
        }
        if (myRoom.bank == null) {
            ReportController.email("ERROR: BankMemory was null for a bank linker in " + LogHelper.roomNameAsLink(myRoom.name));
            return;
        }

        const creep: Creep = Game.creeps[bankLinker.name];

        if (!bankLinker.inPos) {
            const position: RoomPosition = RoomHelper.myPosToRoomPos(myRoom.bank.bankLinkerPos);
            if (creep.pos.getRangeTo(position) === 0) {
                bankLinker.inPos = true;
            } else {
                MovementHelper.myMoveTo(creep, position, bankLinker);
                return;
            }
        }
        const room: Room = Game.rooms[myRoom.name];
        const bank: StructureStorage | null = myRoom.bank.object;
        if (bank == null) {
            ReportController.email("ERROR: Bank was null for a bank linker in " + LogHelper.roomNameAsLink(myRoom.name));
            return;
        }
        if (myRoom.bank.bankLink == null ||
            myRoom.bank.bankLink.id == null) {
            ReportController.email("ERROR: Bank Link was null for a bank linker in " + LogHelper.roomNameAsLink(myRoom.name));
            return;
        }
        const link: StructureLink | null = Game.getObjectById(myRoom.bank.bankLink.id);
        if (link == null) {
            ReportController.email("ERROR: Bank Link was null for a bank linker in " + LogHelper.roomNameAsLink(myRoom.name));
            return;
        }
        let buffer: StructureLab | null = null;
        if (myRoom.labs != null) {
            buffer = Game.getObjectById(myRoom.labs.buffingLab);
        }

        this.creepLogic(bankLinker, room, creep, bank, link, transfer, bankLinkerShouldStockLink, buffer);
    }

    private static creepLogic(bankLinker: BankLinker, room: Room, creep: Creep, bank: StructureStorage, link: StructureLink, transfer: Transfer | null, bankLinkerShouldStockLink: boolean, buffer: StructureLab | null): void {

        if (bankLinker.state === "Default") {
            if (creep.store.getFreeCapacity() === 0) {
                creep.transfer(bank, RESOURCE_ENERGY);
            } else if (bankLinkerShouldStockLink &&
                bank.store.energy > Constants.BANK_LINKER_CAPACITY) {
                creep.withdraw(bank, RESOURCE_ENERGY);
                bankLinker.state = "EnergyToLink";
            } else if (link.store.energy >= Constants.BANK_LINKER_CAPACITY) {
                creep.withdraw(link, RESOURCE_ENERGY);
            } else if (this.terminalNeedsEnergy(room, transfer) &&
                bank.store.energy >= Constants.BANK_LINKER_CAPACITY) {
                creep.withdraw(bank, RESOURCE_ENERGY);
                bankLinker.state = "ResourceToTerminal";
            } else if (this.bufferNeedsEnergy(buffer) &&
                bank.store.energy >= Constants.BANK_LINKER_CAPACITY) {
                creep.withdraw(bank, RESOURCE_ENERGY);
                bankLinker.state = "EnergyToBuffer";
            } else if (transfer != null) {
                this.tryHandleTransfer(bankLinker, room, creep, bank, transfer);
            } else {
                this.cleanTerminalIfNeeded(bankLinker, room, creep);
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
        } else if (bankLinker.state === "EnergyToBuffer") {
            if (buffer == null) {
                creep.transfer(bank, RESOURCE_ENERGY);
            } else {
                creep.transfer(buffer, RESOURCE_ENERGY);
            }
            bankLinker.state = "Default";
        } else if (bankLinker.state === "ResourceToTerminal") {
            const terminal: StructureTerminal | null = RoomHelper.getTerminal(room);
            let resource: ResourceConstant | null = null;
            if (terminal != null) {
                const resources: ResourceConstant[] = Object.keys(creep.store) as ResourceConstant[];
                for (let i: number = 0; i < resources.length; i++) {
                    if (creep.transfer(terminal, resources[i]) === OK) {
                        resource = resources[i];
                        break;
                    }
                }
            }
            if (transfer != null &&
                transfer.resource === resource) {
                transfer.amountLeft -= Constants.BANK_LINKER_CAPACITY;
            }
            bankLinker.state = "Default";
        } else if (bankLinker.state === "ResourceToBank") {
            const terminal: StructureTerminal | null = RoomHelper.getTerminal(room);
            let resource: ResourceConstant | null = null;
            if (terminal != null) {
                const resources: ResourceConstant[] = Object.keys(creep.store) as ResourceConstant[];
                for (let i: number = 0; i < resources.length; i++) {
                    if (creep.transfer(bank, resources[i]) === OK) {
                        resource = resources[i];
                        break;
                    }
                }
            }
            if (transfer != null &&
                transfer.resource === resource) {
                transfer.amountLeft -= Constants.BANK_LINKER_CAPACITY;
            }
            bankLinker.state = "Default";
        } else if (bankLinker.state === "EnergyToLink") {
            creep.transfer(link, RESOURCE_ENERGY);
            bankLinker.state = "Default";
        }
    }

    //Hopefully don't need this function forever
    private static cleanTerminalIfNeeded(bankLinker: BankLinker, room: Room, creep: Creep): void {
        if (Memory.myMemory.empire.transfers.length !== 0) {
            return;
        }
        const terminal: StructureTerminal | null = RoomHelper.getTerminal(room);
        if (terminal != null) {
            const resources: ResourceConstant[] = Object.keys(terminal.store) as ResourceConstant[];
            for (let i: number = 0; i < resources.length; i++) {
                if (resources[i] === "energy") {
                    continue;
                }
                if (creep.withdraw(terminal, resources[i]) === OK) {
                    bankLinker.state = "ResourceToBank";
                    ReportController.email("BAD: Creep is cleaning the terminal in " + LogHelper.roomNameAsLink(room.name), ReportCooldownConstants.HOUR);
                    break;
                }
            }
        }
    }

    private static tryHandleTransfer(bankLinker: BankLinker, room: Room, creep: Creep, bank: StructureStorage, transfer: Transfer): void {
        if (transfer.state === "Loading") {
            creep.withdraw(bank, transfer.resource);
            bankLinker.state = "ResourceToTerminal";
        } else if (transfer.state === "Unloading") {
            const terminal: StructureTerminal | null = RoomHelper.getTerminal(room);
            if (terminal != null) {
                creep.withdraw(terminal, transfer.resource);
                bankLinker.state = "ResourceToBank";
            }
        }
    }

    private static terminalNeedsEnergy(room: Room, transfer: Transfer | null): boolean {
        const terminal: StructureTerminal | null = RoomHelper.getTerminal(room);
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

    private static bufferNeedsEnergy(buffer: StructureLab | null): boolean {
        return buffer != null &&
            buffer.store.getFreeCapacity(RESOURCE_ENERGY) >= Constants.BANK_LINKER_CAPACITY;
    }
}
