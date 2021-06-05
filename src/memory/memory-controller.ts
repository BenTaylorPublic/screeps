import {ReportController} from "../reporting/report-controller";
import {LogHelper} from "../global/helpers/log-helper";
import {RoomHelper} from "../global/helpers/room-helper";

export class MemoryController {
    public static run(): void {
        this.clearDeadCreeps();
        this.ensureAllRoomsInMyMemory();
        this.validateRoomsInMyMemory();
        this.cleanUpEmpireCreeps();
        this.getBanks();
        this.cleanupReportMap();
    }

    private static clearDeadCreeps(): void {
        //Clear all dead creeps
        for (const i in Memory.creeps) {
            if (!Game.creeps[i]) {
                delete Memory.creeps[i];
            }
        }
    }

    private static ensureAllRoomsInMyMemory(): void {

        //Ensuring all the rooms are in Memory.myMemory.myRooms
        for (const roomName in Game.rooms) {
            const room: Room = Game.rooms[roomName];
            let myRoom: MyRoom | null = null;

            if (room.controller == null ||
                room.controller.my !== true) {
                //No need to process rooms that don't have controllers or are not mine
                //We only have access to these rooms through travelers (probs)
                continue;
            }

            for (let i = 0; i < Memory.myMemory.myRooms.length; i++) {
                const myExistingRoom = Memory.myMemory.myRooms[i];
                if (myExistingRoom != null &&
                    myExistingRoom.name === roomName) {
                    myRoom = myExistingRoom;
                }
            }

            if (myRoom == null) {
                //Add it
                ReportController.log("Adding a new room to memory " + LogHelper.roomNameAsLink(roomName));

                const minerals: Mineral[] = room.find(FIND_MINERALS);
                if (minerals.length !== 1) {
                    ReportController.email("ERROR: Room didn't have a mineral");
                    return;
                }
                const newMyRoom: MyRoom = {
                    name: roomName,
                    myCreeps: [],
                    mySources: [],
                    roomStage: -1,
                    bank: null,
                    spawnQueue: [],
                    rampartsUp: true,
                    controllerLink: null,
                    labs: null,
                    nukerStatus: null,
                    powerSpawn: null,
                    transferId: null,
                    digging: {
                        active: false,
                        mineral: minerals[0].mineralType,
                        mineralId: minerals[0].id,
                        cache: null,
                        diggerName: null,
                        haulerName: null
                    }
                };
                const sources: Source[] = room.find(FIND_SOURCES);
                for (let i = 0; i < sources.length; i++) {
                    const source: Source = sources[i];
                    newMyRoom.mySources.push({
                        id: source.id,
                        state: "NoCache",
                        minerName: null,
                        haulerName: null,
                        cache: null,
                        link: null
                    });
                }

                Memory.myMemory.myRooms.push(newMyRoom);
            }
        }
    }

    private static validateRoomsInMyMemory(): void {
        //Validation of the myRooms
        for (let i = Memory.myMemory.myRooms.length - 1; i >= 0; i--) {
            const myRoom: MyRoom = Memory.myMemory.myRooms[i];
            const room: Room = Game.rooms[myRoom.name];
            if (room == null ||
                room.controller == null ||
                room.controller.my === false) {
                ReportController.log("Removing room from memory " + LogHelper.roomNameAsLink(myRoom.name));
                Memory.myMemory.myRooms.splice(i, 1);
                continue;
            }
            for (let j = myRoom.myCreeps.length - 1; j >= 0; j--) {
                const myCreep: MyCreep = myRoom.myCreeps[j];
                if (Game.creeps[myCreep.name] == null &&
                    myCreep.spawningStatus !== "queued") {
                    this.handleCreepDying(myRoom, myCreep);
                    myRoom.myCreeps.splice(j, 1);
                }
            }
        }
    }

    public static handleCreepDying(myRoom: MyRoom, myCreep: MyCreep): void {
        //Creep is dead
        if (myCreep.role === "Miner") {
            //Need to check what source it was on
            for (let i = 0; i < myRoom.mySources.length; i++) {
                const mySource: MySource = myRoom.mySources[i];
                if (mySource.minerName === myCreep.name) {
                    mySource.minerName = null;
                }
            }
        } else if (myCreep.role === "Hauler") {
            for (let i = 0; i < myRoom.mySources.length; i++) {
                const mySource: MySource = myRoom.mySources[i];
                if (mySource.haulerName === myCreep.name) {
                    mySource.haulerName = null;
                    return;
                }
            }
            if (myRoom.digging.haulerName === myCreep.name) {
                myRoom.digging.haulerName = null;
            }
        } else if (myCreep.role === "Laborer") {
        } else if (myCreep.role === "Claimer") {
        } else if (myCreep.role === "BankLinker") {
            (myRoom.bank as Bank).bankLinkerName = null;
        } else if (myCreep.role === "Stocker") {
        } else if (myCreep.role === "Digger") {
            myRoom.digging.diggerName = null;
        } else if (myCreep.role === "Upgrader") {
        } else {
            ReportController.email("ERROR: A Creep with a weird role has died: " + myCreep.role + " in " + LogHelper.roomNameAsLink(myRoom.name));
        }
    }

    private static cleanUpEmpireCreeps(): void {
        for (let i = Memory.myMemory.empire.creeps.length - 1; i >= 0; i--) {
            const myCreep: MyCreep = Memory.myMemory.empire.creeps[i];
            if (Game.creeps[myCreep.name] == null &&
                myCreep.spawningStatus !== "queued") {
                Memory.myMemory.empire.creeps.splice(i, 1);
            }
        }
    }

    private static getBanks(): void {
        for (let i = 0; i < Memory.myMemory.myRooms.length; i++) {
            const myRoom: MyRoom = Memory.myMemory.myRooms[i];
            if (myRoom.bank != null) {
                const bankPos: RoomPosition = RoomHelper.myPosToRoomPos(myRoom.bank.bankPos);
                const structures: Structure<StructureConstant>[] = bankPos.lookFor(LOOK_STRUCTURES);
                for (let j = 0; j < structures.length; j++) {
                    if (structures[j].structureType === STRUCTURE_STORAGE) {
                        myRoom.bank.object = structures[j] as StructureStorage;
                        break;
                    }
                }
            }
        }
    }

    private static cleanupReportMap(): void {
        if (Game.time % 100 !== 0) {
            return;
        }

        const myMemory: MyMemory = Memory.myMemory;
        const reports: string[] = Object.keys(myMemory.reports);
        const now: number = new Date().getTime();
        for (let i: number = 0; i < reports.length; i++) {
            if (Memory.myMemory.reports[reports[i]] < now) {
                delete Memory.myMemory.reports[reports[i]];
            }
        }
    }

}

