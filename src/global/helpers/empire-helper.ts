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


    public static cleanUpFinishedTransfers(empire: Empire): void {
        //Deleting finished transfers
        for (let i: number = empire.transfers.length - 1; i >= 0; i--) {
            const transfer: Transfer = empire.transfers[i];
            if (transfer.state === "Unloading" &&
                transfer.amountLeft === 0) {
                ReportController.log("Unloaded " + transfer.amount + " " + transfer.resource + " from " + LogHelper.roomNameAsLink(transfer.roomFrom) + " to " + LogHelper.roomNameAsLink(transfer.roomTo));
                empire.transfers.splice(i, 1);
                if (empire.transfers.length === 0) {
                    ReportController.log("No more transfers");
                }
            }
        }
    }

    public static getValidResourceTransfer(empire: Empire, myRoom: MyRoom): Transfer | null {
        let result: Transfer | null = null;
        if (myRoom.transferId == null) {
            //Need a new one
            for (const transfer of empire.transfers) {
                if ((transfer.state === "Loading" && transfer.roomFrom === myRoom.name) ||
                    (transfer.state === "Unloading" && transfer.roomTo === myRoom.name)) {
                    ReportController.log(`Transfer with id ${transfer.id} given to ${LogHelper.roomNameAsLink(transfer.roomTo)}, state: ${transfer.state}`);
                    result = transfer;
                    break;
                }
            }
        } else {
            for (const transfer of empire.transfers) {
                if (transfer.id === myRoom.transferId) {
                    result = transfer;
                    break;
                }
            }
            if (result == null) {
                //The transfer must have been finished and sliced out
                ReportController.log("Transfer not found. Not sure if there's a better way to handle this yet.");
                //It'll try get a new transfer next tick
                myRoom.transferId = null;
            }
        }

        if (result == null) {
            return null;
        }

        //Save for next time
        myRoom.transferId = result.id;

        if (result.roomFrom === myRoom.name) {
            if (result.state === "Loading" &&
                result.amountLeft === 0) {
                //In the case of the loading being done, this just transfers it then returns null
                //As nothing in the room needs to change
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
            } else if (result.state === "Sending") {
                ReportController.log("Unloading " + result.amount + " " + result.resource + " from " + LogHelper.roomNameAsLink(result.roomFrom) + " to " + LogHelper.roomNameAsLink(result.roomTo));
                result.state = "Unloading";
                //This room doesn't have to deal with this transfer anymore
                myRoom.transferId = null;
                return null;
            }
        }
        return result;
    }
}