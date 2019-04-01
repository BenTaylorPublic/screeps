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
    myContainers: MyContainer[];
    roomStage: number;
    manuallyPlacedBase: boolean;
    baseCenter: RoomPosition | null;
}

interface MySource {
    id: string;
    cacheContainerId: string | null;
    minerName: string | null; //Null when miner is dead or not assigned
}

interface MyContainer {
    id: string;
    role: string;
    assignedSourceId: string | null; //For caches
    haulerNames: string[] | null; //For caches
}

interface MyCreep {
    name: string;
    role: string;
    assignedRoomName: string;
}

interface MinerAndWorker extends MyCreep {
    mining: boolean;
}

interface Miner extends MyCreep {
    cacheContainerIdToPutIn: string;
    sourceId: string;
}

interface Hauler extends MyCreep {
    cacheContainerIdToGrabFrom: string;
    pickup: boolean;
}

interface Laborer extends MyCreep {
    pickup: boolean;
}
