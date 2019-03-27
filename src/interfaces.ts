interface CreepMemory {
    stage: number;
    harvesting?: boolean;
    role?: string;
    assignedRoomName?: string;
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

interface MyCreep extends CreepMemory {
    name: string;
}
