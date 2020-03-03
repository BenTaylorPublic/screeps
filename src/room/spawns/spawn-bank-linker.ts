import {SpawnQueueController} from "../../global/spawn-queue-controller";
import {SpawnConstants} from "../../global/spawn-constants";
import {HelperFunctions} from "../../global/helper-functions";

export class SpawnBankLinker {
    public static spawnBankLinker(myRoom: MyRoom): void {
        if (myRoom.roomStage < 5) {
            return;
        }
        if (myRoom.bankLinkerName != null) {
            return;
        }
        const bankLinker: BankLinker = this.spawnBankLinkerInternal(myRoom);
        myRoom.myCreeps.push(bankLinker);
        myRoom.bankLinkerName = bankLinker.name;
        console.log("LOG: Queued a BankLinker");
    }

    public static getBody(): BodyPartConstant[] {
        return [MOVE, CARRY];
    }

    private static spawnBankLinkerInternal(myRoom: MyRoom): BankLinker {
        const name: string = "Creep" + HelperFunctions.getId();
        SpawnQueueController.queueCreepSpawn(this.getBody(), myRoom, SpawnConstants.BANK_LINKER, name, "BankLinker");

        return {
            name: name,
            role: "BankLinker",
            assignedRoomName: myRoom.name,
            spawningStatus: "queued",
            roomMoveTarget: {
                pos: null,
                path: []
            }
        };
    }
}
