import {ReportController} from "../../reporting/report-controller";
import {Constants} from "../../global/constants";
import {AttackHelperFunctions} from "./attack-helper-functions";
import {RoleAttackCreep} from "../role/attack-creep";
import {ScheduleController} from "../../schedule/schedule-controller";
import {SpawnQueueController} from "../../global/spawn-queue-controller";
import {SpawnConstants} from "../../global/spawn-constants";
import {CreepHelper} from "../../global/helpers/creep-helper";
import {LogHelper} from "../../global/helpers/log-helper";
import {RoomHelper} from "../../global/helpers/room-helper";
import {MapHelper} from "../../global/helpers/map-helper";

export class AttackQuickController {
    public static run(myMemory: MyMemory, attackQuick: AttackQuick): void {
        let flag: Flag | null = null;

        if (attackQuick.state === "Conscripting") {
            flag = Game.flags["attack-quick-rally"];
            if (flag == null) {
                ReportController.email("ERROR: attack-quick-rally flag doesn't exist during AttackQuick. Cancelling the attack.");
                this.endAttack();
                return;
            }

            //Wait until every room that's required to, has added a creep
            for (let i = attackQuick.roomsStillToProvide.length - 1; i >= 0; i--) {
                const myRoom: MyRoom = RoomHelper.getMyRoomByName(attackQuick.roomsStillToProvide[i]) as MyRoom;
                const attackQuickCreep: AttackQuickCreep = this.spawnAttackQuickCreep(myRoom, flag.pos.roomName);
                ReportController.log("" + LogHelper.roomNameAsLink(myRoom.name) + " has been conscripted " + attackQuickCreep.name + " for AttackQuick");

                ScheduleController.scheduleForNextTick("SET_FALSE_ON_PENDING_CONSCRIPTED_CREEP", myRoom.name);

                myMemory.empire.creeps.push(attackQuickCreep);
                attackQuick.roomsStillToProvide.splice(i, 1);
            }

            if (attackQuick.roomsStillToProvide.length === 0) {
                attackQuick.state = "Rally";
                return;
            }

            //Some rooms still need to provide a creep
        }

        if (attackQuick.state === "Rally") {
            flag = Game.flags["attack-quick-rally"];
            if (flag == null) {
                ReportController.email("ERROR: attack-quick-rally flag doesn't exist during AttackQuick. Cancelling the attack.");
                this.endAttack();
                return;
            }

            //Wait until all the creeps are within range of the rally flag
            let allCreepsAtFlag: boolean = true;
            for (let i = 0; i < myMemory.empire.creeps.length; i++) {
                const myCreep: MyCreep = myMemory.empire.creeps[i];
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
                ReportController.log("AttackQuick Charge");
                attackQuick.state = "Charge";

                //Setting their assigned room, to the room target
                const roomTagetFlag: Flag | null = Game.flags["attack-quick-room-target"];
                if (roomTagetFlag == null) {
                    ReportController.email("ERROR: attack-quick-room-target flag doesn't exist during AttackQuick. Cancelling the attack. (1)");
                    this.endAttack();
                    return;
                }
                for (let i = 0; i < myMemory.empire.creeps.length; i++) {
                    const myCreep: MyCreep = myMemory.empire.creeps[i];
                    if (myCreep.role !== "AttackQuickCreep") {
                        continue;
                    }
                    myCreep.assignedRoomName = roomTagetFlag.pos.roomName;
                }
            }
        }

        if (attackQuick.state === "Charge") {
            flag = Game.flags["attack-quick-room-target"];
            if (flag == null) {
                ReportController.email("ERROR: attack-quick-room-target flag doesn't exist during AttackQuick. Cancelling the attack. (2)");
                this.endAttack();
                return;
            }
            if (myMemory.empire.creeps.length === 0) {
                // Cancel attack when the creeps are dead
                ReportController.log("ATTACK: Creeps are all dead, ending attack");
                this.endAttack();
            }

            attackQuick.attackTarget = AttackHelperFunctions.getNewTargetIfNeeded(attackQuick.attackTarget, flag);
        }

        //Controlling creeps
        for (let i = 0; i < myMemory.empire.creeps.length; i++) {
            const attackQuickCreep: AttackQuickCreep = myMemory.empire.creeps[i];
            if (attackQuickCreep.role !== "AttackQuickCreep") {
                continue;
            }

            RoleAttackCreep.run(attackQuickCreep as AttackQuickCreep, attackQuick.state, flag as Flag, attackQuick.attackTarget);
        }

        if (attackQuick.attackTarget != null) {
            //Clear this so it doesn't have to be serialized
            delete attackQuick.attackTarget.roomObject;
        }
    }

    public static setupAttackQuick(myRooms: MyRoom[], rallyFlag: Flag): AttackQuick | null {
        //Need to work out the rooms

        const attackQuick: AttackQuick = {
            state: "Conscripting",
            roomsStillToProvide: [],
            attackTarget: null
        };

        let outputMessage: string = "";
        for (let i = 0; i < myRooms.length; i++) {
            const myRoom: MyRoom = myRooms[i];
            if (myRoom.roomStage >= Constants.CONSCRIPTION_QUICK_MINIMUM_STAGE
                && MapHelper.getRoomDistance(rallyFlag.pos.roomName, myRoom.name) < Constants.CONSCRIPTION_RANGE) {
                //This room will be conscripted
                myRoom.pendingConscriptedCreep = true;
                attackQuick.roomsStillToProvide.push(myRoom.name);
                outputMessage += LogHelper.roomNameAsLink(myRoom.name) + ", ";
            }
        }
        if (attackQuick.roomsStillToProvide.length === 0) {
            ReportController.log("Canceling an AttackQuick because no rooms were in conscription range.");
            this.endAttack();
            return null;
        }

        //Remove the ", " from the last one
        outputMessage = outputMessage.slice(0, outputMessage.length - 2);

        ReportController.log("AttackQuick: " + attackQuick.roomsStillToProvide.length +
            " Rooms conscripted for AttackQuick (" + outputMessage + ")");
        return attackQuick;
    }

    private static spawnAttackQuickCreep(myRoom: MyRoom, rallyRoomName: string): AttackQuickCreep {
        const name: string = CreepHelper.getName();
        SpawnQueueController.queueCreepSpawn(myRoom, SpawnConstants.ATTACK_QUICK, name, "AttackQuickCreep");

        return {
            name: name,
            role: "AttackQuickCreep",
            spawningStatus: "queued",
            assignedRoomName: rallyRoomName,
            roomMoveTarget: {
                pos: null,
                path: []
            }
        };
    }

    private static endAttack(): void {
        const empire: Empire = Memory.myMemory.empire;
        empire.attackQuick = null;

        for (let i = empire.creeps.length - 1; i >= 0; i--) {
            if (empire.creeps[i].role === "AttackQuickCreep") {
                ReportController.log("Killing AttackQuickCreep " + empire.creeps[i].name);
                Game.creeps[empire.creeps[i].name].suicide();
            }
        }
        AttackHelperFunctions.endAttack();
    }
}