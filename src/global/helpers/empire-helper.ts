import {ReportController} from "../../reporting/report-controller";
import {LogHelper} from "./log-helper";

export class EmpireHelper {
    public static isAllyUsername(username: string): boolean {
        return ["james1652"].indexOf(username.toLowerCase()) !== -1;
    }

    public static getValidResourceTransfer(empire: Empire, roomName: string): Transfer | null {
        for (let i: number = 0; i < empire.transfers.length; i++) {
            const transfer: Transfer = empire.transfers[i];
            if (transfer.roomFrom === roomName) {
                if (transfer.state === "Loading") {
                    if (transfer.amountLeft === 0) {
                        const terminals: StructureTerminal[] = Game.rooms[roomName].find<StructureTerminal>(FIND_MY_STRUCTURES, {
                            filter(structure: AnyStructure): boolean {
                                return structure.structureType === STRUCTURE_TERMINAL;
                            }
                        });
                        if (terminals.length === 1) {
                            const terminal: StructureTerminal = terminals[0];
                            if (terminal.store.getUsedCapacity(transfer.resource) >= transfer.amount) {
                                const transferResult: ScreepsReturnCode = terminal.send(transfer.resource, transfer.amount, transfer.roomTo);
                                if (transferResult === OK) {
                                    ReportController.log("Sending " + transfer.amount + " " + transfer.resource + " from " + LogHelper.roomNameAsLink(transfer.roomFrom) + " to " + LogHelper.roomNameAsLink(transfer.roomTo));
                                    transfer.state = "Sending";
                                    transfer.amountLeft = transfer.amount;
                                }
                            }
                        }
                        return null;
                    } else {
                        return transfer;
                    }
                } else if (transfer.state === "Sending") {
                    ReportController.log("Unloading " + transfer.amount + " " + transfer.resource + " from " + LogHelper.roomNameAsLink(transfer.roomFrom) + " to " + LogHelper.roomNameAsLink(transfer.roomTo));
                    transfer.state = "Unloading";
                    return null;
                }
            } else if (transfer.roomTo === roomName) {
                if (transfer.state === "Unloading") {
                    if (transfer.amountLeft === 0) {
                        //TODO: Splice it out
                        return null;
                    } else {
                        return transfer;
                    }
                }
            }
        }

        return null;
    }
}