import {RoomController} from "./room/room-controller";
import {MemoryController} from "./memory/memory-controller";
import {EmpireController} from "./empire/empire-controller";
import {ReportController} from "./reporting/report-controller";

console.log("Script reloaded");
for (let i: number = 0; i < Memory.myMemory.myRooms.length; i++) {
    const myRoom: MyRoom = Memory.myMemory.myRooms[i];
    if (myRoom.name === "E16S18") {
        myRoom.roomStage = 4.6;
        console.log("SET");
    }
}
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
            reports: [],
            empire: {
                attackOne: null,
                creeps: []
            }
        } as MyMemory;
    }
}
