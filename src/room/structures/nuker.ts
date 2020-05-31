import {FlagHelper} from "../../global/helpers/flag-helper";
import {ReportController} from "../../reporting/report-controller";
import {LogHelper} from "../../global/helpers/log-helper";

export class RoomNukerController {
    public static run(myRoom: MyRoom, room: Room): void {
        this.determineNukerStatus(myRoom, room);
    }

    public static checkForNukeLaunchFlags(myRooms: MyRoom[]): void {
        if (Game.time % 10 !== 0 &&
            Game.flags["nuke-hold"] != null) {
            return;
        }
        const nukeTargets: Flag[] = FlagHelper.getFlags3(["nuke", "launch"]);
        if (nukeTargets.length === 0) {
            return;
        }

        //Okay so there are some targets, and we're hopefully going to launch a nuke! :D
        const readyNukers: StructureNuker[] = [];

        for (let i = 0; i < myRooms.length; i++) {
            const myRoom: MyRoom = myRooms[i];
            if (myRoom.nukerStatus !== "Full") {
                continue;
            }
            const room: Room = Game.rooms[myRoom.name];
            const nuker: StructureNuker | null = this.getNuker(room);
            if (nuker == null ||
                nuker.store.getFreeCapacity(RESOURCE_ENERGY) !== 0 ||
                nuker.store.getFreeCapacity(RESOURCE_GHODIUM) !== 0 ||
                (nuker.cooldown != null &&
                    nuker.cooldown >= 1)) {
                continue;
            }

            readyNukers.push(nuker);
        }

        if (nukeTargets.length > readyNukers.length) {
            ReportController.log("Nuking aborted: Too many nukeTargets (" + nukeTargets.length +
                ") for the amount of loaded ready nukers (" + readyNukers.length + ")");
            return;
        }

        //I guess I need to find a combination of nukers to target...
        //Too hard basket
        //I'll just attempt the first ones, and give up if it doesn't work

        const nukerWithTargetArray: NukerWithTarget[] = [];
        for (let i: number = 0; i < nukeTargets.length; i++) {
            const target: Flag = nukeTargets[i];
            let foundNuker: boolean = false;
            for (let j: number = 0; j < readyNukers.length; j++) {
                const nuker: StructureNuker = readyNukers[i];

                let nukerBeenTakenByPreviousTarget: boolean = false;
                for (let k: number = 0; k < nukerWithTargetArray.length; k++) {
                    if (nukerWithTargetArray[k].nuker.id === nuker.id) {
                        nukerBeenTakenByPreviousTarget = true;
                    }
                }

                if (!nukerBeenTakenByPreviousTarget) {
                    //This target will take it
                    nukerWithTargetArray.push({
                        target: target,
                        nuker: nuker
                    });
                    foundNuker = true;
                    break;
                }

            }

            if (!foundNuker) {
                /*
                We can't nuke this target
                I don't want to nuke just some of my targets
                So it's better to log and return
                If this does occur, it might mean I need to rewrite this logic to try all possibilities
                But I'm so lazy, so... no :D
                */
                ReportController.log("Nuking aborted: Wasn't able to find a nuker for target " + LogHelper.logPos(target.pos) + " in room " + LogHelper.roomNameAsLink(target.pos.roomName));
                return;
            }
        }

        if (nukerWithTargetArray.length !== nukeTargets.length) {
            ReportController.log("Nuking aborted: nukerWithTargetArray.length !== nukeTargets.length, " + nukerWithTargetArray.length + " !== " + nukeTargets.length);
            return;
        }

        /*
        Should be good!
        Lets light these fuses
         */
        for (let i: number = 0; i < nukerWithTargetArray.length; i++) {
            const nukerWithTarget: NukerWithTarget = nukerWithTargetArray[i];
            const targetPos: RoomPosition = nukerWithTarget.target.pos;
            //So we don't launch 2+ nukes...
            nukerWithTarget.target.remove();
            const result: ScreepsReturnCode = nukerWithTarget.nuker.launchNuke(targetPos);
            if (result !== OK) {
                ReportController.log("Bad nuke launch result " + LogHelper.logScreepsReturnCode(result));
            } else {
                ReportController.log("Nuke launch: Succesfully launched nuke for " + LogHelper.logPos(targetPos) + " in room " + LogHelper.roomNameAsLink(targetPos.roomName));
            }
        }
    }

    private static determineNukerStatus(myRoom: MyRoom, room: Room): void {
        if (Game.time % 100 !== 0) {
            return;
        }

        const nukers: StructureNuker[] = room.find<StructureNuker>(FIND_MY_STRUCTURES, {
            filter(structure: AnyStructure): boolean {
                return structure.structureType === STRUCTURE_NUKER;
            }
        });

        if (nukers.length !== 1) {
            myRoom.nukerStatus = null;
            return;
        }
        const nuker: StructureNuker = nukers[0];
        if (nuker.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
            myRoom.nukerStatus = "NeedsEnergy";
            return;
        }
        if (nuker.store.getFreeCapacity(RESOURCE_GHODIUM) > 0) {
            myRoom.nukerStatus = "NeedsG";
            return;
        }
        if (myRoom.nukerStatus !== "Full") {
            ReportController.email("Nuker in " + LogHelper.roomNameAsLink(myRoom.name) + " is now full");
        }
        myRoom.nukerStatus = "Full";
    }

    private static getNuker(room: Room): StructureNuker | null {
        const nukers: StructureNuker[] = room.find<StructureNuker>(FIND_MY_STRUCTURES, {
            filter(structure: AnyStructure): boolean {
                return structure.structureType === STRUCTURE_NUKER;
            }
        });

        if (nukers.length !== 1) {
            return null;
        }
        return nukers[0];
    }
}
