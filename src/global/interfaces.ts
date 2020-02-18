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
    empire: Empire;
    report: ReportLog;
    scheduledCommands: ScheduledCommand[];
}

/*
====================
    EMPIRE:
====================
*/

interface Empire {
    attackQuick: AttackQuick | null;
    attackPressure: AttackPressure | null;
    creeps: MyCreep[];
    observer: ObserverMemory;
    avoidRooms: string[];
}

interface ObserverMemory {
    state: "Moving" | "Observing";
    currentTargetIndex: number | null;
    targetList: string[];
    observerIds: string[];
}


type AttackStateType = "Conscripting" | "Rally" | "Charge";

interface AttackQuick {
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
    id: string;
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
    powerSpawnId: string | null;
    mySources: MySource[];
    roomStage: Stage;
    bankPos: MyRoomPos | null;
    bankLinkerName: string | null; //Null when bankLinker is dead or not assigned
    bankLink: MyLink | null;
    bank: StructureStorage | null;
    outLinks: MyLink[];
    pendingConscriptedCreep: boolean;
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

interface MyRoomName {
    roomName: string;
    xChar: string;
    yChar: string;
    xNum: number;
    yNum: number;
}

/*
====================
    CREEPS:
====================
*/

interface MyCreep {
    name: string;
    role: "Hauler" | "Miner" | "Laborer" | "Claimer" | "BankLinker" | "AttackQuickCreep" | "AttackPressureCreep";
    assignedRoomName: string;
    interRoomTravelCurrentTarget?: MyRoomPos;
}

interface Miner extends MyCreep {
    sourceId: string;
    cachePosToMineOn: MyRoomPos;
    amountOfWork: number;
    linkIdToDepositTo: string | null;
}

interface Hauler extends MyCreep {
    pickup: boolean;
    cachePosToPickupFrom: MyRoomPos;
}

interface Laborer extends MyCreep {
    state: "PickupBank" | "Mining" | "Labor" | "PickupCache" | "PickupOutLink";
}


interface Claimer extends MyCreep {
    flagName: string;
}

interface BankLinker extends MyCreep {
}

interface AttackQuickCreep extends MyCreep {
}

interface AttackPressureCreep extends MyCreep {
    batchNumber: number;
}

/*
====================
    REPORTS:
====================
*/
interface ReportLog {
    lastReportTimeStamp: number;
    reports: Report[];
}

interface Report {
    timeStamp: number;
    tick: number;
    messageType: ReportMessageType;
    message: string;
}

type ReportMessageType = "DEFENCE" | "STAGE" | "ERROR" | "OTHER";

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