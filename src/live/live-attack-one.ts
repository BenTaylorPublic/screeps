import {Constants} from "../global/constants";
import {HelperFunctions} from "../global/helper-functions";

export class LiveAttackOne {
    public static run(): void {
        const flagNames: string[] = Object.keys(Game.flags);
        let flag: Flag | null = null;
        for (let i = 0; i < flagNames.length; i++) {
            flag = Game.flags[flagNames[i]];
            if (flag.name !== "live-attack-one-rally") {
                continue;
            }
            //Do not continue through the rest of the flags
            break;
        }

        if (flag == null) {
            return;
        }

        let attackOne: AttackOne = Memory.myMemory.empire.attackOne;
        if (attackOne == null) {
            //Need to work out the rooms
            attackOne = {
                state: "Conscripting",
                roomsStillToProvide: [],
                creeps: []
            };

            for (let i = 0; i < Memory.myMemory.rooms.length; i++) {
                const myRoom: MyRoom = Memory.myMemory.rooms[i];
                if (Game.map.getRoomLinearDistance(flag.pos.roomName, myRoom.name)
                    < Constants.CONSCRIPTION_RANGE) {
                    //This room will be conscripted
                    attackOne.roomsStillToProvide.push(myRoom);
                    console.log("LOG: " + myRoom + " has been conscripted for AttackOne");
                }
            }
        }

        if (attackOne.state === "Conscripting") {
            //Wait until every room that's required to, has added a creep
            for (let i = attackOne.roomsStillToProvide.length - 1; i >= 0; i--) {
                const myRoom: MyRoom = attackOne.roomsStillToProvide[i];
                const attackOneCreep: AttackOneCreep | null = this.spawnAttackOneCreep(myRoom);
                if (attackOneCreep == null) {
                    //Room still to provide a creep
                } else {
                    console.log("LOG: " + myRoom + " has been conscripted " + attackOneCreep.name + " for AttackOne");
                    attackOne.creeps.push(attackOneCreep);
                    attackOne.roomsStillToProvide.splice(i, 1);
                }
            }

            if (attackOne.roomsStillToProvide.length === 0) {
                attackOne.state = "Rally";
            }
            return;
        }

        if (attackOne.state === "Rally") {
            //Wait until all the creeps are within range of the rally flag
            for (let i = 0; i < attackOne.creeps.length; i++) {
                const creep: Creep = Game.creeps[attackOne.creeps[i].name];
                if (!creep.pos.inRangeTo(flag.pos, Constants.RALLY_FLAG_RANGE)) {
                    //Not in range, returning
                    return;
                }
            }
            //If it gets here, we're ready to charge!
            attackOne.state = "Charge";
        }

        if (attackOne.state === "Charge") {
            //TODO: Remove the flag when the creeps are dead I guess?
        }
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
                10
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
}
