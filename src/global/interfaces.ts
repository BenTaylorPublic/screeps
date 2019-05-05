interface CreepMemory extends MyCreep {
    [key: string]: any;
}

interface FlagMemory {
}

interface SpawnMemory {
}

interface RoomMemory {
}

interface MyMemory {
    globalId: number;
    myRooms: MyRoom[];
    myTravelingCreeps: MyCreep[];
    empire: Empire;
}

/*
====================
    EMPIRE:
====================
*/

interface Empire {
    zergWithHeals: WarZergWithHeals | null;
}

interface WarZergWithHeals {
    state: "Conscripting" | "Rally" | "Charge";
}

/*
====================
    ROOM:
====================
*/

interface MyRoom {
    name: string;
    myCreeps: MyCreep[];
    spawns: MySpawn[];
    mySources: MySource[];
    roomStage: -1 | 0 | 0.5 | 1 | 1.3 | 1.6 | 2 | 2.3 | 2.6 | 3 | 3.3 | 3.6 | 4 | 4.2 | 4.4 | 4.6 | 4.8 | 5 | 5.2 | 5.4 | 5.6 | 5.8 | 5.9 | 6;
    bankPos: MyRoomPos | null;
    bankLinkerName: string | null; //Null when bankLinker is dead or not assigned
    bankLink: MyLink | null;
    bank: StructureStorage | null;
}

interface MySpawn {
    position: MyRoomPos;
    name: string;
}

interface MySource {
    id: string;
    state: "NoCache" | "Cache" | "Link";
    minerName: string | null; //Null when miner is dead or not assigned
    haulerNames: string[];
    haulerCooldown: number;
    cache: MyCache | null;
    link: MyLink | null;
}

interface MyCache {
    pos: MyRoomPos;
    id: string | null;
}

interface MyLink {
    pos: MyRoomPos;
    id: string | null;
}

interface MyRoomPos {
    x: number;
    y: number;
    roomName: string;
}

/*
====================
    CREEPS:
====================
*/

interface MyCreep {
    name: string;
    role: "Hauler" | "Miner" | "Laborer" | "Claimer" | "BankLinker";
    assignedRoomName: string;
}

interface Miner extends MyCreep {
    sourceId: string;
    cachePosToMineOn: MyRoomPos;
    linkIdToDepositTo: string | null;
}

interface Hauler extends MyCreep {
    pickup: boolean;
    cachePosToPickupFrom: MyRoomPos;
}

interface Laborer extends MyCreep {
    state: "PickupBank" | "Mining" | "Labor" | "PickupCache";
}


interface Claimer extends MyCreep {
    flagName: string;
}

interface BankLinker extends MyCreep {
}
