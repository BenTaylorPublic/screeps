import {HelperFunctions} from "../global/helper-functions";
import {ReportController} from "../reporting/report-controller";

export class MemoryController {
    public static run(): void {
        this.clearDeadCreeps();
        this.ensureAllRoomsInMyMemory();
        this.validateRoomsInMyMemory();
        this.cleanUpEmpireCreeps();
        this.getBanks();
        this.reduceCooldowns();
    }

    public static clearBanks(): void {
        for (let i = 0; i < Memory.myMemory.myRooms.length; i++) {
            const myRoom: MyRoom = Memory.myMemory.myRooms[i];
            myRoom.bank = null;
        }
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
                ReportController.log("OTHER", "Adding a new room to memory" + roomName);
                const newMyRoom: MyRoom = {
                    name: roomName,
                    myCreeps: [],
                    spawns: [],
                    mySources: [],
                    roomStage: -1,
                    bankPos: null,
                    bankLinkerName: null,
                    bankLink: null,
                    bank: null,
                    outLinks: [],
                    pendingConscriptedCreep: false
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
                        position: HelperFunctions.roomPosToMyPos(spawn.pos),
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
                            position: HelperFunctions.roomPosToMyPos(spawn.pos),
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
                console.log("OTHER", "Removing room from memory" + myRoom.name);
                Memory.myMemory.myRooms.splice(i, 1);
                continue;
            }
            for (let j = myRoom.myCreeps.length - 1; j >= 0; j--) {
                const myCreep: MyCreep = myRoom.myCreeps[j];
                if (Game.creeps[myCreep.name] == null) {
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
            console.log("LOG: A Miner has died");
        } else if (myCreep.role === "Hauler") {
            for (let i = 0; i < myRoom.mySources.length; i++) {
                const mySource: MySource = myRoom.mySources[i];
                for (let j = mySource.haulerNames.length - 1; j >= 0; j--) {
                    if (mySource.haulerNames[j] === myCreep.name) {
                        mySource.haulerNames.splice(j, 1);
                    }
                }
            }
            console.log("LOG: A Hauler has died");
        } else if (myCreep.role === "Laborer") {
            console.log("LOG: A Laborer has died");
        } else if (myCreep.role === "Claimer") {
            console.log("LOG: A Claimer has died");
        } else if (myCreep.role === "BankLinker") {
            myRoom.bankLinkerName = null;
            console.log("LOG: A BankLinker has died");
        } else {
            ReportController.log("ERROR", "A Creep with a weird role has died: " + myCreep.role);
        }
    }

    private static cleanUpEmpireCreeps(): void {
        for (let i = Memory.myMemory.empire.creeps.length - 1; i >= 0; i--) {
            const myCreep: MyCreep = Memory.myMemory.empire.creeps[i];
            if (Game.creeps[myCreep.name] == null) {
                Memory.myMemory.empire.creeps.splice(i, 1);
            }
        }
    }

    private static getBanks(): void {
        for (let i = 0; i < Memory.myMemory.myRooms.length; i++) {
            const myRoom: MyRoom = Memory.myMemory.myRooms[i];
            if (myRoom.bankPos != null) {
                const bankPos: RoomPosition = HelperFunctions.myPosToRoomPos(myRoom.bankPos);
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

}

