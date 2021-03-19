import {Constants} from "../../global/constants/constants";
import {ReportController} from "../../reporting/report-controller";
import {AttackHelperFunctions} from "./attack-helper-functions";
import {RoleAttackCreep} from "../role/attack-creep";
import {SpawnQueueController} from "../../global/spawn-queue-controller";
import {SpawnConstants} from "../../global/constants/spawn-constants";
import {MapHelper} from "../../global/helpers/map-helper";
import {LogHelper} from "../../global/helpers/log-helper";
import {RoomHelper} from "../../global/helpers/room-helper";
import {CreepHelper} from "../../global/helpers/creep-helper";

export class AttackPressureController {
    public static run(myMemory: MyMemory, attackPressure: AttackPressure): void {
        let updatedTarget: boolean = false;

        //Controlling creeps
        const attackPressureCreeps: AttackPressureCreep[] = [];
        for (let i = 0; i < myMemory.empire.creeps.length; i++) {
            const creep: MyCreep = myMemory.empire.creeps[i];
            if (creep.role !== "AttackPressureCreep") {
                continue;
            }
            attackPressureCreeps.push(creep as AttackPressureCreep);
        }

        for (let i: number = attackPressure.batches.length - 1; i >= 0; i--) {
            let flag: Flag | null = null;
            const batch: AttackPressureBatch = attackPressure.batches[i];
            if (batch.state === "Conscripting") {
                flag = Game.flags["attack-pressure-rally"];
                if (flag == null) {
                    ReportController.email("ERROR: attack-pressure-rally flag doesn't exist during AttackPressure. Cancelling the attack.");
                    this.endAttack();
                    return;
                }
                this.batchRunConscript(batch, myMemory.empire, flag.pos.roomName);
            }
            if (batch.state === "Rally") {
                flag = Game.flags["attack-pressure-rally"];
                if (flag == null) {
                    ReportController.email("ERROR: attack-pressure-rally flag doesn't exist during AttackPressure. Cancelling the attack.");
                    this.endAttack();
                    return;
                }
                const charging: boolean = this.batchRunRally(batch, flag, myMemory.empire);
                if (charging) {
                    //Start the next batch
                    this.startBatch(attackPressure);
                }
            }
            if (batch.state === "Charge") {
                flag = Game.flags["attack-pressure-room-target"];
                if (flag == null) {
                    ReportController.email("ERROR: attack-pressure-room-target flag doesn't exist during AttackPressure. Cancelling the attack. (1)");
                    this.endAttack();
                    return;
                }
                if (!updatedTarget) {
                    updatedTarget = true;
                    attackPressure.attackTarget = AttackHelperFunctions.getNewTargetIfNeeded(attackPressure.attackTarget, flag);
                }
            }

            for (let j: number = 0; j < attackPressureCreeps.length; j++) {
                if (attackPressureCreeps[j].batchNumber === batch.batchNumber) {
                    RoleAttackCreep.run(attackPressureCreeps[j], batch.state, flag as Flag, attackPressure.attackTarget);
                }
            }
        }


        if (attackPressure.attackTarget != null) {
            //Clear this so it doesn't have to be serialized
            //@ts-ignore:
            delete attackPressure.attackTarget.roomObject;
        }

    }

    public static setupAttackPressure(myRooms: MyRoom[], rallyFlag: Flag): AttackPressure | null {
        //Need to work out the rooms

        const attackPressure: AttackPressure = {
            batchesStarted: 0,
            batches: [],
            roomsInRange: [],
            attackTarget: null
        };

        let outputMessage: string = "";
        for (let i = 0; i < myRooms.length; i++) {
            const myRoom: MyRoom = myRooms[i];
            if (myRoom.roomStage >= Constants.CONSCRIPTION_PRESSURE_MINIMUM_STAGE
                && MapHelper.getRoomDistance(rallyFlag.pos.roomName, myRoom.name) < Constants.CONSCRIPTION_RANGE) {
                //This room will be conscripted
                attackPressure.roomsInRange.push(myRoom.name);
                outputMessage += LogHelper.roomNameAsLink(myRoom.name) + ", ";
            }
        }
        if (attackPressure.roomsInRange.length === 0) {
            ReportController.log("Canceling an AttackPressure because no rooms were in conscription range.");
            this.endAttack();
            return null;
        }

        //Remove the ", " from the last one
        outputMessage = outputMessage.slice(0, outputMessage.length - 2);

        ReportController.log("AttackPressure: " + attackPressure.roomsInRange.length + " Rooms conscripted for AttackPressure (" + outputMessage + ")");

        this.startBatch(attackPressure);

        return attackPressure;
    }

