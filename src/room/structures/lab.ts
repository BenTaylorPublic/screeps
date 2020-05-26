import {ReportController} from "../../reporting/report-controller";
import {LogHelper} from "../../global/helpers/log-helper";

export class RoomLabController {

    public static run(myRoom: MyRoom): LabOrder | null {
        const labOrder: LabOrder | null = this.getLabOrder(myRoom);
        if (labOrder != null) {
            if (labOrder.state === "Loading" || labOrder.state === "Running") {
                //Need to get the labs to try and run reactions
                this.runReactions(myRoom.labs as LabMemory, labOrder);
            }

            if (this.updateLabOrder(myRoom, labOrder)) {
                //TODO: Splice from lab order array
            }
        }
        return labOrder;
    }

    private static runReactions(labMemory: LabMemory, labOrder: LabOrder): void {
        const reagentLab1: StructureLab | null = Game.getObjectById<StructureLab>(labMemory.reagentLab1.id);
        const reagentLab2: StructureLab | null = Game.getObjectById<StructureLab>(labMemory.reagentLab2.id);
        if (reagentLab1 == null || reagentLab2 == null) {
            ReportController.email("ERROR: A reagent lab was null in runReactions");
            return;
        }
        for (let i: number = 0; i < labMemory.compundLabs.length; i++) {
            const compoundLabMemory: CompoundLabMemory = labMemory.compundLabs[i];
            if (compoundLabMemory.cooldownTill > Game.time) {
                continue;
            }

            const lab: StructureLab | null = Game.getObjectById<StructureLab>(compoundLabMemory.id);
            if (lab == null) {
                ReportController.email("ERROR: A compound lab was null in runReactions");
                continue;
            }
            const result: ScreepsReturnCode = lab.runReaction(reagentLab1, reagentLab2);
            if (result === OK) {
                compoundLabMemory.cooldownTill = Game.time + 5;
            } else {
                console.log("Bad result for runReaction, " + LogHelper.logScreepsReturnCode(result));
            }
        }

    }

    private static updateLabOrder(myRoom: MyRoom, labOrder: LabOrder): boolean {
        const labMemory: LabMemory = myRoom.labs as LabMemory;
        const reagentLab1: StructureLab | null = Game.getObjectById<StructureLab>(labMemory.reagentLab1.id);
        const reagentLab2: StructureLab | null = Game.getObjectById<StructureLab>(labMemory.reagentLab2.id);
        if (reagentLab1 == null || reagentLab2 == null) {
            ReportController.email("ERROR: A reagent lab was null in updateLabOrder in " + LogHelper.roomNameAsLink(myRoom.name));
            return false;
        }
        if (labOrder.state === "InitialLoading") {
            if (reagentLab1.store[labOrder.reagent1] > 0 &&
                reagentLab2.store[labOrder.reagent2] > 0) {
                labOrder.state = "Loading";
                ReportController.email("LabOrder in " + LogHelper.roomNameAsLink(myRoom.name) + ": InitialLoading -> Loading");
            }
        } else if (labOrder.state === "Loading") {
            if (reagentLab1.store[labOrder.reagent1] > 0 &&
                reagentLab2.store[labOrder.reagent2] > 0 &&
                labOrder.amountLeftToLoad === 0) {
                labOrder.state = "Running";
                ReportController.email("LabOrder in " + LogHelper.roomNameAsLink(myRoom.name) + ": Loading -> Running");
            }
        } else if (labOrder.state === "Running") {
            if (reagentLab1.store[labOrder.reagent1] === 0 &&
                reagentLab2.store[labOrder.reagent2] === 0) {
                labOrder.state = "Unloading";
                ReportController.email("LabOrder in " + LogHelper.roomNameAsLink(myRoom.name) + ": Running -> Unloading");
            }
        } else if (labOrder.state === "Unloading") {
            for (let i: number = 0; i < labMemory.compundLabs.length; i++) {
                const compoundLabMemory: CompoundLabMemory = labMemory.compundLabs[i];
                const lab: StructureLab | null = Game.getObjectById<StructureLab>(compoundLabMemory.id);
                if (lab == null) {
                    ReportController.email("ERROR: A compound lab was null in updateLabOrder");
                    return false;
                }
                if (lab.store.getUsedCapacity() !== 0) {
                    return false;
                }
            }
            //If it gets here, all compound labs are empty
            ReportController.email("LabOrder in " + LogHelper.roomNameAsLink(myRoom.name) + ": Unloading -> Completed");
            //Return true to splice this lab order out of the queue
            return true;
        }

        return false;
    }

    private static getLabOrder(myRoom: MyRoom): LabOrder | null {
        if (myRoom.labs == null ||
            myRoom.labs.labOrders.length === 0) {
            return null;
        }
        for (let i: number = 0; i < myRoom.labs.labOrders.length; i++) {
            const labOrder: LabOrder = myRoom.labs.labOrders[i];
            if (labOrder.state !== "Queued") {
                return labOrder;
            }
        }
        //If nothing has been taken from the queue, just grab the first one that we still have resources for
        const bank: StructureStorage = (myRoom.bank as Bank).object as StructureStorage;
        for (let i: number = 0; i < myRoom.labs.labOrders.length; i++) {
            const labOrder: LabOrder = myRoom.labs.labOrders[i];
            if (bank.store[labOrder.reagent1] >= labOrder.amount &&
                bank.store[labOrder.reagent2] >= labOrder.amount) {
                labOrder.state = "InitialLoading";
                return labOrder;
            } else {
                ReportController.email("BAD: Not enough resources for lab order " + labOrder.compound + " in room " + LogHelper.roomNameAsLink(myRoom.name));
            }
        }
        return null;
    }
}