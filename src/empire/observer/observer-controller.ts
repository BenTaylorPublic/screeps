import {PowerBankController} from "../power-bank-controller";
import {ReportController} from "../../reporting/report-controller";
import {MapHelper} from "../../global/helpers/map-helper";
import {LogHelper} from "../../global/helpers/log-helper";
import {RoomHelper} from "../../global/helpers/room-helper";
import {EmpireHelper} from "../../global/helpers/empire-helper";
import {FlagHelper} from "../../global/helpers/flag-helper";

export class ObserverController {
    public static run(myMemory: MyMemory): void {
        if (this.generateTargetsIfNeeded(myMemory)) {
            return;
        }

        if (myMemory.empire.observer == null) {
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
            !EmpireHelper.isAllyUsername(room.controller.owner.username)
        )) {
            if (RoomHelper.amountOfStructure(room, STRUCTURE_TOWER) > 0) {
                avoid = true;
            } else {
                //No towers
                const status: RoomStatus = Game.map.getRoomStatus(room.name);
                if (status.status !== "novice") {
                    //Some scrubs can't be attacked because of positioning
                    //Check to make sure I haven't manually ignored them
                    const ignoreScrubFlag: Flag | null = FlagHelper.getFlag1(["ignore", "scrub"], room.name);
                    if (ignoreScrubFlag == null) {
                        // ReportController.email("Scrubs to wreck in " + LogHelper.roomNameAsLink(room.name) +
                        //     " Owner: " + room.controller.owner.username +
                        //     " Safemode: " + (room.controller.safeMode != null) +
                        //     " Status: " + status.status,
                        //     ReportCooldownConstants.WEEK);
                    }
                }
            }
        } else if (MapHelper.isMiddle3x3(room.name)) {
            avoid = true;
        }


        if (avoid) {
            if (!empireMemory.avoidRooms.includes(room.name)) {
                ReportController.log("Added " + LogHelper.roomNameAsLink(room.name) + " to avoid list");
                empireMemory.avoidRooms.push(room.name);
            }
        } else {
            if (empireMemory.avoidRooms.includes(room.name)) {
                ReportController.log("Removing " + LogHelper.roomNameAsLink(room.name) + " from avoid list");
                empireMemory.avoidRooms.splice(empireMemory.avoidRooms.indexOf(room.name), 1);
            }
            //Check if is highway
            if (MapHelper.isHighway(room.name)) {
                const powerBanks: StructurePowerBank[] = room.find<StructurePowerBank>(FIND_STRUCTURES, {
                        filter: (structure: Structure) => {
                            return structure.structureType === STRUCTURE_POWER_BANK;
                        }
                    }
                );
                if (powerBanks.length === 1) {
                    //Found one
                    PowerBankController.observedPowerBank(powerBanks[0]);
                }
            }
        }
    }

    private static observeLogic(myMemory: MyMemory): void {
        const observerMemory: ObserverMemory = myMemory.empire.observer as ObserverMemory;
        if (observerMemory == null) {
            return;
        }

        const room: Room | null = Game.rooms[observerMemory.currentObservingRoomName];
        if (room == null) {
            ReportController.log("ERROR: Room from observer was null " + LogHelper.roomNameAsLink(observerMemory.currentObservingRoomName));
        } else {
            this.observe(room, myMemory);
        }

        //Getting next room
        observerMemory.nextObservingRoom.xNum++;
        if (observerMemory.nextObservingRoom.xNum > observerMemory.topLeftX + observerMemory.size) {
            observerMemory.nextObservingRoom.xNum = observerMemory.topLeftX;
            observerMemory.nextObservingRoom.yNum++;
            if (observerMemory.nextObservingRoom.yNum > observerMemory.topLeftY + observerMemory.size) {
                observerMemory.nextObservingRoom.yNum = observerMemory.topLeftY;
            }
        }

        observerMemory.currentObservingRoomName = RoomHelper.getRoomNameAsString(observerMemory.nextObservingRoom);
        const observer: StructureObserver | null = Game.getObjectById<StructureObserver>(observerMemory.observerId);
        if (observer != null) {
            observer.observeRoom(observerMemory.currentObservingRoomName);
        } else {
            ReportController.email("ERROR: Observer was null. Stopping observers");
            myMemory.empire.observer = null;
        }
    }


    private static generateTargetsIfNeeded(myMemory: MyMemory): boolean {
        if (Game.time % 10 !== 0) {
            return false;
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
            return false;
        }
        const flag: Flag = Game.flags[flagNames[0]];

        const size: number = Number(flag.name.split("-")[2]);
        const topLeftRoomName: MyRoomName = RoomHelper.getRoomNameAsInterface(flag.pos.roomName);
        let observer: StructureObserver | null = null;
        for (let i: number = 0; i < myMemory.myRooms.length; i++) {
            const observers: StructureObserver[] = Game.rooms[myMemory.myRooms[i].name].find<StructureObserver>(FIND_MY_STRUCTURES, {
                filter: (structure: AnyStructure): boolean => {
                    return structure.structureType === STRUCTURE_OBSERVER;
                }
            });
            if (observers.length >= 1) {
                observer = observers[0];
            }
        }
        if (observer == null) {
            flag.remove();
            return false;
        }
        const topLeftRoomNameAsString: string = RoomHelper.getRoomNameAsString(topLeftRoomName);
        if (myMemory.empire.observer == null) {
            myMemory.empire.observer = {
                nextObservingRoom: topLeftRoomName,
                currentObservingRoomName: topLeftRoomNameAsString,
                observerId: observer.id,
                size: size,
                topLeftX: topLeftRoomName.xNum,
                topLeftY: topLeftRoomName.yNum
            };
        }

        observer.observeRoom(topLeftRoomNameAsString);

        ReportController.log("Observer set with size " + size + ", rooms: " + (size * size));
        flag.remove();
        return true;
    }
}
