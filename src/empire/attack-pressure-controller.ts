import {Constants} from "../global/constants";
import {ReportController} from "../reporting/report-controller";
import {HelperFunctions} from "../global/helper-functions";
import {AttackHelperFunctions} from "./attack-helper-functions";
import {RoleAttackCreep} from "./role/attack-creep";

export class AttackPressureController {
    public static run(attackPressure: AttackPressure): void {
        let updatedTarget: boolean = false;

        //Controlling creeps
        const myMemory: MyMemory = Memory.myMemory;
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
                    ReportController.log("ERROR", "attack-pressure-rally flag doesn't exist during AttackPressure. Cancelling the attack.");
                    this.endAttack();
                    return;
                }
                this.batchRunConscript((batch));
            }
            if (batch.state === "Rally") {
                flag = Game.flags["attack-pressure-rally"];
                if (flag == null) {
                    ReportController.log("ERROR", "attack-pressure-rally flag doesn't exist during AttackPressure. Cancelling the attack.");
                    this.endAttack();
                    return;
                }
                const charging: boolean = this.batchRunRally(batch, flag);
                if (charging) {
                    //Start the next batch
                    this.startBatch(attackPressure);
                }
            }
            if (batch.state === "Charge") {
                flag = Game.flags["attack-pressure-room-target"];
                if (flag == null) {
                    ReportController.log("ERROR", "attack-pressure-room-target flag doesn't exist during AttackPressure. Cancelling the attack.");
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
            delete attackPressure.attackTarget.roomObject;
        }

    }

    public static setupAttackPressure(rallyFlag: Flag): AttackPressure | null {
        //Need to work out the rooms

        const attackPressure: AttackPressure = {
            batchesStarted: 0,
            batches: [],
            roomsInRange: [],
            attackTarget: null
        };

        let outputMessage: string = "";
        for (let i = 0; i < Memory.myMemory.myRooms.length; i++) {
            const myRoom: MyRoom = Memory.myMemory.myRooms[i];
            if (myRoom.roomStage >= Constants.CONSCRIPTION_PRESSURE_MINIMUM_STAGE
                && Game.map.getRoomLinearDistance(rallyFlag.pos.roomName, myRoom.name) < Constants.CONSCRIPTION_RANGE) {
                //This room will be conscripted
                attackPressure.roomsInRange.push(myRoom);
                outputMessage += myRoom.name + ", ";
            }
        }
        if (attackPressure.roomsInRange.length === 0) {
            console.log("LOG: Canceling an AttackPressure because no rooms were in conscription range.");
            this.endAttack();
            return null;
        }

        //Remove the ", " from the last one
        outputMessage = outputMessage.slice(0, outputMessage.length - 2);

        console.log("AttackPressure: " + attackPressure.roomsInRange.length +
            " Rooms conscripted for AttackPressure (" + outputMessage + ")");

        this.startBatch(attackPressure);

        Memory.myMemory.empire.attackPressure = attackPressure;
        return attackPressure;
    }

    private static batchRunRally(batch: AttackPressureBatch, flag: Flag): boolean {

        //Wait until all the creeps are within range of the rally flag
        let allCreepsAtFlag: boolean = true;
        for (let i = 0; i < Memory.myMemory.empire.creeps.length; i++) {
            const myCreep: MyCreep = Memory.myMemory.empire.creeps[i];
            if (myCreep.role !== "AttackPressureCreep") {
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
            console.log("LOG: AttackPressure Charge");
            batch.state = "Charge";
            return true;
        }
        return false;
    }

    private static batchRunConscript(batch: AttackPressureBatch): void {
        //Wait until every room that's required to, has added a creep
        for (let i = batch.roomsStillToProvide.length - 1; i >= 0; i--) {
            const myRoom: MyRoom = batch.roomsStillToProvide[i];
            const attackPressureCreep: AttackPressureCreep | null = this.spawnAttackPressureCreep(myRoom, batch.batchNumber);
            if (attackPressureCreep != null) {
                console.log("LOG: " + myRoom.name + " has been conscripted " + attackPressureCreep.name + " for AttackPressure");
                Memory.myMemory.empire.creeps.push(attackPressureCreep);
                batch.roomsStillToProvide.splice(i, 1);
            } // else room still to provide a creep
        }

        if (batch.roomsStillToProvide.length === 0) {
            batch.state = "Rally";
            return;
        }

        //Some rooms still need to provide a creep
    }

    private static spawnAttackPressureCreep(myRoom: MyRoom, batchNumber: number): AttackPressureCreep | null {
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
                            role: "AttackPressureCreep",
                            assignedRoomName: ""
                        }
                }
            );

        if (result === OK) {
            return {
                name: "Creep" + id,
                role: "AttackPressureCreep",
                assignedRoomName: "",
                batchNumber: batchNumber
            };
        }
        return null;
    }

    private static startBatch(attackPressure: AttackPressure): void {
        attackPressure.batches.push({
            state: "Conscripting",
            batchNumber: attackPressure.batchesStarted,
            roomsStillToProvide: attackPressure.roomsInRange
        });
        console.log("Conscripting for batch " + attackPressure.batchesStarted);
        attackPressure.batchesStarted++;
    }

    private static endAttack(): void {
        const empire: Empire = Memory.myMemory.empire;
        empire.attackPressure = null;

        for (let i = empire.creeps.length - 1; i >= 0; i--) {
            if (empire.creeps[i].role === "AttackPressureCreep") {
                console.log("LOG: Killing AttackPressureCreep " + empire.creeps[i].name);
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