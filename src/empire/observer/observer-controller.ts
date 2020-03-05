import {HelperFunctions} from "../../global/helper-functions";
import {PowerScavController} from "../power-scav-controller";
import {ReportController} from "../../reporting/report-controller";
import {ReportCooldownConstants} from "../../global/report-cooldown-constants";

export class ObserverController {
    public static run(myMemory: MyMemory): void {
        const observerMemory: ObserverMemory = myMemory.empire.observer;

        this.generateTargetsIfNeeded(observerMemory);

        if (observerMemory.observerIds.length === 0 ||
            observerMemory.targetList.length === 0) {
            return;
        }

        this.observeLogic(myMemory);
    }

    private static observe(room: Room, myMemory: MyMemory): void {
        const empireMemory: Empire = myMemory.empire;

        let avoid: boolean = false;

        if ((room.controller != null &&
            room.controller.my === false &&
            room.controller.owner != null &&
            !HelperFunctions.isAllyUsername(room.controller.owner.username))) {
            if (room.controller.level >= 3) {
                avoid = true;
            } else {
                //Low level (no towers)
                ReportController.email("Scrubs in your local area want to get wrecked " + HelperFunctions.roomNameAsLink(room.name),
                    ReportCooldownConstants.DAY);
            }
        } else if (HelperFunctions.isMiddle3x3(room.name)) {
            avoid = true;
        }


        if (avoid) {
            if (!empireMemory.avoidRooms.includes(room.name)) {
                ReportController.email("Added " + HelperFunctions.roomNameAsLink(room.name) + " to avoid list",
                    ReportCooldownConstants.DAY);
                empireMemory.avoidRooms.push(room.name);
            }
        } else {
            if (empireMemory.avoidRooms.includes(room.name)) {
                ReportController.email("Removing " + HelperFunctions.roomNameAsLink(room.name) + " from avoid list",
                    ReportCooldownConstants.DAY);
                empireMemory.avoidRooms.splice(empireMemory.avoidRooms.indexOf(room.name), 1);
            }
            //Check if is highway
            if (HelperFunctions.isHighway(room.name)) {
                const powerBanks: StructurePowerBank[] = room.find<StructurePowerBank>(FIND_STRUCTURES, {
                        filter: (structure: Structure) => {
                            return structure.structureType === STRUCTURE_POWER_BANK;
                        }
                    }
                );
                if (powerBanks.length === 1) {
                    //Found one
                    PowerScavController.observedPowerBank(powerBanks[0]);
                }
            }
        }
    }

    private static observeLogic(myMemory: MyMemory): void {
        const observerMemory: ObserverMemory = myMemory.empire.observer;
        if (observerMemory.currentTargetIndex == null) {
            return;
        }

        if (observerMemory.state === "Moving") {
            observerMemory.currentTargetIndex++;
            if (observerMemory.currentTargetIndex === observerMemory.targetList.length) {
                observerMemory.currentTargetIndex = 0;
            }

            const newTargetRoomName: string = observerMemory.targetList[observerMemory.currentTargetIndex];
            for (let i: number = 0; i < observerMemory.observerIds.length; i++) {
                const observer: StructureObserver | null = Game.getObjectById<StructureObserver>(observerMemory.observerIds[i]);
                if (observer == null) {
                    observerMemory.observerIds.splice(i, 1);
                } else {
                    if (observer.observeRoom(newTargetRoomName) === OK) {
                        break;
                    }
                }
            }

            observerMemory.state = "Observing";
        } else { //Observing
            const room: Room | null = Game.rooms[observerMemory.targetList[observerMemory.currentTargetIndex]];
            if (room == null) {
                ReportController.log("ERROR: Room from observer was null");
            } else {
                this.observe(room, myMemory);
            }
            observerMemory.state = "Moving";
        }
    }


    private static generateTargetsIfNeeded(observerMemory: ObserverMemory): void {
        if (Game.time % 10 !== 0) {
            return;
        }

        const flagNames: string[] = Object.keys(Game.flags);
        for (let i = flagNames.length - 1; i >= 0; i--) {
            const flagName: string = flagNames[i];
            const flagNameSplit: string[] = flagName.split("-");
            if (flagNameSplit[0] !== "observer" ||
                flagNameSplit[1] !== "set") {
                flagNames.splice(i, 1);
            }
        }

        if (flagNames.length !== 1) {
            return;
        }
        const flag: Flag = Game.flags[flagNames[0]];
        const size: number = Number(flag.name.split("-")[2]);

        const topLeftRoomName: MyRoomName = HelperFunctions.getRoomNameAsInterface(flag.pos.roomName);
        observerMemory.targetList = [];
        for (let x: number = topLeftRoomName.xNum; x < topLeftRoomName.xNum + size; x++) {
            for (let y: number = topLeftRoomName.yNum; y < topLeftRoomName.yNum + size; y++) {
                observerMemory.targetList.push(topLeftRoomName.xChar + x + topLeftRoomName.yChar + y);
            }
        }

        flag.remove();
        observerMemory.currentTargetIndex = 0;
    }
}