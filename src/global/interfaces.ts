interface MyMemory {
    globalId: number;
    myRooms: MyRoom[];
    empire: Empire;
    reports: ReportLog;
    scheduledCommands: ScheduledCommand[];
}

/*
====================
    EMPIRE:
====================
*/

interface Empire {
    oddThousand: boolean;
    attackQuick: AttackQuick | null;
    attackPressure: AttackPressure | null;
    attackHealerDrain: AttackHealerDrain | null;
    creeps: MyCreep[];
    observer: ObserverMemory | null;
    avoidRooms: string[];
    powerScav: PowerScav;
}

interface ObserverMemory {
    currentObservingRoomName: string;
    nextObservingRoom: MyRoomName;
    observerId: Id<StructureObserver>;
    topLeftX: number;
    topLeftY: number;
    size: number;
}


type AttackStateType = "Conscripting" | "Rally" | "Charge";

interface AttackQuick {
    state: AttackStateType;
    roomsStillToProvide: string[];
    attackTarget: AttackTarget | null;
}

interface AttackHealerDrain {
    state: AttackStateType;
    roomsStillToProvide: string[];
    attackTarget: AttackTarget | null;
}

interface AttackPressure {
    batchesStarted: number;
    batches: AttackPressureBatch[];
    attackTarget: AttackTarget | null;
    roomsInRange: string[];
}

interface AttackPressureBatch {
    state: AttackStateType;
    batchNumber: number;
    roomsStillToProvide: string[];
}

interface AttackTarget {
    roomObject: Creep | Structure<StructureConstant>;
    id: Id<RoomObject>;
    type: string;
}

interface BestPathFindRoomObjectResult<T extends RoomObject> {
    roomObject: T;
    pathFinderPath: PathFinderPath;
}

/*
====================
    ROOM:
====================
*/
type Stage =
    -1
    | 0
    | 0.5
    | 1
    | 1.3
    | 1.6
    | 2
    | 2.3
    | 2.6
    | 3
    | 3.3
    | 3.6
    | 4
    | 4.2
    | 4.4
    | 4.6
    | 4.8
    | 5
    | 5.2
    | 5.4
    | 5.6
    | 5.8
    | 6
    | 6.25
    | 6.5
    | 6.75
    | 7
    | 7.2
    | 7.4
    | 7.6
    | 7.8
    | 8;

interface MyRoom {
    name: string;
    myCreeps: MyCreep[];
    spawns: MySpawn[];
    powerSpawnId: Id<StructurePowerSpawn> | null;
    mySources: MySource[];
    roomStage: Stage;
    bankPos: MyRoomPos | null;
    bankLinkerName: string | null;
    bankLinkerPos: MyRoomPos | null;
    bankLink: MyLink | null;
    bank: StructureStorage | null;
    spawnQueue: QueuedCreep[];
    rampartsUp: boolean;
}

interface QueuedCreep {
    priority: number;
    name: string;
    role: CreepRoles | "ForceLaborer";
}

interface MySpawn {
    name: string;
}

interface MySource {
    id: Id<Source>;
    state: "NoCache" | "Cache" | "Link";
    minerName: string | null; //Null when miner is dead or not assigned
    haulerNames: string[];
    haulerCooldown: number;
    cache: MyCache | null;
    link: MyLink | null;
}

interface MyCache {
    pos: MyRoomPos;
    id: Id<StructureContainer> | null;
}

interface MyLink {
    pos: MyRoomPos;
    id: Id<StructureLink> | null;
}

interface MyRoomPos {
    x: number;
    y: number;
    roomName: string;
}

interface MyRoomName {
    roomName: string;
    xChar: string;
    yChar: string;
    xNum: number;
    yNum: number;
}

interface FindOtherCreepsResult {
    healers: boolean;
    hostileCreeps: Creep[];
    alliedCreeps: Creep[];
}

/*
====================
    CREEP THINGS:
====================
*/

