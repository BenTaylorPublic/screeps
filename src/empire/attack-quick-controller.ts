import {ReportController} from "../reporting/report-controller";
import {Constants} from "../global/constants";
import {RoleAttackQuickCreep} from "./role/attack-quick-creep";
import {HelperFunctions} from "../global/helper-functions";

export class AttackQuickController {
    public static run(attackQuick: AttackQuick, empireCommand: EmpireCommand): void {
        let flag: Flag | null = null;

        if (attackQuick.state === "Conscripting") {
            flag = Game.flags["attack-quick-rally"];
            if (flag == null) {
                ReportController.log("ERROR", "attack-quick-rally flag doesn't exist during AttackQuick. Cancelling the attack.");
                this.endAttack();
                return;
            }

            //Wait until every room that's required to, has added a creep
            for (let i = attackQuick.roomsStillToProvide.length - 1; i >= 0; i--) {
                const myRoom: MyRoom = attackQuick.roomsStillToProvide[i];
                const attackQuickCreep: AttackQuickCreep | null = this.spawnAttackQuickCreep(myRoom);
                if (attackQuickCreep != null) {
                    console.log("LOG: " + myRoom.name + " has been conscripted " + attackQuickCreep.name + " for AttackQuick");
                    Memory.myMemory.empire.creeps.push(attackQuickCreep);
                    attackQuick.roomsStillToProvide.splice(i, 1);
                } // else room still to provide a creep
            }

            if (attackQuick.roomsStillToProvide.length === 0) {
                empireCommand.haltRoomEnergyUsage = false;
                attackQuick.state = "Rally";
                return;
            }

            //Some rooms still need to provide a creep
            empireCommand.haltRoomEnergyUsage = true;
        }

        if (attackQuick.state === "Rally") {
            flag = Game.flags["attack-quick-rally"];
            if (flag == null) {
                ReportController.log("ERROR", "attack-quick-rally flag doesn't exist during AttackQuick. Cancelling the attack.");
                this.endAttack();
                return;
            }

            //Wait until all the creeps are within range of the rally flag
            let allCreepsAtFlag: boolean = true;
            for (let i = 0; i < Memory.myMemory.empire.creeps.length; i++) {
                const myCreep: MyCreep = Memory.myMemory.empire.creeps[i];
                if (myCreep.role !== "AttackQuickCreep") {
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
                console.log("LOG: AttackQuick Charge");
                attackQuick.state = "Charge";
            }
        }

        if (attackQuick.state === "Charge") {
            flag = Game.flags["attack-quick-room-target"];
            if (flag == null) {
                ReportController.log("ERROR", "attack-quick-room-target flag doesn't exist during AttackQuick. Cancelling the attack.");
                this.endAttack();
                return;
            }
            if (Memory.myMemory.empire.creeps.length === 0) {
                // Cancel attack when the creeps are dead
                console.log("ATTACK: Creeps are all dead, ending attack");
                this.endAttack();
            }
            if (attackQuick.attackTarget != null) {
                const roomObject: RoomObject | null = Game.getObjectById<RoomObject>(attackQuick.attackTarget.id);
                if (roomObject == null) {
                    //No longer exists, get a new target
                    attackQuick.attackTarget = this.getAttackTarget(flag);
                } else {
                    attackQuick.attackTarget.roomObject = roomObject as Creep | Structure<StructureConstant>;
                }
            } else {
                attackQuick.attackTarget = this.getAttackTarget(flag);
            }
        }

        //Controlling creeps
        const myMemory: MyMemory = Memory.myMemory;
        for (let i = 0; i < myMemory.empire.creeps.length; i++) {
            const attackQuickCreep: AttackQuickCreep = myMemory.empire.creeps[i];
            if (attackQuickCreep.role !== "AttackQuickCreep") {
                continue;
            }

            RoleAttackQuickCreep.run(attackQuickCreep as AttackQuickCreep, attackQuick.state, flag as Flag, attackQuick.attackTarget);
        }

        if (attackQuick.attackTarget != null) {
            //Clear this so it doesn't have to be serialized
            delete attackQuick.attackTarget.roomObject;
        }
    }

    public static setupAttackQuick(rallyFlag: Flag): AttackQuick | null {
        //Need to work out the rooms

        const attackQuick: AttackQuick = {
            state: "Conscripting",
            roomsStillToProvide: [],
            attackTarget: null
        };

        let outputMessage: string = "";
        for (let i = 0; i < Memory.myMemory.myRooms.length; i++) {
            const myRoom: MyRoom = Memory.myMemory.myRooms[i];
            if (myRoom.roomStage >= Constants.CONSCRIPTION_MINIMUM_STAGE
                && Game.map.getRoomLinearDistance(rallyFlag.pos.roomName, myRoom.name) < Constants.CONSCRIPTION_RANGE) {
                //This room will be conscripted
                attackQuick.roomsStillToProvide.push(myRoom);
                outputMessage += myRoom.name + ", ";
            }
        }
        if (attackQuick.roomsStillToProvide.length === 0) {
            console.log("LOG: Canceling an AttackQuick because no rooms were in conscription range.");
            this.endAttack();
            return null;
        }

        //Remove the ", " from the last one
        outputMessage = outputMessage.slice(0, outputMessage.length - 2);

        console.log("AttackQuick: " + attackQuick.roomsStillToProvide.length +
            " Rooms conscripted for AttackQuick (" + outputMessage + ")");
        Memory.myMemory.empire.attackQuick = attackQuick;
        return attackQuick;
    }

    private static getAttackTarget(flagToPathFrom: Flag): AttackTarget | null {
        if (flagToPathFrom.room == null) {
            return null;
        }

        if (Game.flags["attack-target"] == null) {
            //Will update with the actual position
            Game.flags["attack-target"] =
                new Flag("attack-target", COLOR_RED, COLOR_RED, flagToPathFrom.room.name, 1, 1);

        }
        const targetFlag: Flag = Game.flags["attack-target"];

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
            console.log("LOG: New Attack Target (Spawn) " + JSON.stringify(spawnTarget.roomObject.pos));
            targetFlag.setPosition(spawnTarget.roomObject.pos);
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
            console.log("LOG: New Attack Target (Tower) " + JSON.stringify(towerTarget.roomObject.pos));
            targetFlag.setPosition(towerTarget.roomObject.pos);
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
            console.log("LOG: New Attack Target (Creep) " + JSON.stringify(creepTarget.roomObject.pos));
            targetFlag.setPosition(creepTarget.roomObject.pos);
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
            console.log("LOG: New Attack Target (Rampart) " + JSON.stringify(rampartTarget.roomObject.pos));
            targetFlag.setPosition(rampartTarget.roomObject.pos);
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
            console.log("LOG: New Attack Target (Wall) " + JSON.stringify(wallTarget.roomObject.pos));
            targetFlag.setPosition(wallTarget.roomObject.pos);
            return {
                roomObject: wallTarget.roomObject,
                id: wallTarget.roomObject.id,
                type: "Wall"
            };
        }

        //Nothing was found as pathable
        console.log("LOG: Nothing pathable in getAttackTarget");
        targetFlag.remove();
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

    private static spawnAttackQuickCreep(myRoom: MyRoom): AttackQuickCreep | null {
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
                            role: "AttackQuickCreep",
                            assignedRoomName: ""
                        }
                }
            );

        if (result === OK) {
            return {
                name: "Creep" + id,
                role: "AttackQuickCreep",
                assignedRoomName: ""
            };
        }
        return null;
    }

    private static endAttack(): void {
        const empire: Empire = Memory.myMemory.empire;
        empire.attackQuick = null;

        for (let i = empire.creeps.length - 1; i >= 0; i--) {
            if (empire.creeps[i].role === "AttackQuickCreep") {
                console.log("LOG: Killing AttackQuickCreep " + empire.creeps[i].name);
                Game.creeps[empire.creeps[i].name].suicide();
            }
        }
        const flagNames: string[] = Object.keys(Game.flags);
        for (let i = flagNames.length - 1; i >= 0; i--) {
            if (flagNames[i].includes("attack")) {
                const flag: Flag = Game.flags[flagNames[i]];
                flag.remove();
            }
        }
    }
}