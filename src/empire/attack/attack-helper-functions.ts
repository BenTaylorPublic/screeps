import {ReportController} from "../../reporting/report-controller";
import {HelperFunctions} from "../../global/helper-functions";

export class AttackHelperFunctions {
    public static getNewTargetIfNeeded(attackTarget: AttackTarget | null, flag: Flag): AttackTarget | null {
        if (attackTarget != null) {
            const roomObject: RoomObject | null = Game.getObjectById<RoomObject>(attackTarget.id);
            if (roomObject == null) {
                //No longer exists, get a new target
                attackTarget = AttackHelperFunctions.getAttackTarget(flag);
            } else {
                attackTarget.roomObject = roomObject as Creep | Structure<StructureConstant>;
            }
        } else {
            attackTarget = AttackHelperFunctions.getAttackTarget(flag);
        }
        return attackTarget;
    }

    public static getAttackTarget(flagToPathFrom: Flag): AttackTarget | null {
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
            ReportController.log("New Attack Target (Spawn) " + JSON.stringify(spawnTarget.roomObject.pos));
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
            ReportController.log("New Attack Target (Tower) " + JSON.stringify(towerTarget.roomObject.pos));
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
            ReportController.log("New Attack Target (Creep) " + JSON.stringify(creepTarget.roomObject.pos));
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
            ReportController.log("New Attack Target (Rampart) " + JSON.stringify(rampartTarget.roomObject.pos));
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
            ReportController.log("New Attack Target (Wall) " + JSON.stringify(wallTarget.roomObject.pos));
            targetFlag.setPosition(wallTarget.roomObject.pos);
            return {
                roomObject: wallTarget.roomObject,
                id: wallTarget.roomObject.id,
                type: "Wall"
            };
        }

        //Nothing was found as pathable
        ReportController.log("Nothing pathable in getAttackTarget");
        targetFlag.remove();
        return null;
    }

    public static endAttack(): void {

        const flagNames: string[] = Object.keys(Game.flags);
        for (let i = flagNames.length - 1; i >= 0; i--) {
            if (flagNames[i].includes("attack")) {
                const flag: Flag = Game.flags[flagNames[i]];
                flag.remove();
            }
        }


        const myRooms: MyRoom[] = Memory.myMemory.myRooms;
        for (let i: number = 0; i < myRooms.length; i++) {
            myRooms[i].pendingConscriptedCreep = false;
        }
    }

    public static getBody(myRoom: MyRoom): BodyPartConstant[] {
        const room: Room = Game.rooms[myRoom.name];

        return HelperFunctions.generateBody([MOVE, ATTACK],
            [MOVE, ATTACK],
            room,
            true,
            50,
            true
        );
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

}