import {HelperFunctions} from "../../global/helper-functions";
import {ReportController} from "../../reporting/report-controller";

export class RoleLaborer {
    public static run(laborer: Laborer, myRoom: MyRoom): void {
        if (HelperFunctions.handleCreepPreRole(laborer)) {
            return;
        }

        const creep: Creep = Game.creeps[laborer.name];

        this.calculateCreepState(laborer, myRoom, creep);
        if (laborer.state === "Labor") {
            this.labor(laborer, myRoom, creep);
        } else if (laborer.state === "PickupBank") {
            this.pickupBank(laborer, myRoom, creep);
        } else if (laborer.state === "PickupCache") {
            this.pickupCache(laborer, myRoom, creep);
        } else { //Mining
            this.mining(laborer, myRoom, creep);
        }
    }

    private static calculateCreepState(laborer: Laborer, myRoom: MyRoom, creep: Creep): void {
        if (laborer.state === "Labor" && creep.store.energy === 0) {

            const bank: StructureStorage | null = myRoom.bank;
            if (bank != null && bank.store[RESOURCE_ENERGY] >= creep.store.getCapacity()) {
                //Bank is an option
                laborer.state = "PickupBank";
                creep.say("PickupBank");
                return;
            }

            if (myRoom.roomStage >= 1) {
                for (let i = 0; i < myRoom.mySources.length; i++) {
                    const mySource = myRoom.mySources[i];
                    if (mySource.cache != null && mySource.cache.id != null) {
                        const cache: StructureContainer | null = Game.getObjectById<StructureContainer>(mySource.cache.id);
                        if (cache == null) {
                            //Clear it
                            mySource.cache.id = null;
                            ReportController.log("ERROR", "Source cache returned null with get by ID in " + HelperFunctions.roomNameAsLink(myRoom.name));
                        } else if (cache.store[RESOURCE_ENERGY] >= creep.store.getCapacity()) {
                            laborer.state = "PickupCache";
                            creep.say("PickupCache");
                            return;
                        }
                    }
                }
                //Couldn't find a cache to pickup from, Mine instead
                laborer.state = "Mining";
                creep.say("Mining");
                return;
            } else {
                laborer.state = "Mining";
                creep.say("Mining");
                return;
            }
        } else if (laborer.state !== "Labor" && creep.store.energy === creep.store.getCapacity()) {
            laborer.state = "Labor";
            creep.say("work work");
        }
    }


    private static pickupBank(laborer: Laborer, myRoom: MyRoom, creep: Creep): void {
        if (myRoom.bankPos == null) {
            ReportController.log("ERROR", "Room's bank pos was null in " + HelperFunctions.roomNameAsLink(myRoom.name));
            return;
        }

        const bankPos: RoomPosition = HelperFunctions.myPosToRoomPos(myRoom.bankPos);

        if (bankPos.isNearTo(creep)) {
            const bank: StructureStorage | null = myRoom.bank;
            if (bank == null) {
                ReportController.log("ERROR", "Room's bank was null in " + HelperFunctions.roomNameAsLink(myRoom.name));
                return;
            }
            creep.withdraw(bank, RESOURCE_ENERGY);
        } else {
            HelperFunctions.myMoveTo(creep, bankPos, laborer);
        }
    }

    private static pickupCache(laborer: Laborer, myRoom: MyRoom, creep: Creep): void {
        const validCacheToGrabFrom: StructureContainer | null = creep.pos.findClosestByPath<StructureContainer>(FIND_STRUCTURES, {
            filter: (structure: any) => {
                return structure.structureType === STRUCTURE_CONTAINER && structure.store[RESOURCE_ENERGY] >= creep.store.getCapacity();
            }
        });

        if (validCacheToGrabFrom == null) {
            laborer.state = "Mining";
            creep.say("Mining");
        } else {
            if (validCacheToGrabFrom.pos.isNearTo(creep)) {
                creep.withdraw(validCacheToGrabFrom, RESOURCE_ENERGY);
            } else {
                HelperFunctions.myMoveTo(creep, validCacheToGrabFrom.pos, laborer);
            }
        }
    }

    private static mining(laborer: Laborer, myRoom: MyRoom, creep: Creep): void {
        const source: Source | null = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);

        if (source != null && creep.harvest(source) === ERR_NOT_IN_RANGE) {
            HelperFunctions.myMoveTo(creep, source.pos, laborer);
        }
    }

    private static labor(laborer: Laborer, myRoom: MyRoom, creep: Creep): void {
        let givenCommand: boolean = false;

        //Check if controller is anywhere close to downgrading
        let forceUpgradeController: boolean = false;

        if (creep.room.controller != null && creep.room.controller.ticksToDowngrade < 5000) {
            forceUpgradeController = true;
            givenCommand = true;
        }
        if (myRoom.roomStage < 4 && !givenCommand) {
            const structureToAddTo: Structure | null = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (structure: any) => {
                    return (structure.structureType === STRUCTURE_EXTENSION ||
                        structure.structureType === STRUCTURE_SPAWN ||
                        structure.structureType === STRUCTURE_TOWER)
                        && structure.energy < structure.energyCapacity;
                }
            });
            if (structureToAddTo != null) {
                givenCommand = true;
                if (creep.transfer(structureToAddTo, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    HelperFunctions.myMoveTo(creep, structureToAddTo.pos, laborer);
                }
            }
        }

        //Building construction sites
        if (!givenCommand) {
            const closestConstructionSite: ConstructionSite | null = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
            if (closestConstructionSite != null) {
                givenCommand = true;
                if (creep.build(closestConstructionSite) === ERR_NOT_IN_RANGE) {
                    HelperFunctions.myMoveTo(creep, closestConstructionSite.pos, laborer);
                }
            }
        }

        //Upgrading room controller
        if (forceUpgradeController || !givenCommand) {
            if (creep.upgradeController(creep.room.controller as StructureController) === ERR_NOT_IN_RANGE) {
                HelperFunctions.myMoveTo(creep, (creep.room.controller as StructureController).pos, laborer);
            }
        }
    }
}
