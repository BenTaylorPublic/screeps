interface CreepMemory extends MyCreep {
    [key: string]: any;
}
interface FlagMemory { }
interface SpawnMemory { }
interface RoomMemory { }
interface MyMemory {
    globalId: number;
    prod: boolean;
    myRooms: MyRoom[];
}

interface MyRoom {
    name: string;
    myCreeps: MyCreep[];
    spawnName?: string;
    mySources: MySource[];
    myContainers: MyContainer[];
    roomStage: number;
}

interface MySource {
    id: string;
    cacheContainerId?: string;
    minerName?: string; //Null when miner is dead or not assigned
}

interface MyContainer {
    id: string;
    role: string;
    assignedSourceId?: string; //For caches
    haulerNames?: string[]; //For caches
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
    bankContainerIdToPutIn: string;
    pickup: boolean;
}
