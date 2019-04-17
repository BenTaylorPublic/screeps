interface CreepMemory extends MyCreep {
    [key: string]: any;
}
interface FlagMemory { }
interface SpawnMemory { }
interface RoomMemory { }
interface MyMemory {
    globalId: number;
    myRooms: MyRoom[];
}

interface MyRoom {
    name: string;
    myCreeps: MyCreep[];
    spawns: MySpawn[];
    mySources: MySource[];
    roomStage: -1 | 0 | 0.3 | 0.6 | 1 | 1.5 | 2 | 2.3 | 2.6 | 3 | 3.3 | 3.6 | 4;
    bankPos: MyRoomPos | null;
    myExtensionPositions: MyRoomPos[];
    myTowerPositions: MyRoomPos[];
}

interface MySpawn {
    position: MyRoomPos;
    name: string;
}

interface MySource {
    id: string;
    minerName: string | null; //Null when miner is dead or not assigned
    haulerNames: string[];
    cachePos: MyRoomPos | null;
}

interface MyRoomPos {
    x: number;
    y: number;
    roomName: string;
}

interface StageController {
    up(myRoom: MyRoom, room: Room): boolean;
    down(myRoom: MyRoom, room: Room): boolean;
    step(myRoom: MyRoom, room: Room): void;
}

/*
====================
    CREEPS:
====================
*/

interface MyCreep {
    name: string;
    role: "Hauler" | "Miner" | "Laborer";
    assignedRoomName: string;
}

interface Miner extends MyCreep {
    sourceId: string;
    cachePosToMineOn: MyRoomPos;
}

interface Hauler extends MyCreep {
    pickup: boolean;
    cachePosToPickupFrom: MyRoomPos;
}

interface Laborer extends MyCreep {
    state: "PickupBank" | "Mining" | "Labor" | "PickupCache";
}
