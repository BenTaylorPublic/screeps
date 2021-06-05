import {ReportController} from "../../reporting/report-controller";
import {LogHelper} from "./log-helper";

export class EmpireHelper {
    public static getNewTransferId(): number {
        const result: number = Memory.myMemory.globalId;
        Memory.myMemory.globalId++;
        return result;
    }

    public static isAllyUsername(username: string): boolean {
        return ["no-allies"].indexOf(username.toLowerCase()) !== -1;
    }

    public static getValidResourceTransfer(empire: Empire, myRoom: MyRoom): Transfer | null {
        let result: Transfer | null = null;
        for (let i: number = 0; i < empire.transfers.length; i++) {
            const transfer: Transfer = empire.transfers[i];
            if (transfer.roomFrom === myRoom.name) {
                if (transfer.state === "Loading" || transfer.state === "Sending") {
                    if (result == null) {
                        result = transfer;
                    } else if (transfer.actionStarted) {
                        result = transfer;
                        break;
                    }
                }
            } else if (transfer.roomTo === myRoom.name) {
                if (transfer.state === "Unloading") {
                    if (transfer.amountLeft === 0) {
                        ReportController.log("Unloaded " + transfer.amount + " " + transfer.resource + " from " + LogHelper.roomNameAsLink(transfer.roomFrom) + " to " + LogHelper.roomNameAsLink(transfer.roomTo));
                        empire.transfers.splice(i, 1);
                        i--;
                        if (empire.transfers.length === 0) {
                            ReportController.log("No more transfers");
                        }
                    } else {
                        if (result == null) {
                            result = transfer;
                        } else if (transfer.actionStarted) {
                            result = transfer;
                            break;
                        }
                    }
                }
            }
        }

        if (result == null) {
            return null;
        }
        result.actionStarted = true;
        if (result.roomFrom === myRoom.name) {
            if (result.state === "Loading") {
                if (result.amountLeft === 0) {
                    const terminals: StructureTerminal[] = Game.rooms[myRoom.name].find<StructureTerminal>(FIND_MY_STRUCTURES, {
                        filter(structure: AnyStructure): boolean {
                            return structure.structureType === STRUCTURE_TERMINAL;
                        }
                    });
                    if (terminals.length === 1) {
                        const terminal: StructureTerminal = terminals[0];
                        if (terminal.store.getUsedCapacity(result.resource) >= result.amount) {
                            const transferResult: ScreepsReturnCode = terminal.send(result.resource, result.amount, result.roomTo);
                            if (transferResult === OK) {
                                ReportController.log("Sending " + result.amount + " " + result.resource + " from " + LogHelper.roomNameAsLink(result.roomFrom) + " to " + LogHelper.roomNameAsLink(result.roomTo));
                                result.state = "Sending";
                                result.amountLeft = result.amount;
                            }
                        }
                    }
                    return null;
                }
            } else if (result.state === "Sending") {
                ReportController.log("Unloading " + result.amount + " " + result.resource + " from " + LogHelper.roomNameAsLink(result.roomFrom) + " to " + LogHelper.roomNameAsLink(result.roomTo));
                result.state = "Unloading";
                result.actionStarted = false;
                return null;
            }
        }
        return result;
    }
}