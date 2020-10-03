import {SpawnQueueController} from "../../global/spawn-queue-controller";
import {SpawnConstants} from "../../global/constants/spawn-constants";
import {CreepHelper} from "../../global/helpers/creep-helper";

export class SpawnBankLinker {
    public static spawnBankLinker(myRoom: MyRoom): void {
        if (myRoom.roomStage < 5) {
            return;
        }
        if ((myRoom.bank as Bank).bankLinkerName != null) {
            return;
        }
        const bankLinker: BankLinker = this.spawnBankLinkerInternal(myRoom);
        myRoom.myCreeps.push(bankLinker);
        (myRoom.bank as Bank).bankLinkerName = bankLinker.name;
    }

    public static getBody(): BodyPartConstant[] {
        return [MOVE, CARRY, CARRY];
    }

    private static spawnBankLinkerInternal(myRoom: MyRoom): BankLinker {
        const name: string = CreepHelper.getName();
        SpawnQueueController.queueCreepSpawn(myRoom, SpawnConstants.BANK_LINKER, name, "BankLinker");

        return {
            name: name,
            role: "BankLinker",
            assignedRoomName: myRoom.name,
            spawningStatus: "queued",
            roomMoveTarget: {
                pos: null,
                path: []
            },
            inPos: false,
            state: "Default"
        };
    }
}
