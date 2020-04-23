import {ReportController} from "../../reporting/report-controller";
import {CreepHelper} from "../../global/helpers/creep-helper";
import {LogHelper} from "../../global/helpers/log-helper";

export class AttackHelperFunctions {
    public static getNewTargetIfNeeded(attackTarget: AttackTarget | null, flagToPathFrom: Flag): AttackTarget | null {
        if (flagToPathFrom.room == null) {
            return null;
        }
        const attackPrioFlag: Flag | null = Game.flags["attack-prio"];
        if (attackPrioFlag != null) {
            attackTarget = this.attackPrio(attackPrioFlag);
        }
        if (attackTarget != null) {
            const roomObject: RoomObject | null = Game.getObjectById<RoomObject>(attackTarget.id);
            if (roomObject == null ||
                Game.time % 10 === 0) {
                //No longer exists, or recalculating ever 10
                //Get a new target
                attackTarget = this.getAttackTarget(flagToPathFrom);
            } else {
                attackTarget.roomObject = roomObject as Creep | Structure<StructureConstant>;
            }
        } else {
            attackTarget = this.getAttackTarget(flagToPathFrom);
        }
        return attackTarget;
    }


    public static endAttack(): void {

        const flagNames: string[] = Object.keys(Game.flags);
        for (let i = flagNames.length - 1; i >= 0; i--) {
            if (flagNames[i].includes("attack")) {
                const flag: Flag = Game.flags[flagNames[i]];
                flag.remove();
            }
        }
    }

    public static getBody(myRoom: MyRoom): BodyPartConstant[] {
        const room: Room = Game.rooms[myRoom.name];

        return CreepHelper.generateBody([MOVE, ATTACK],
            [MOVE, ATTACK],
            room,
            true,
            50,
            true
        );
    }

    private static getAttackTarget(flagToPathFrom: Flag): AttackTarget | null {
        const flagPos: RoomPosition = flagToPathFrom.pos;
        const room: Room = flagToPathFrom.room as Room;
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
            LogHelper.markTarget(spawnTarget.roomObject.pos);
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
            LogHelper.markTarget(towerTarget.roomObject.pos);
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
            LogHelper.markTarget(creepTarget.roomObject.pos);
            return {
                roomObject: creepTarget.roomObject,
                id: creepTarget.roomObject.id,
                type: "Creep"
            };
        }

        //EXTENSIONS
        const extensions: AnyStructure[] = room.find(FIND_STRUCTURES, {
            filter: (structure: Structure) => {
                return structure.structureType === STRUCTURE_EXTENSION;
            }
        });
        const extensionTarget: BestPathFindRoomObjectResult<AnyStructure> | null
            = this.pathFindToRoomObject(flagPos, extensions, costMatrix);

        if (extensionTarget != null) {
            //Attacking a extension
            ReportController.log("New Attack Target (Extension) " + JSON.stringify(extensionTarget.roomObject.pos));
            LogHelper.markTarget(extensionTarget.roomObject.pos);
            return {
                roomObject: extensionTarget.roomObject,
                id: extensionTarget.roomObject.id,
                type: "Extension"
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
            LogHelper.markTarget(rampartTarget.roomObject.pos);
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
            LogHelper.markTarget(wallTarget.roomObject.pos);
            return {
                roomObject: wallTarget.roomObject,
                id: wallTarget.roomObject.id,
                type: "Wall"
            };
        }

        //Nothing was found as pathable
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

    private static attackPrio(attackPrioFlag: Flag): AttackTarget | null {
        const structures: Structure<StructureConstant>[] = attackPrioFlag.pos.lookFor(LOOK_STRUCTURES);
        LogHelper.markTarget(attackPrioFlag.pos);
        attackPrioFlag.remove();
        if (structures.length === 0) {
            return null;
        }
        let structureType: string = structures[0].structureType;
        if (structureType === "constructedWall") {
            structureType = "Wall";
        }
        return {
            roomObject: structures[0],
            id: structures[0].id,
            type: structureType
        };
    }

}