import {Constants} from "../global/constants";
import {HelperFunctions} from "../global/helper-functions";
import {ReportController} from "../reporting/report-controller";
import {RoleAttackOneCreep} from "./role/attack-one-creep";

export class AttackOneController {
    public static run(empireCommand: EmpireCommand): void {
        let flag: Flag | null = null;

        let attackOne: AttackOne | null = Memory.myMemory.empire.attackOne;
        if (attackOne == null) {
            attackOne = this.setupAttackOne();
            if (attackOne == null) {
                return;
            }
        }

        if (attackOne.state === "Conscripting") {
            flag = Game.flags["attack-one-rally"];
            if (flag == null) {
                ReportController.log("ERROR", "attack-one-rally flag doesn't exist during AttackOne. Cancelling the attack.");
                this.endAttack();
                return;
            }

            //Wait until every room that's required to, has added a creep
            for (let i = attackOne.roomsStillToProvide.length - 1; i >= 0; i--) {
                const myRoom: MyRoom = attackOne.roomsStillToProvide[i];
                const attackOneCreep: AttackOneCreep | null = this.spawnAttackOneCreep(myRoom);
                if (attackOneCreep != null) {
                    console.log("LOG: " + myRoom.name + " has been conscripted " + attackOneCreep.name + " for AttackOne");
                    Memory.myMemory.empire.creeps.push(attackOneCreep);
                    attackOne.roomsStillToProvide.splice(i, 1);
                } // else room still to provide a creep
            }

            if (attackOne.roomsStillToProvide.length === 0) {
                empireCommand.haltRoomEnergyUsage = false;
                attackOne.state = "Rally";
                return;
            }

            //Some rooms still need to provide a creep
            empireCommand.haltRoomEnergyUsage = true;
        }

        if (attackOne.state === "Rally") {
            flag = Game.flags["attack-one-rally"];
            if (flag == null) {
                ReportController.log("ERROR", "attack-one-rally flag doesn't exist during AttackOne. Cancelling the attack.");
                this.endAttack();
                return;
            }

            //Wait until all the creeps are within range of the rally flag
            let allCreepsAtFlag: boolean = true;
            for (let i = 0; i < Memory.myMemory.empire.creeps.length; i++) {
                const myCreep: MyCreep = Memory.myMemory.empire.creeps[i];
                if (myCreep.role !== "AttackOneCreep") {
                    continue;
                }
                const creep: Creep = Game.creeps[myCreep.name];
                if (!creep.pos.inRangeTo(flag.pos, Constants.RALLY_FLAG_RANGE)) {
                    //Not in range
                    allCreepsAtFlag = false;
                    break;
                }
            }
            if (allCreepsAtFlag) {
                //If it gets here, we're ready to charge!
                console.log("LOG: AttackOne Charge");
                attackOne.state = "Charge";
            }
        }

        if (attackOne.state === "Charge") {
            flag = Game.flags["attack-one-room-target"];
            if (flag == null) {
                ReportController.log("ERROR", "attack-one-room-target flag doesn't exist during AttackOne. Cancelling the attack.");
                this.endAttack();
                return;
            }
            if (Memory.myMemory.empire.creeps.length === 0) {
                // Cancel attack when the creeps are dead
                console.log("ATTACK: Creeps are all dead, ending attack");
                this.endAttack();
            }
            if (attackOne.attackTarget != null) {
                const roomObject: RoomObject | null = Game.getObjectById<RoomObject>(attackOne.attackTarget.id);
                if (roomObject == null) {
                    //No longer exists, get a new target
                    attackOne.attackTarget = this.getAttackTarget(flag);
                    if (attackOne.attackTarget != null) {
                        console.log("LOG: New Attack Target (" + attackOne.attackTarget.type + ") " + JSON.stringify(attackOne.attackTarget.roomObject.pos));
                    }
                } else {
                    attackOne.attackTarget.roomObject = roomObject as Creep | Structure<StructureConstant>;
                }
            } else {
                attackOne.attackTarget = this.getAttackTarget(flag);
                if (attackOne.attackTarget != null) {
                    console.log("LOG: New Attack Target (" + attackOne.attackTarget.type + ") " + JSON.stringify(attackOne.attackTarget.roomObject.pos));
                }
            }
        }

        //Controlling creeps
        const myMemory: MyMemory = Memory.myMemory;
        for (let i = 0; i < myMemory.empire.creeps.length; i++) {
            const attackOneCreep: AttackOneCreep = myMemory.empire.creeps[i];
            if (attackOneCreep.role !== "AttackOneCreep") {
                continue;
            }

            RoleAttackOneCreep.run(attackOneCreep as AttackOneCreep, attackOne.state, flag as Flag, attackOne.attackTarget);
        }

        if (attackOne.attackTarget != null) {
            //Clear this so it doesn't have to be serialized
            delete attackOne.attackTarget.roomObject;
        }
    }

