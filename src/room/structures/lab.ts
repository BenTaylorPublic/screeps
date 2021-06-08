import {ReportController} from "../../reporting/report-controller";
import {LogHelper} from "../../global/helpers/log-helper";
import {Constants} from "../../global/constants/constants";
import {ReportCooldownConstants} from "../../global/report-cooldown-constants";

export class RoomLabController {

    public static run(myRoom: MyRoom): LabOrder | null {
        const labOrder: LabOrder | null = this.getLabOrder(myRoom);
        if (labOrder != null) {
            const labMemory: LabMemory = myRoom.labs as LabMemory;
            if (labOrder.state === "Loading" || labOrder.state === "Running") {
                //Need to get the labs to try and run reactions
                if (this.runReactions(labMemory, labOrder, myRoom.name)) {
                    this.removeLabOrder(labMemory, labOrder);
                    return null;
                }
            }

            if (this.updateLabOrder(myRoom, labOrder)) {
                this.removeLabOrder(labMemory, labOrder);
            }
        }
        return labOrder;
    }

    public static getNonBufferLabsThatAreNotEmpty(myRoom: MyRoom): StructureLab | null {
        if (myRoom.labs == null) {
            return null;
        }

        const room: Room = Game.rooms[myRoom.name] as Room;

        const labs: StructureLab[] = room.find<StructureLab>(FIND_STRUCTURES, {
                filter: (structure: Structure) => {
                    return structure.structureType === STRUCTURE_LAB;
                }
            }
        );

        for (let i: number = 0; i < labs.length; i++) {
            const lab: StructureLab = labs[i];
            if (lab.id === myRoom.labs.buffingLab) {
                continue;
            }

            if (lab.store.getUsedCapacity() !== 0) {
                return lab;
            }
        }

        return null;
    }

