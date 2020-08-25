import {ReportController} from "../../reporting/report-controller";
import {ReportCooldownConstants} from "../../global/report-cooldown-constants";
import {RoomHelper} from "../../global/helpers/room-helper";
import {LogHelper} from "../../global/helpers/log-helper";
import {MemoryController} from "../../memory/memory-controller";

// tslint:disable-next-line: class-name
export class Stage0_5 {
    /*
    0.5 ->  1   : Room has >= 1 spawn
    0.5 <-  1   : Room has < 1 spawns
    */
    public static up(myRoom: MyRoom, room: Room): boolean {
        this.step(myRoom, room);
        if (RoomHelper.amountOfStructure(room, STRUCTURE_SPAWN) >= 1) {
            //Spawn has been made
            myRoom.roomStage = 1;
            ReportController.email("STAGE+ 1 " + LogHelper.roomNameAsLink(myRoom.name) + " 1 spawn");
            return true;
        }
        return false;
    }

    public static down(myRoom: MyRoom, room: Room): boolean {
        if (RoomHelper.amountOfStructure(room, STRUCTURE_SPAWN) === 0) {
            //Okay this is bad
            //But we need to clear the spawn queue
            //And handle them dying
            for (let i: number = myRoom.spawnQueue.length; i > 0; i--) {
                const queuedCreep: QueuedCreep = myRoom.spawnQueue[i];
                for (let j: number = 0; j < myRoom.myCreeps.length; j++) {
                    if (myRoom.myCreeps[j].name === queuedCreep.name) {
                        MemoryController.handleCreepDying(myRoom, myRoom.myCreeps[j]);
                    }
                }
                myRoom.spawnQueue.splice(i, 1);
            }


            myRoom.roomStage = 0.5;
            ReportController.email("STAGE- 0.5 " + LogHelper.roomNameAsLink(myRoom.name) + " 1 spawn");
            return true;
        }
        return false;
    }

    private static step(myRoom: MyRoom, room: Room): void {
        if (Game.rooms[myRoom.name].find(FIND_CONSTRUCTION_SITES).length === 0) {
            ReportController.email("ATTENTION: Room " + LogHelper.roomNameAsLink(room.name) + " needs first spawn, which should be manually placed",
                ReportCooldownConstants.DAY);
        }
    }
}
