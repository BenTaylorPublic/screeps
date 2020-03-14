import {ReportController} from "../../reporting/report-controller";
import {LogHelper} from "./log-helper";
import {RoomHelper} from "./room-helper";

export class MovementHelper {
    public static myMoveTo(creep: Creep, moveTo: RoomPosition, myCreep: MyCreep): MoveByPathResult {
        if (creep.fatigue > 0) {
            return ERR_TIRED;
        }

        const currentCreepPos: MyRoomPos = RoomHelper.roomPosToMyPos(creep.pos);

        if (this.posMatches(moveTo, myCreep.roomMoveTarget.pos)) {
            //Same target
            if (!RoomHelper.posMatches2(myCreep.lastPos, currentCreepPos)) {
                myCreep.lastPos = currentCreepPos;
                return creep.moveByPath(myCreep.roomMoveTarget.path);
            } //Else, the creep didn't move last tick properly
        }
        //Different target to last tick, clear their lastPos
        myCreep.lastPos = currentCreepPos;

        //Calculate path again
        myCreep.roomMoveTarget.pos = RoomHelper.roomPosToMyPos(moveTo);
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
            creepMemory.interRoomTravelCurrentTarget = RoomHelper.roomPosToMyPos(target);
        }
        MovementHelper.myMoveTo(creep, RoomHelper.myPosToRoomPos(creepMemory.interRoomTravelCurrentTarget), creepMemory);
    }

    private static posMatches(pos: RoomPosition, myPos: MyRoomPos | null): boolean {
        return myPos != null &&
            pos.roomName === myPos.roomName &&
            pos.x === myPos.x &&
            pos.y === myPos.y;
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
                if (Memory.myMemory.empire.avoidRooms.includes(room2) &&
                    toRoomName !== room2) {
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