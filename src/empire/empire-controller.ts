import {RoleClaimer} from "./role/claimer";
import {SpawnClaimerController} from "./spawn-claimer-controller";
import {AttackController} from "./attack/attack-controller";
import {BuildObserverController} from "./observer/build-observer-controller";
import {ObserverController} from "./observer/observer-controller";
import {PowerScavController} from "./power-scav-controller";
import {RolePowerScavHaulCreep} from "./role/power-scav-haul-creep";
import {SignController} from "./sign/sign-controller";
import {ScavengeController} from "./scavenge-controller";
import {RoleScavenger} from "./role/scavenger";
import {RoomHelper} from "../global/helpers/room-helper";
import {ReportController} from "../reporting/report-controller";
import {LogHelper} from "../global/helpers/log-helper";

export class EmpireController {
    public static run(myMemory: MyMemory): void {
        this.oddThousandLogic(myMemory);
        this.resetSpawnLogic();
        SpawnClaimerController.run(myMemory);
        AttackController.run(myMemory);

        BuildObserverController.run(myMemory);
        ObserverController.run(myMemory);
        SignController.run(myMemory);

        PowerScavController.run(myMemory);
        ScavengeController.run(myMemory);

        //Controlling claimers and power scav haulers
        for (let i = 0; i < myMemory.empire.creeps.length; i++) {
            const creep: MyCreep = myMemory.empire.creeps[i];
            if (creep.role === "Claimer") {
                RoleClaimer.run(creep as Claimer);
            } else if (creep.role === "Scavenger") {
                RoleScavenger.run(creep as Scavenger);
            } else if (creep.role === "PowerScavHaulCreep") {
                RolePowerScavHaulCreep.run(creep as PowerScavHaulCreep);
            } else if (creep.role === "Signer") {
                SignController.runCreep(creep as Signer);
            }
        }
    }

    private static oddThousandLogic(myMemory: MyMemory): void {
        if (Game.time % 1000 === 0) {
            myMemory.empire.oddThousand = !myMemory.empire.oddThousand;
        }
    }

    private static resetSpawnLogic(): void {
        if (Game.time % 100 !== 0 ||
            Game.flags["reset-spawn"] == null) {
            return;
        }

        const flag: Flag = Game.flags["reset-spawn"];
        const myRoom: MyRoom | null = RoomHelper.getMyRoomByName(flag.pos.roomName);
        flag.remove();
        if (myRoom == null) {
            return;
        }

        myRoom.myCreeps = [];
        myRoom.bankLinkerName = null;
        myRoom.spawnQueue = [];
        for (let i = 0; i < myRoom.mySources.length; i++) {
            const mySource: MySource = myRoom.mySources[i];
            mySource.minerName = null;
            mySource.haulerNames = [];
        }
        ReportController.log("Reset spawn for " + LogHelper.roomNameAsLink(myRoom.name));
    }
}
