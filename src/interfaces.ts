interface CreepMemory extends MyCreep {
    [key: string]: any;
}
interface FlagMemory { }
interface SpawnMemory { }
interface RoomMemory { }
interface MyMemory {
    globalId: number;
    myRooms: MyRoom[];
    myTravelingCreeps: MyCreep[];
}

interface MyRoom {
    name: string;
    myCreeps: MyCreep[];
    spawns: MySpawn[];
    mySources: MySource[];
    roomStage: -1 | 0 | 0.5 | 1 | 1.3 | 1.6 | 2 | 2.3 | 2.6 | 3 | 3.3 | 3.6 | 4 | 4.2 | 4.4 | 4.6 | 4.8 | 5;
    bankPos: MyRoomPos | null;
    myExtensionPositions: MyRoomPos[];
    myTowerPositions: MyRoomPos[];
    bankLinkSlaveName: string | null; //Null when bankLinkSlave is dead or not assigned
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
    cache: MyCache | null;
    link: MyLink | null;
}

interface MyCache {
    pos: MyRoomPos;
    id: string | null;
}

interface MyLink {
    pos: MyRoomPos;
    id: string;
}

interface MyRoomPos {
    x: number;
    y: number;
    roomName: string;
}

interface StageController {
    up(myRoom: MyRoom, room: Room): boolean;
    down(myRoom: MyRoom, room: Room): boolean;
    step(myRoom: MyRoom, room: Room): void;
}

/*
====================
    CREEPS:
====================
*/

interface MyCreep {
    name: string;
    role: "Hauler" | "Miner" | "Laborer" | "Claimer" | "BankLinkSlave";
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

interface BankLinkSlave extends MyCreep {
}