    private static getAttackTarget(flagToPathFrom: Flag): AttackTarget | null {
        if (flagToPathFrom.room == null) {
            return null;
        }

        const flagPos: RoomPosition = flagToPathFrom.pos;
        const room: Room = flagToPathFrom.room;
        //Make cost matrix for the room

        const costMatrix: CostMatrix = new PathFinder.CostMatrix;
        room.find(FIND_STRUCTURES).forEach(function (struct: Structure): void {
            if (struct.structureType === STRUCTURE_WALL ||
                struct.structureType === STRUCTURE_RAMPART) {
                costMatrix.set(struct.pos.x, struct.pos.y, 255);
            }
        });

        //SPAWNS
        const spawns: StructureSpawn[] = room.find(FIND_HOSTILE_SPAWNS);
        const spawnTarget: BestPathFindRoomObjectResult<StructureSpawn> | null
            = this.pathFindToRoomObject(flagPos, spawns, costMatrix);

        if (spawnTarget != null) {
            //Attacking a spawn
            return {
                roomObject: spawnTarget.roomObject,
                id: spawnTarget.roomObject.id,
                type: "Spawn"
            };
        }

        //TOWERS
        const towers: StructureTower[] = room.find<StructureTower>(FIND_STRUCTURES, {
                filter: (structure: Structure) => {
                    return structure.structureType === STRUCTURE_TOWER;
                }
            }
        );

        const towerTarget: BestPathFindRoomObjectResult<StructureTower> | null
            = this.pathFindToRoomObject(flagPos, towers, costMatrix);

        if (towerTarget != null) {
            //Attacking a tower
            return {
                roomObject: towerTarget.roomObject,
                id: towerTarget.roomObject.id,
                type: "Tower"
            };
        }

        //CREEPS
        const creeps: Creep[] = room.find(FIND_HOSTILE_CREEPS);

        const creepTarget: BestPathFindRoomObjectResult<Creep> | null
            = this.pathFindToRoomObject(flagPos, creeps, costMatrix);

        if (creepTarget != null) {
            //Attacking a creep
            return {
                roomObject: creepTarget.roomObject,
                id: creepTarget.roomObject.id,
                type: "Creep"
            };
        }

        //RAMPARTS
        const ramparts: StructureRampart[] = room.find<StructureRampart>(FIND_STRUCTURES, {
                filter: (structure: Structure) => {
                    return structure.structureType === STRUCTURE_RAMPART;
                }
            }
        );
        const rampartTarget: BestPathFindRoomObjectResult<StructureRampart> | null
            = this.pathFindToRoomObject(flagPos, ramparts, costMatrix);

        if (rampartTarget != null) {
            //Attacking a rampart
            return {
                roomObject: rampartTarget.roomObject,
                id: rampartTarget.roomObject.id,
                type: "Rampart"
            };
        }

        //WALL
        const walls: StructureWall[] = room.find<StructureWall>(FIND_STRUCTURES, {
                filter: (structure: Structure) => {
                    return structure.structureType === STRUCTURE_WALL;
                }
            }
        );
        const wallTarget: BestPathFindRoomObjectResult<StructureWall> | null
            = this.pathFindToRoomObject(flagPos, walls, costMatrix);

        if (wallTarget != null) {
            //Attacking a wall
            return {
                roomObject: wallTarget.roomObject,
                id: wallTarget.roomObject.id,
                type: "Wall"
            };
        }

        //Nothing was found as pathable
        console.log("LOG: Nothing pathable in getAttackTarget");
        return null;
    }