    private static runReactions(labMemory: LabMemory, labOrder: LabOrder, roomName: string): boolean {
        if (Game.cpu.bucket < Constants.DONT_RUN_REACTIONS_WHEN_BUCKET_UNDER) {
            if (Game.time % 10 === 0) {
                ReportController.log(`Not running reactions because bucket is ${Game.cpu.bucket}/${Constants.DONT_RUN_REACTIONS_WHEN_BUCKET_UNDER}`);
            }
            return false;
        }
        if (labOrder.cooldownTill > Game.time) {
            return false;
        }
        const reagentLab1: StructureLab | null = Game.getObjectById<StructureLab>(labMemory.reagentLab1.id);
        const reagentLab2: StructureLab | null = Game.getObjectById<StructureLab>(labMemory.reagentLab2.id);
        if (reagentLab1 == null || reagentLab2 == null) {
            ReportController.email("ERROR: A reagent lab was null in runReactions in " + LogHelper.roomNameAsLink(roomName));
            return false;
        }
        for (const compoundLabMemory of labMemory.compoundLabs) {
            const lab: StructureLab | null = Game.getObjectById<StructureLab>(compoundLabMemory.id);
            if (lab == null) {
                ReportController.email("ERROR: A compound lab was null in runReactions in " + LogHelper.roomNameAsLink(roomName));
                continue;
            }
            const result: ScreepsReturnCode = lab.runReaction(reagentLab1, reagentLab2);
            if (result === OK) {
                labOrder.cooldownTill = Game.time + labOrder.cooldown;
            } else {
                if (labOrder.amountLeftToLoad === 0 &&
                    result === ERR_NOT_ENOUGH_RESOURCES) {
                    //This is bad
                    ReportController.email("ERROR: Running reaction got 'ERR_NOT_ENOUGH_RESOURCES', but amountLeftToLoad === 0 in " + LogHelper.roomNameAsLink(roomName) + ", removing lab order");
                    //Returning true kills the lab order
                    return true;
                } else if (result === ERR_TIRED) {
                    //Temporarily commented out because I just queued 100 with bad cooldowns
                    // ReportController.email(`BAD: runReaction result was ERR_TIRED, in ${LogHelper.roomNameAsLink(roomName)} which probably means a bad cooldown was set`, ReportCooldownConstants.FIVE_MINUTE);
                } else {
                    ReportController.email("BAD: Bad result for runReaction, in " + LogHelper.roomNameAsLink(roomName) + " result:" + LogHelper.logScreepsReturnCode(result), ReportCooldownConstants.FIVE_MINUTE);
                }
            }
        }
        return false;
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
                ReportController.log("LabOrder in " + LogHelper.roomNameAsLink(myRoom.name) + ": InitialLoading -> Loading");
            }
        } else if (labOrder.state === "Loading") {
            if (labOrder.amountLeftToLoad === 0) {
                labOrder.state = "Running";
                ReportController.log("LabOrder in " + LogHelper.roomNameAsLink(myRoom.name) + ": Loading -> Running");
            }
        } else if (labOrder.state === "Running") {
            if (reagentLab1.store[labOrder.reagent1] === 0 &&
                reagentLab2.store[labOrder.reagent2] === 0) {
                labOrder.state = "Unloading";
                ReportController.log("LabOrder in " + LogHelper.roomNameAsLink(myRoom.name) + ": Running -> Unloading");
            }
        } else if (labOrder.state === "Unloading") {
            for (let i: number = 0; i < labMemory.compoundLabs.length; i++) {
                const compoundLabMemory: CompoundLabMemory = labMemory.compoundLabs[i];
                const lab: StructureLab | null = Game.getObjectById<StructureLab>(compoundLabMemory.id);
                if (lab == null) {
                    ReportController.email("ERROR: A compound lab was null in updateLabOrder in " + LogHelper.roomNameAsLink(myRoom.name));
                    return false;
                }
                if (lab.store.getUsedCapacity() !== 0) {
                    return false;
                }
            }
            //If it gets here, all compound labs are empty
            ReportController.log("LabOrder in " + LogHelper.roomNameAsLink(myRoom.name) + ": Unloading -> Completed");
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

        //Don't dequeue any lab orders if the labs aren't all empty
        if (this.getNonBufferLabsThatAreNotEmpty(myRoom) != null) {
            return null;
        }

        //If nothing has been taken from the queue, just grab the first one that we still have resources for
        const bank: StructureStorage = (myRoom.bank as Bank).object as StructureStorage;
        for (let i: number = 0; i < myRoom.labs.labOrders.length; i++) {
            const labOrder: LabOrder = myRoom.labs.labOrders[i];
            if (bank.store[labOrder.reagent1] >= labOrder.amount &&
                bank.store[labOrder.reagent2] >= labOrder.amount) {

                //Here we're going to grab a compound lab and copy its cooldown to the laborder
                //Just in case we ran a lab order previous to this, that had a huge cooldown
                const lab: StructureLab = Game.getObjectById<StructureLab>(myRoom.labs.compoundLabs[0].id) as StructureLab;
                //If it doesn't have a cooldown, its fine, laborders cooldown is default to tick 0
                if (lab.cooldown != null &&
                    lab.cooldown > 0) {
                    labOrder.cooldownTill = Game.time + lab.cooldown;
                }

                ReportController.log("LabOrder in " + LogHelper.roomNameAsLink(myRoom.name) + ": Queued -> InitialLoading");
                labOrder.state = "InitialLoading";
                return labOrder;
            } else {
                //Why was it queued then? ...
                ReportController.email("BAD: Not enough resources for lab order " + labOrder.compound + " in room " + LogHelper.roomNameAsLink(myRoom.name) + ", removing lab order");
                this.removeLabOrder(myRoom.labs, labOrder);
            }
        }
        return null;
    }

    private static removeLabOrder(labMemory: LabMemory, labOrder: LabOrder): void {
        //Splice from lab order array
        for (let i: number = labMemory.labOrders.length - 1; i >= 0; i--) {
            if (labMemory.labOrders[i].state === labOrder.state &&
                labMemory.labOrders[i].compound === labOrder.compound) {
                labMemory.labOrders.splice(i, 1);
            }
        }
    }
}