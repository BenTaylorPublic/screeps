import {RoomController} from "./room/room-controller";
import {MemoryController} from "./memory/memory-controller";
import {EmpireController} from "./empire/empire-controller";
import {ReportController} from "./reporting/report-controller";
import {ScheduleController} from "./schedule/schedule-controller";

declare function require(name: string): any;

const profiler: any = require("screeps-profiler");

console.log("Script reloaded");

setupMyMemory();

profiler.enable();
export let loop: any = function (): void {
    profiler.wrap(function (): any {
        const myMemory: MyMemory = Memory.myMemory;
        MemoryController.run();

        ScheduleController.preLoop(myMemory);

        ReportController.checkForReportFlag();
        EmpireController.run(myMemory);

        for (let i = 0; i < myMemory.myRooms.length; i++) {
            RoomController.run(myMemory.myRooms[i]);
        }

        MemoryController.clearBanks();
    });
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
                attackQuick: null,
                attackPressure: null,
                creeps: []
            },
            scheduledCommands: []
        } as MyMemory;
    }
}