interface CreepRoomMoveTarget {
    pos: MyRoomPos | null;
    path: PathStep[];
}

type CreepSpawningStatus = "queued" | "spawning" | "alive";
type CreepRoles =
    "Hauler"
    | "Miner"
    | "Laborer"
    | "Claimer"
    | "BankLinker"
    | "AttackQuickCreep"
    | "AttackPressureCreep"
    | "PowerScavAttackCreep"
    | "PowerScavHaulCreep"
    | "Stocker"
    | "Signer"
    | "AttackHealerDrainCreep"
    | "Scavenger";

/*
====================
    CREEPS:
====================
*/

interface MyCreep {
    name: string;
    role: CreepRoles;
    assignedRoomName: string;
    interRoomTravelCurrentTarget?: MyRoomPos;
    roomMoveTarget: CreepRoomMoveTarget;
    lastPos?: MyRoomPos | null;
    spawningStatus: CreepSpawningStatus;
}

interface Miner extends MyCreep {
    sourceId: Id<Source>;
    cachePosToMineOn: MyRoomPos;
    amountOfWork: number;
    linkIdToDepositTo: Id<StructureLink> | null;
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
    inPos: boolean;
}

interface AttackQuickCreep extends MyCreep {
}

interface AttackPressureCreep extends MyCreep {
    batchNumber: number;
}

interface PowerScavAttackCreep extends MyCreep {
    powerBankId: Id<StructurePowerBank>;
    beenReplaced: boolean;
}

interface PowerScavHaulCreep extends MyCreep {
    state: "grabbing" | "depositing";
    roomToDepositTo: string;
}

interface AttackHealerDrainCreep extends MyCreep {
}

interface Stocker extends MyCreep {
    state: "PickupEnergy" | "DistributeEnergy" | "PickupResources" | "DepositResources" | "StockTerminalEnergy";
}

interface Signer extends MyCreep {
    signWords: string;
}

interface Scavenger extends MyCreep {
    state: "Scavenging" | "Returning";
    scavengeAgainWhenTtlAbove: number;
    scavengingRoomName: string;
    scavengeTargetPos: MyRoomPos | null;
}

interface ScavengerTargetResult {
    isResource: boolean;
    structure: AnyStoreStructure | Tombstone | Ruin | null;
    resource: Resource | null;
    pos: RoomPosition;
}

/*
====================
    REPORTS:
====================
*/
interface ReportLog {
    [key: string]: number; //Datetime
}

/*
====================
    SCHEDULE:
====================
*/

type ScheduleAction = "SET_FALSE_ON_PENDING_CONSCRIPTED_CREEP";

interface ScheduledCommand {
    roomName: string;
    action: ScheduleAction;
}

/*
====================
    IN BUILT:
====================
*/

type FindRouteResult = Array<{ exit: ExitConstant; room: string; }> | ERR_NO_PATH;
type MoveByPathResult = CreepMoveReturnCode | ERR_NOT_FOUND | ERR_INVALID_ARGS;

/*
====================
    POWER SCAVENGING:
====================
*/

interface PowerScav {
    targetBanks: PowerScavBank[];
}

interface PowerScavBank {
    id: Id<StructurePowerBank>;
    pos: MyRoomPos;
    roomsToGetCreepsFrom: string[];
    roomsToGetCreepsFromIndex: number;
    eol: number;
    attackCreeps: PowerScavAttackCreep[];
    attackCreepsStillNeeded: number;
    amountOfCarryBodyStillNeeded: number;
    roomDistanceToBank: number;
    amountOfPositionsAroundBank: number;
    power: number;
    replaceAtTTL: number;
    spawnHaulersAtHP: number;
    state: "high_hp" | "spawn_haulers" | "dead";
}

/*
====================
    SCAVENGING:
====================
*/

interface ScavengeMyRoom {
    myRoom: MyRoom;
    amountOfCarryPerCreep: number;
    scavengeAgainWhenTtlAbove: number;
}