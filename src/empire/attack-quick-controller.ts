import {ReportController} from "../reporting/report-controller";
import {Constants} from "../global/constants";
import {HelperFunctions} from "../global/helper-functions";
import {AttackHelperFunctions} from "./attack-helper-functions";
import {RoleAttackCreep} from "./role/attack-creep";

export class AttackQuickController {
    public static run(myMemory: MyMemory, attackQuick: AttackQuick): void {
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
                    myMemory.empire.creeps.push(attackQuickCreep);
                    attackQuick.roomsStillToProvide.splice(i, 1);
                } // else room still to provide a creep
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
                ReportController.log("ERROR", "attack-quick-rally flag doesn't exist during AttackQuick. Cancelling the attack.");
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
            if (myMemory.empire.creeps.length === 0) {
                // Cancel attack when the creeps are dead
                console.log("ATTACK: Creeps are all dead, ending attack");
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
        return attackQuick;
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