    private static batchRunRally(batch: AttackPressureBatch, flag: Flag, empire: Empire): boolean {

        //Wait until all the creeps are within range of the rally flag
        let allCreepsAtFlag: boolean = true;
        for (let i = 0; i < empire.creeps.length; i++) {
            const myCreep: MyCreep = empire.creeps[i];
            if (myCreep.role !== "AttackPressureCreep" ||
                (myCreep as AttackPressureCreep).batchNumber !== batch.batchNumber) {
                continue;
            }
            const creep: Creep = Game.creeps[myCreep.name];
            if (creep == null ||
                !creep.pos.inRangeTo(flag.pos, Constants.RALLY_FLAG_RANGE)) {
                //Not in range
                allCreepsAtFlag = false;
                break;
            }
        }
        if (allCreepsAtFlag) {
            if (Game.flags["attack-hold"] != null) {
                return false;
            }

            //If it gets here, we're ready to charge!
            ReportController.log("AttackPressure Charge");
            batch.state = "Charge";
            const roomTagetFlag: Flag | null = Game.flags["attack-pressure-room-target"];
            if (roomTagetFlag == null) {
                ReportController.email("ERROR: attack-pressure-room-target flag doesn't exist during AttackPressure. Cancelling the attack. (2)");
                this.endAttack();
                return false;
            }
            for (let i = 0; i < empire.creeps.length; i++) {
                const myCreep: MyCreep = empire.creeps[i];
                if (myCreep.role !== "AttackPressureCreep" ||
                    (myCreep as AttackPressureCreep).batchNumber !== batch.batchNumber) {
                    continue;
                }
                myCreep.assignedRoomName = roomTagetFlag.pos.roomName;
            }

            return true;
        }
        return false;
    }

    private static batchRunConscript(batch: AttackPressureBatch, empire: Empire, rallyRoomName: string): void {
        //Wait until every room that's required to, has added a creep
        for (let i = batch.roomsStillToProvide.length - 1; i >= 0; i--) {
            const myRoom: MyRoom = RoomHelper.getMyRoomByName(batch.roomsStillToProvide[i]) as MyRoom;
            const attackPressureCreep: AttackPressureCreep = this.spawnAttackPressureCreep(myRoom, batch.batchNumber, rallyRoomName);
            ReportController.log("" + LogHelper.roomNameAsLink(myRoom.name) + " has been conscripted " + attackPressureCreep.name + " for AttackPressure");

            empire.creeps.push(attackPressureCreep);
            batch.roomsStillToProvide.splice(i, 1);
        }

        if (batch.roomsStillToProvide.length === 0) {
            batch.state = "Rally";
            return;
        }

        //Some rooms still need to provide a creep
    }

    private static spawnAttackPressureCreep(myRoom: MyRoom, batchNumber: number, rallyRoomName: string): AttackPressureCreep {

        const name: string = CreepHelper.getName();
        SpawnQueueController.queueCreepSpawn(myRoom, SpawnConstants.ATTACK_PRESSURE, name, "AttackPressureCreep");

        return {
            name: name,
            role: "AttackPressureCreep",
            spawningStatus: "queued",
            assignedRoomName: rallyRoomName,
            roomMoveTarget: {
                pos: null,
                path: []
            },
            batchNumber: batchNumber
        };

    }

    private static startBatch(attackPressure: AttackPressure): void {
        attackPressure.batches.push({
            state: "Conscripting",
            batchNumber: attackPressure.batchesStarted,
            roomsStillToProvide: attackPressure.roomsInRange
        });

        ReportController.log("Conscripting for batch " + attackPressure.batchesStarted);
        attackPressure.batchesStarted++;
    }

    private static endAttack(): void {
        const empire: Empire = Memory.myMemory.empire;
        empire.attackPressure = null;

        for (let i = empire.creeps.length - 1; i >= 0; i--) {
            if (empire.creeps[i].role === "AttackPressureCreep") {
                const creep: Creep = Game.creeps[empire.creeps[i].name];
                if (creep != null) {
                    ReportController.log("Killing AttackPressureCreep " + empire.creeps[i].name);
                    Game.creeps[empire.creeps[i].name].suicide();
                }
            }
        }

        AttackHelperFunctions.endAttack();
    }
}