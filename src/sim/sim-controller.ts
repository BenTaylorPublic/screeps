export class SimController {
    public static run(): void {
        const creepNames: string[] = Object.keys(Game.creeps);
        const creep: Creep | null = Game.creeps[creepNames[0]];
        if (creep == null) {
            //Wait
            return;
        }
        if (this.findClosestFlag(creep)) {
            creep.say("⚔️Spawn");
            return;
        }
        console.log("Couldn't get path to that");
    }

    //Returns true if found a target
    private static findClosestFlag(creep: Creep): boolean {

        const flags: Flag[] = [];
        const flagNames: string[] = Object.keys(Game.flags);
        for (let i = 0; i < flagNames.length; i++) {
            const flag: Flag = Game.flags[flagNames[i]];
            if (flag.room != null &&
                flag.room.name === "sim") {
                flags.push(flag);
            }
        }

        let closestFlag: Flag | null = null;
        let closestFlagDistance: number = 999;
        for (let i: number = flags.length - 1; i >= 0; i--) {
            const pathResult: PathFinderPath = PathFinder.search(creep.pos, {
                pos: flags[i].pos,
                range: 0
            });
            if (pathResult.incomplete) {
                //No path
                console.log("No path");
                flags.splice(i, 1);
                //COULD USE pathResult.cost
            } else if (pathResult.path.length < closestFlagDistance) {
                closestFlag = flags[i];
                closestFlagDistance = pathResult.path.length;
            }
        }

        if (closestFlag != null) {
            this.attackTarget(creep, closestFlag);
            return true;
        }
        return false;
    }

    private static attackTarget(creep: Creep, target: Flag): void {
        if (creep.pos.inRangeTo(target.pos, 1)) {
            console.log("ARRIVED");
        } else {
            creep.moveTo(target);
        }
    }
}