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
    spawnName: string | null;
    mySources: MySource[];
    roomStage: number;
    bankPos: MyRoomPos | null;
    myExtensionPositions: MyRoomPos[];
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
    state: "Pickup" | "Mining" | "Labor";
}
