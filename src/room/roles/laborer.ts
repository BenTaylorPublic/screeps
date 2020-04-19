import {ReportController} from "../../reporting/report-controller";
import {Constants} from "../../global/constants/constants";
import {CreepHelper} from "../../global/helpers/creep-helper";
import {RoomHelper} from "../../global/helpers/room-helper";
import {LogHelper} from "../../global/helpers/log-helper";
import {MovementHelper} from "../../global/helpers/movement-helper";

export class RoleLaborer {
    public static run(laborer: Laborer, myRoom: MyRoom, laborersStock: boolean): void {
        if (CreepHelper.handleCreepPreRole(laborer)) {
            return;
        }

        const creep: Creep = Game.creeps[laborer.name];

        this.calculateCreepState(laborer, myRoom, creep);
        if (laborer.state === "Labor") {
            this.labor(laborer, myRoom, creep, laborersStock);
        } else if (laborer.state === "PickupBank") {
            this.pickupBank(laborer, myRoom, creep);
        } else if (laborer.state === "PickupControllerLink") {
            this.pickupControllerLink(laborer, myRoom, creep);
        } else if (laborer.state === "PickupCache") {
            this.pickupCache(laborer, myRoom, creep);
        } else { //Mining
            this.mining(laborer, myRoom, creep);
        }
    }

    private static calculateCreepState(laborer: Laborer, myRoom: MyRoom, creep: Creep): void {
        if (laborer.state === "Labor" && creep.store.energy === 0) {

            let distanceToControllerLink: number = 999;
            if (myRoom.controllerLink != null &&
                myRoom.controllerLink.id != null) {
                const controllerLink: StructureLink | null = Game.getObjectById(myRoom.controllerLink.id);
                if (controllerLink != null &&
                    controllerLink.store.energy >= creep.store.getCapacity()) {
                    distanceToControllerLink = creep.pos.getRangeTo(controllerLink);
                }
            }

            const bank: StructureStorage | null = myRoom.bank == null ? null : myRoom.bank.object;
            if (bank != null &&
                bank.store[RESOURCE_ENERGY] >= creep.store.getCapacity() &&
                creep.pos.getRangeTo(bank) < distanceToControllerLink) {
                laborer.state = "PickupBank";
                creep.say("PickupBank");
                return;
            } else if (distanceToControllerLink !== 999) {
                laborer.state = "PickupControllerLink";
                creep.say("PickupCnLink");
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
                            ReportController.email("ERROR: Source cache returned null with get by ID in " + LogHelper.roomNameAsLink(myRoom.name));
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

    private static pickupControllerLink(laborer: Laborer, myRoom: MyRoom, creep: Creep): void {
        if (myRoom.controllerLink == null ||
            myRoom.controllerLink.id == null) {
            return;
        }

        const controllerLinkPos: RoomPosition = RoomHelper.myPosToRoomPos(myRoom.controllerLink.pos);

        if (controllerLinkPos.isNearTo(creep)) {
            const controllerLink: StructureLink | null = Game.getObjectById(myRoom.controllerLink.id);
            if (controllerLink == null) {
                ReportController.email("ERROR: Room's controller link was null in " + LogHelper.roomNameAsLink(myRoom.name));
                return;
            }
            creep.withdraw(controllerLink, RESOURCE_ENERGY);
        } else {
            MovementHelper.myMoveTo(creep, controllerLinkPos, laborer);
        }
    }

    private static pickupBank(laborer: Laborer, myRoom: MyRoom, creep: Creep): void {
        if (myRoom.bank == null) {
            ReportController.email("ERROR: Room's bank memory was null in " + LogHelper.roomNameAsLink(myRoom.name) + " for laborer");
            return;
        }

        const bankPos: RoomPosition = RoomHelper.myPosToRoomPos(myRoom.bank.bankPos);

        if (bankPos.isNearTo(creep)) {
            const bank: StructureStorage | null = myRoom.bank.object;
            if (bank == null) {
                ReportController.email("ERROR: Room's bank was null in " + LogHelper.roomNameAsLink(myRoom.name));
                return;
            }
            creep.withdraw(bank, RESOURCE_ENERGY);
        } else {
            MovementHelper.myMoveTo(creep, bankPos, laborer);
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
                MovementHelper.myMoveTo(creep, validCacheToGrabFrom.pos, laborer);
            }
        }
    }

    private static mining(laborer: Laborer, myRoom: MyRoom, creep: Creep): void {
        const source: Source | null = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);

        if (source != null && creep.harvest(source) === ERR_NOT_IN_RANGE) {
            MovementHelper.myMoveTo(creep, source.pos, laborer);
        }
    }

    private static labor(laborer: Laborer, myRoom: MyRoom, creep: Creep, laborersStock: boolean): void {
        let givenCommand: boolean = false;

        //Check if controller is anywhere close to downgrading
        let forceUpgradeController: boolean = false;

        if (creep.room.controller != null && creep.room.controller.ticksToDowngrade < Constants.LABORERS_UPGRADE_WHEN_CONTROLLER_BENEATH) {
            forceUpgradeController = true;
            givenCommand = true;
        }
        if (laborersStock && !givenCommand) {
            let structureToAddTo: Structure | null = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (structure: any) => {
                    return (structure.structureType === STRUCTURE_EXTENSION ||
                        structure.structureType === STRUCTURE_SPAWN) &&
                        structure.energy < structure.energyCapacity;
                }
            });
            if (structureToAddTo == null) {
                structureToAddTo = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (structure: any) => {
                        return (structure.structureType === STRUCTURE_TOWER)
                            && structure.energy < Constants.STOCK_TOWER_TO;
                    }
                });
            }
            if (structureToAddTo != null) {
                givenCommand = true;
                if (creep.transfer(structureToAddTo, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    MovementHelper.myMoveTo(creep, structureToAddTo.pos, laborer);
                }
            }
        }

        //Building construction sites
        if (!givenCommand) {
            const closestConstructionSite: ConstructionSite | null = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
            if (closestConstructionSite != null) {
                givenCommand = true;
                if (creep.build(closestConstructionSite) === ERR_NOT_IN_RANGE) {
                    MovementHelper.myMoveTo(creep, closestConstructionSite.pos, laborer);
                }
            }
        }

        //Upgrading room controller
        if (forceUpgradeController || !givenCommand) {
            if (creep.upgradeController(creep.room.controller as StructureController) === ERR_NOT_IN_RANGE) {
                MovementHelper.myMoveTo(creep, (creep.room.controller as StructureController).pos, laborer);
            }
        }
    }
}
