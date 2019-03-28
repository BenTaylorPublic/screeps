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
    spawnId?: string;
    mySources: MySource[];
    myContainers: MyContainer[];
}

interface MySource {
    id: string;
    cacheContainerId?: string;
    minerName?: string; //Null when miner is dead or not assigned
}

interface MyContainer {
    id: string;
    /*
    0- Source cache
    1- Bank
    */
    role: number;
    assignedSourceId?: string;
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
}
