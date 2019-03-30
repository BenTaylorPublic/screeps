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
    /*
        Loosely based on RCL
        0: RCL 0
        1: RCL 1, fixed amount of MinerAndWorkers
        1.20: RCL 2, Using MinerAndWorker creeps to build source caches and bank
        1.40: Creating Miners and haulers
        1.60: Miners and haulers are fully assigned
        2: Start spawning builders when bank hits cap, only spawn MinerAndWorker on panic mode
        2.5: Start constructing tower
        3: Tower complete, Haulers place road when they walk
     */
    roomStage: number;
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
