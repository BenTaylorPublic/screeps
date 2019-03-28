interface CreepMemory extends MyCreep { }
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
    mining?: boolean; //Only used on minerAndWorker creeps
    harvesting?: boolean;
}
