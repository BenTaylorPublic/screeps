import {ReportController} from "../reporting/report-controller";
import {HelperFunctions} from "../global/helper-functions";

export class ScheduleController {
    public static preLoop(myMemory: MyMemory): void {
        for (let i = myMemory.scheduledCommands.length - 1; i >= 0; i--) {
            const scheduledCommand: ScheduledCommand = myMemory.scheduledCommands[i];
            if (scheduledCommand.action === "SET_FALSE_ON_PENDING_CONSCRIPTED_CREEP") {
                this.setFalseOnPendingConscriptedCreep(myMemory, scheduledCommand.roomName);
            }
            myMemory.scheduledCommands.splice(i, 1);
        }
    }

    public static scheduleForNextTick(action: ScheduleAction, roomName: string): void {
        Memory.myMemory.scheduledCommands.push({
            action: action,
            roomName: roomName
        });
    }

    private static setFalseOnPendingConscriptedCreep(myMemory: MyMemory, roomName: string): void {
        for (let i = 0; i < myMemory.myRooms.length; i++) {
            if (myMemory.myRooms[i].name === roomName) {
                myMemory.myRooms[i].pendingConscriptedCreep = false;
                return;
            }
        }

        ReportController.email("ERROR: Failed to find the room to set pendingConscriptedCreep to false. roomName: " + HelperFunctions.roomNameAsLink(roomName));
    }

}