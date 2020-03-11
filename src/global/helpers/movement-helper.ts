import {ReportController} from "../../reporting/report-controller";
import {LogHelper} from "./log-helper";

export class MovementHelper {
    public static myMoveTo(creep: Creep, moveTo: RoomPosition, myCreep: MyCreep): MoveByPathResult {
        if (creep.fatigue > 0) {
            return ERR_TIRED;
        }

        const currentCreepPos: MyRoomPos = this.roomPosToMyPos(creep.pos);

        if (this.posMatches(moveTo, myCreep.roomMoveTarget.pos)) {
            //Same target
            if (!this.posMatches2(myCreep.lastPos, currentCreepPos)) {
                myCreep.lastPos = currentCreepPos;
                return creep.moveByPath(myCreep.roomMoveTarget.path);
            } //Else, the creep didn't move last tick properly
        }
        //Different target to last tick, clear their lastPos
        myCreep.lastPos = currentCreepPos;

        //Calculate path again
        myCreep.roomMoveTarget.pos = this.roomPosToMyPos(moveTo);
        myCreep.roomMoveTarget.path = creep.pos.findPathTo(moveTo,
            {
                costCallback(roomNamee: string, costMatrix: CostMatrix): boolean | CostMatrix {
                    if (roomNamee !== creep.room.name) {
                        return false;
                    }
                    MovementHelper.avoidEdges(costMatrix, creep.room);
                    return costMatrix;
                }
            });

        const result: MoveByPathResult = creep.moveByPath(myCreep.roomMoveTarget.path);
        return result;
    }

    public static getCreepToRoom(creep: Creep, creepMemory: MyCreep, roomName: string): void {
        if (creepMemory.interRoomTravelCurrentTarget == null ||
            creep.pos.roomName !== creepMemory.interRoomTravelCurrentTarget.roomName) {
            //Needs a new target
            const target: RoomPosition | null = this.getInterRoomTravelPathTarget(creep.pos, roomName);
            if (target == null) {
                return;
            }
            creepMemory.interRoomTravelCurrentTarget = this.roomPosToMyPos(target);
        }
        MovementHelper.myMoveTo(creep, this.myPosToRoomPos(creepMemory.interRoomTravelCurrentTarget), creepMemory);
    }

    public static roomPosToMyPos(roomPos: RoomPosition): MyRoomPos {
        return {
            x: roomPos.x,
            y: roomPos.y,
            roomName: roomPos.roomName
        };
    }

    public static myPosToRoomPos(myPos: MyRoomPos): RoomPosition {
        return new RoomPosition(myPos.x, myPos.y, myPos.roomName);
    }

    private static posMatches(pos: RoomPosition, myPos: MyRoomPos | null): boolean {
        return myPos != null &&
            pos.roomName === myPos.roomName &&
            pos.x === myPos.x &&
            pos.y === myPos.y;
    }

    private static posMatches2(myPos1: MyRoomPos | null | undefined, myPos2: MyRoomPos | null | undefined): boolean {
        return myPos1 != null &&
            myPos2 != null &&
            myPos1.roomName === myPos2.roomName &&
            myPos1.x === myPos2.x &&
            myPos1.y === myPos2.y;
    }

    private static avoidEdges(costMatrix: CostMatrix, room: Room): void {
        room.find(FIND_EXIT).forEach((exitPos: RoomPosition) => {
            costMatrix.set(exitPos.x, exitPos.y, Infinity);
        });
    }

    private static getInterRoomTravelPathTarget(currentPos: RoomPosition, toRoomName: string): RoomPosition | null {
        const fromRoomName: string = currentPos.roomName;
        const result1: FindRouteResult = Game.map.findRoute(fromRoomName, toRoomName, {
            routeCallback(room2: string, room1: string): number {
                if (Memory.myMemory.empire.avoidRooms.includes(room2)) {
                    // avoid this room
                    return Infinity;
                }
                return 1;
            }
        });
        if (result1 === ERR_NO_PATH) {
            ReportController.email("ERROR: getInterRoomTravelPath got ERRO_NO_PATH for " + LogHelper.roomNameAsLink(fromRoomName) + " to " + LogHelper.roomNameAsLink(toRoomName));
            return null;
        }
        if (result1.length <= 0) {
            ReportController.email("ERROR: getInterRoomTravelPath length <= 0 for " + LogHelper.roomNameAsLink(fromRoomName) + " to " + LogHelper.roomNameAsLink(toRoomName));
            return null;
        }


        const thisRoomsExits: RoomPosition[] = Game.rooms[fromRoomName].find(result1[0].exit);
        const result: RoomPosition = currentPos.findClosestByPath(thisRoomsExits) as RoomPosition;

        return result;
    }
}