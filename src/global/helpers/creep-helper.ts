import {MovementHelper} from "./movement-helper";
import {FlagHelper} from "./flag-helper";

export class CreepHelper {

    public static getName(): string {
        const toReturn: string = "c" + Memory.myMemory.globalId;
        Memory.myMemory.globalId++;
        return toReturn;
    }

    public static generateBody(
        baseBody: BodyPartConstant[],
        bodyPartsToAdd: BodyPartConstant[],
        room: Room,
        useBest: boolean,
        maxBodySize: number = 50,
        fillWithTough: boolean = false
    ): BodyPartConstant[] {

        const maxEnergyToUse: number =
            (useBest) ?
                room.energyCapacityAvailable :
                room.energyAvailable;


        let body: BodyPartConstant[] = baseBody;
        while (true) {
            if (this.bodyCost(body) + this.bodyCost(bodyPartsToAdd) <= maxEnergyToUse &&
                body.length + bodyPartsToAdd.length <= maxBodySize) {
                body = body.concat(bodyPartsToAdd);
            } else {
                break;
            }
        }

        if (fillWithTough) {
            const toughtPart: BodyPartConstant[] = [TOUGH];
            while (true) {
                if (this.bodyCost(body) + this.bodyCost(toughtPart) <= maxEnergyToUse &&
                    body.length + 1 <= maxBodySize) {
                    body = toughtPart.concat(body);
                } else {
                    break;
                }
            }
        }

        return body;
    }

    public static handleCreepPreRole(myCreep: MyCreep): boolean {
        if (this.creepQueuedOrSpawning(myCreep)) {
            return true;
        }

        if (myCreep.assignedRoomName !== Game.creeps[myCreep.name].room.name) {
            Game.creeps[myCreep.name].say("Traveling");
            MovementHelper.getCreepToRoom(Game.creeps[myCreep.name], myCreep, myCreep.assignedRoomName);
            return true;
        }
        return false;
    }

    public static creepQueuedOrSpawning(myCreep: MyCreep): boolean {
        if (myCreep.spawningStatus === "alive") {
            return false;
        } else if (myCreep.spawningStatus === "queued" &&
            Game.creeps[myCreep.name] != null) {
            myCreep.spawningStatus = "spawning";
            return true;
        } else if (myCreep.spawningStatus === "spawning" &&
            Game.creeps[myCreep.name].ticksToLive != null) {
            myCreep.spawningStatus = "alive";
            Game.creeps[myCreep.name].notifyWhenAttacked(this.creepShouldNotifyWhenAttacked(myCreep));
            if (myCreep.role === "Miner") {
                const creep: Creep = Game.creeps[myCreep.name];
                let workCount = 0;
                for (let i: number = 0; i < creep.body.length; i++) {
                    if (creep.body[i].type === WORK) {
                        workCount++;
                    }
                }
                (myCreep as Miner).amountOfWork = workCount;
            }
            return false;
        }
        return true;
    }

    public static bodyCost(body: BodyPartConstant[]): number {
        return body.reduce(function (cost: number, part: BodyPartConstant): number {
            return cost + BODYPART_COST[part];
        }, 0);
    }

    public static creepContainsBodyPart(creep: Creep, bodyPart: BodyPartConstant): boolean {
        for (let i = 0; i < creep.body.length; i++) {
            const currentBodyPart: BodyPartDefinition = creep.body[i];
            if (currentBodyPart.type === bodyPart) {
                return true;
            }
        }
        return false;
    }

    public static creepContainsBodyParts(creep: Creep, bodyParts: BodyPartConstant[]): boolean {
        for (let i = 0; i < creep.body.length; i++) {
            const currentBodyPart: BodyPartDefinition = creep.body[i];
            for (let j = 0; j < bodyParts.length; j++) {
                if (currentBodyPart.type === bodyParts[j]) {
                    return true;
                }
            }
        }
        return false;
    }

    public static creepThreatLevel(creep: Creep): number {
        if (creep.owner.username === "Invader") {
            return 0;
        }

        const badBodyParts: BodyPartToThreatLevel[] = [
            {
                bodyPart: CLAIM,
                threat: 1
            },
            {
                bodyPart: ATTACK,
                threat: 5
            },
            {
                bodyPart: RANGED_ATTACK,
                threat: 5
            },
            {
                bodyPart: HEAL,
                threat: 5
            }
        ];

        let result: number = 0;
        for (const creepBodyPart of creep.body) {
            for (const badBodyPart of badBodyParts) {
                if (creepBodyPart.type === badBodyPart.bodyPart) {
                    result += badBodyPart.threat;
                }
            }
        }
        return result;
    }

    private static creepShouldNotifyWhenAttacked(myCreep: MyCreep): boolean {
        const ignoreCreepsForRooms: Flag[] = FlagHelper.getFlags3(["no", "attack", "notify"]);
        for (let i: number = 0; i < ignoreCreepsForRooms.length; i++) {
            if (myCreep.assignedRoomName === ignoreCreepsForRooms[i].pos.roomName) {
                return false;
            }
        }
        const creepRolesThatShouldNotNotify: CreepRoles[] = ["PowerBankHealCreep", "PowerBankAttackCreep", "Scavenger"];
        return !creepRolesThatShouldNotNotify.includes(myCreep.role);
    }
}