    private static pathFindToRoomObject<T extends RoomObject>(start: RoomPosition, roomObjects: T[], costmatrix: CostMatrix): BestPathFindRoomObjectResult<T> | null {

        if (roomObjects.length === 0) {
            return null;
        }

        let result: BestPathFindRoomObjectResult<T> | null = null;

        for (let i: number = 0; i < roomObjects.length; i++) {
            const roomObject: T = roomObjects[i];
            const pathFinderPath: PathFinderPath = PathFinder.search(
                start,
                {pos: roomObject.pos, range: 1},
                {
                    roomCallback: (roomName: string): CostMatrix => {
                        if (roomName === start.roomName) {
                            return costmatrix;
                        } else {
                            const room: Room = Game.rooms[roomName];
                            const costMatrix: CostMatrix = new PathFinder.CostMatrix;

                            if (room == null) {
                                return costMatrix;
                            }

                            room.find(FIND_STRUCTURES).forEach(function (struct: Structure): void {
                                if (struct.structureType === STRUCTURE_WALL ||
                                    struct.structureType === STRUCTURE_RAMPART) {
                                    costMatrix.set(struct.pos.x, struct.pos.y, 255);
                                }
                            });

                            return costMatrix;
                        }
                    }
                }
            );

            if (!pathFinderPath.incomplete) {
                if (result == null) {
                    result = {
                        roomObject: roomObject,
                        pathFinderPath: pathFinderPath
                    };
                } else if (result.pathFinderPath.cost > pathFinderPath.cost) {
                    //Replace it
                    result = {
                        roomObject: roomObject,
                        pathFinderPath: pathFinderPath
                    };
                } //Otherwise ignore it
            }
        }

        return result;
    }

    private static setupAttackOne(): AttackOne | null {
        const flag: Flag = Game.flags["attack-one-rally"];
        if (flag == null) {
            return null;
        }

        //Need to work out the rooms

        const attackOne: AttackOne = {
            state: "Conscripting",
            roomsStillToProvide: [],
            attackTarget: null
        };

        let outputMessage: string = "";
        for (let i = 0; i < Memory.myMemory.myRooms.length; i++) {
            const myRoom: MyRoom = Memory.myMemory.myRooms[i];
            if (myRoom.roomStage >= Constants.CONSCRIPTION_MINIMUM_STAGE
                && Game.map.getRoomLinearDistance(flag.pos.roomName, myRoom.name) < Constants.CONSCRIPTION_RANGE) {
                //This room will be conscripted
                attackOne.roomsStillToProvide.push(myRoom);
                outputMessage += myRoom.name + ", ";
            }
        }
        if (attackOne.roomsStillToProvide.length === 0) {
            console.log("LOG: Canceling an AttackOne because no rooms were in conscription range.");
            this.endAttack();
            return null;
        }

        //Remove the ", " from the last one
        outputMessage = outputMessage.slice(0, outputMessage.length - 2);

        console.log("AttackOne: " + attackOne.roomsStillToProvide.length +
            " Rooms conscripted for AttackOne (" + outputMessage + ")");
        Memory.myMemory.empire.attackOne = attackOne;
        return attackOne;
    }

    private static spawnAttackOneCreep(myRoom: MyRoom): AttackOneCreep | null {
        const spawn: StructureSpawn = Game.spawns[myRoom.spawns[0].name];

        //Have a valid spawn now
        const id: number = HelperFunctions.getId();

        const body: BodyPartConstant[] =
            HelperFunctions.generateBody([MOVE, ATTACK],
                [MOVE, ATTACK],
                spawn.room,
                true,
                50,
                true
            );

        const result: ScreepsReturnCode =
            spawn.spawnCreep(
                body,
                "Creep" + id,
                {
                    memory:
                        {
                            name: "Creep" + id,
                            role: "AttackOneCreep",
                            assignedRoomName: ""
                        }
                }
            );

        if (result === OK) {
            return {
                name: "Creep" + id,
                role: "AttackOneCreep",
                assignedRoomName: ""
            };
        }
        return null;
    }

    private static endAttack(): void {
        const empire: Empire = Memory.myMemory.empire;
        empire.attackOne = null;

        for (let i = empire.creeps.length - 1; i >= 0; i--) {
            if (empire.creeps[i].role === "AttackOneCreep") {
                console.log("LOG: Killing AttackOneCreep " + empire.creeps[i].name);
                Game.creeps[empire.creeps[i].name].suicide();
            }
        }
        const flagNames: string[] = Object.keys(Game.flags);
        for (let i = flagNames.length - 1; i >= 0; i--) {
            if (flagNames[i].includes("attack-one")) {
                const flag: Flag = Game.flags[flagNames[i]];
                flag.remove();
            }
        }
    }
}
