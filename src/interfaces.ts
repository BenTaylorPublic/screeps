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

//     id: string;
//     role: string;
//     assignedSourceId: string | null; //For caches
//     haulerNames: string[] | null; //For caches
// }

/*
====================
    CREEPS:
====================
*/

interface MyCreep {
    name: string;
    role: string;
    assignedRoomName: string;
}

interface MinerAndWorker extends MyCreep {
    mining: boolean;
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
    pickup: boolean;
}
