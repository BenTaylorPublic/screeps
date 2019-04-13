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
    roomStage: -1 | 0 | 0.3 | 0.6 | 1 | 1.5 | 2 | 2.2 | 2.4 | 2.6 | 2.8 | 3;
    bankPos: MyRoomPos | null;
    myExtensionPositions: MyRoomPos[];
    myTowerPositions: MyRoomPos[];
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
