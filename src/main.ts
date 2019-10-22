import {RoomController} from "./room/room-controller";
import {MemoryController} from "./memory/memory-controller";
import {EmpireController} from "./empire/empire-controller";
import {ReportController} from "./reporting/report-controller";

console.log("Script reloaded");
setupMyMemory();

export const loop: any = function (): void {
    const myMemory: MyMemory = Memory.myMemory;
    MemoryController.run();

    ReportController.checkForReportFlag();

    const empireCommand: EmpireCommand = EmpireController.run(myMemory);

    for (let i = 0; i < myMemory.myRooms.length; i++) {
        RoomController.run(myMemory.myRooms[i], empireCommand);
    }

    MemoryController.clearBanks();
};

function setupMyMemory(): void {
    if (Memory.myMemory == null) {
        Memory.myMemory = {
            globalId: 0,
            myRooms: [],
            report: {
                lastReportTimeStamp: new Date().getTime(),
                reports: []
            },
            empire: {
                attackOne: null,
                creeps: []
            }
        } as MyMemory;
    }
}
