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
    creepNames: string[];
    spawn?: string;
    sources: MySource[];
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
    assignedSource?: string;
}
