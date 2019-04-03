interface CreepMemory extends MyCreep {
    [key: string]: any;
}
interface FlagMemory { }
interface SpawnMemory { }
interface RoomMemory { }
interface MyMemory {
    globalId: number;
    myRooms: MyRoom[];
    prod: boolean; //TODO: DELETE AFTER NEXT RELEASE
}

interface MyRoom {
    name: string;
    myCreeps: MyCreep[];
    spawnName: string | null;
    mySources: MySource[];
    myContainers: MyContainer[]; //TODO: DELETE AFTER NEXT RELEASE
    roomStage: number;
    manuallyPlacedBase: boolean; //TODO: DELETE AFTER NEXT RELEASE
    baseCenter: RoomPosition | null; //TODO: DELETE AFTER NEXT RELEASE
}

interface MySource {
    id: string;
    cacheContainerId: string | null; //TODO: DELETE AFTER NEXT RELEASE
    minerName: string | null; //Null when miner is dead or not assigned
}

interface MyContainer { //TODO: DELETE AFTER NEXT RELEASE
    id: string;
    role: string;
    assignedSourceId: string | null; //For caches
    haulerNames: string[] | null; //For caches
}

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
    cacheContainerIdToPutIn: string; //TODO: DELETE AFTER NEXT RELEASE
    sourceId: string;
}

interface Hauler extends MyCreep {
    cacheContainerIdToGrabFrom: string; //TODO: DELETE AFTER NEXT RELEASE
    pickup: boolean;
}

interface Laborer extends MyCreep {
    pickup: boolean;
}
