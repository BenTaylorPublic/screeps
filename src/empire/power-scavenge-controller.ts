import {Constants} from "../global/constants";
import {HelperFunctions} from "../global/helper-functions";

export class PowerScavengeController {
    public static observedPowerBank(powerBank: StructurePowerBank): void {
        const myMemory: MyMemory = Memory.myMemory;
        if (powerBank.ticksToDecay < Constants.POWER_SCAVENGE_TTL_MIN) {
            //TTL not long enough
            return;
        }
        //Probably valid
        let closestDistance: number = 999;
        let closestRooms: MyRoom[] = [];
        for (let i: number = 0; i < myMemory.myRooms.length; i++) {
            const myRoom: MyRoom = myMemory.myRooms[i];
            if (myRoom.roomStage < 8) {
                continue;
            }
            const roomDistance = HelperFunctions.getRoomDistance(powerBank.room.name, myRoom.name);
            if (roomDistance === closestDistance) {
                closestRooms.push(myRoom);
            } else if (roomDistance < closestDistance) {
                closestRooms = [myRoom];
                closestDistance = roomDistance;
            }
        }

        if (closestDistance > Constants.POWER_SCAVENGE_RANGE_MAX) {
            //Too far
            return;
        }

        for (let i: number = 0; i < myMemory.empire.powerScavenge.banksScavengingFrom.length; i++) {
            const bankScavengingFrom = myMemory.empire.powerScavenge.banksScavengingFrom[i];
            if (bankScavengingFrom.id === powerBank.id) {
                //Already setup
                return;
            }
        }

        //Otherwise, WE'RE GOOD, LET'S GO BOIZ
        console.log("LOG: Power scavenging power bank in room " + powerBank.room.name);

        //This should reuse the rooms
        const roomsToSpawnThrough: string[] = [];
        let index: number = 0;
        for (let count: number = 0; count < Constants.POWER_SCAVENGE_DAMAGE_CREEP_COUNT; count++) {
            roomsToSpawnThrough.push(closestRooms[index].name);
            index++;
            if (index >= closestRooms.length) {
                index = 0;
            }
        }

        myMemory.empire.powerScavenge.banksScavengingFrom.push({
            id: powerBank.id,
            pos: HelperFunctions.roomPosToMyPos(powerBank.pos),
            roomsStillToProvide: roomsToSpawnThrough
        });
    }
}