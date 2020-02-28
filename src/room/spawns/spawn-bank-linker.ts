import {SpawnQueueController} from "../../global/spawn-queue-controller";
import {SpawnConstants} from "../../global/spawn-constants";

export class SpawnBankLinker {
    public static run(myRoom: MyRoom): void {
        if (myRoom.roomStage < 5) {
            return;
        }
        if (myRoom.bankLinkerName != null) {
            return;
        }
        const bankLinker: BankLinker = this.spawnBankLinker(myRoom);
        myRoom.myCreeps.push(bankLinker);
        myRoom.bankLinkerName = bankLinker.name;
        console.log("LOG: Queued a BankLinker");
    }

    private static spawnBankLinker(myRoom: MyRoom): BankLinker {
        const name: string = "Creep" + Game.time;
        SpawnQueueController.queueCreepSpawn([MOVE, CARRY], myRoom, SpawnConstants.BANK_LINKER, name);

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
