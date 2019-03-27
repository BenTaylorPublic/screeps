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
    stage: number;
    rooms: RoomWithAssignedData[];
}

interface RoomWithAssignedData {
    name: string;
    creepNames: string[];
    spawn: string;
    sources: string[];
    containers: ContainerWithAssignedData[];
}

interface ContainerWithAssignedData {
    name: string;
    /*
    0- Source cache
    1- Bank
    */
    role: number;
    assignedSource?: string;
}
