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
        this.reduceCooldowns();
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
                const newMyRoom: MyRoom = {
                    name: roomName,
                    myCreeps: [],
                    spawns: [],
                    powerSpawnId: null,
                    mySources: [],
                    roomStage: -1,
                    bankPos: null,
                    bankLinkerName: null,
                    bankLink: null,
                    bank: null,
                    spawnQueue: [],
                    rampartsUp: true
                };
                const sources: Source[] = room.find(FIND_SOURCES);
                for (let i = 0; i < sources.length; i++) {
                    const source: Source = sources[i];
                    newMyRoom.mySources.push({
                        id: source.id,
                        state: "NoCache",
                        minerName: null,
                        haulerNames: [],
                        haulerCooldown: 0,
                        cache: null,
                        link: null
                    });
                }
                const spawns: StructureSpawn[] = room.find(FIND_MY_SPAWNS);
                for (let i = 0; i < spawns.length; i++) {
                    const spawn: StructureSpawn = spawns[i];
                    newMyRoom.spawns.push({
                        name: spawn.name
                    });
                }

                Memory.myMemory.myRooms.push(newMyRoom);
            } else {
                //Already in memory

                //If the room has more or less spawns than in the MyRoom, add them to it
                const spawns: StructureSpawn[] = room.find(FIND_MY_SPAWNS);
                if (spawns.length !== myRoom.spawns.length) {
                    myRoom.spawns = [];
                    for (let i = 0; i < spawns.length; i++) {
                        const spawn: StructureSpawn = spawns[i];
                        myRoom.spawns.push({
                            name: spawn.name
                        });
                    }
                }
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
                ReportController.log("Removing room from memory" + LogHelper.roomNameAsLink(myRoom.name));
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

    private static handleCreepDying(myRoom: MyRoom, myCreep: MyCreep): void {
        //Creep is dead
        if (myCreep.role === "Miner") {
            //Need to check what source it was on
            for (let i = 0; i < myRoom.mySources.length; i++) {
                const mySource: MySource = myRoom.mySources[i];
                if (mySource.minerName === myCreep.name) {
                    mySource.minerName = null;
                }
            }
            ReportController.log("A Miner has died in " + LogHelper.roomNameAsLink(myRoom.name));
        } else if (myCreep.role === "Hauler") {
            for (let i = 0; i < myRoom.mySources.length; i++) {
                const mySource: MySource = myRoom.mySources[i];
                for (let j = mySource.haulerNames.length - 1; j >= 0; j--) {
                    if (mySource.haulerNames[j] === myCreep.name) {
                        mySource.haulerNames.splice(j, 1);
                    }
                }
            }
            ReportController.log("A Hauler has died in " + LogHelper.roomNameAsLink(myRoom.name));
        } else if (myCreep.role === "Laborer") {
            ReportController.log("A Laborer has died in " + LogHelper.roomNameAsLink(myRoom.name));
        } else if (myCreep.role === "Claimer") {
            ReportController.log("A Claimer has died in " + LogHelper.roomNameAsLink(myRoom.name));
        } else if (myCreep.role === "BankLinker") {
            myRoom.bankLinkerName = null;
            ReportController.log("A BankLinker has died in " + LogHelper.roomNameAsLink(myRoom.name));
        } else if (myCreep.role === "Stocker") {
            ReportController.log("A Stocker has died in " + LogHelper.roomNameAsLink(myRoom.name));
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
            if (myRoom.bankPos != null) {
                const bankPos: RoomPosition = RoomHelper.myPosToRoomPos(myRoom.bankPos);
                const structures: Structure<StructureConstant>[] = bankPos.lookFor(LOOK_STRUCTURES);
                for (let j = 0; j < structures.length; j++) {
                    if (structures[j].structureType === STRUCTURE_STORAGE) {
                        myRoom.bank = structures[j] as StructureStorage;
                        break;
                    }
                }
            }
        }
    }

    private static reduceCooldowns(): void {
        for (let i = 0; i < Memory.myMemory.myRooms.length; i++) {
            const myRoom: MyRoom = Memory.myMemory.myRooms[i];
            for (let j = 0; j < myRoom.mySources.length; j++) {
                const mySource: MySource = myRoom.mySources[j];
                if (mySource.haulerCooldown > 0) {
                    mySource.haulerCooldown--;
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

