export class SimController {
    public static run(): void {
        const creep: Creep | null = Game.creeps["Creep"];
        if (creep == null) {
            //Wait
            return;
        }
        const foundPath: boolean = this.findClosestFlag(creep);
        if (foundPath === true) {
            console.log("pathing");
            return;
        }
        console.log("no path!");
    }

    //Returns true if found a target
    private static findClosestFlag(creep: Creep): boolean {

        const flag: Flag = Game.flags["Flag"];
        const pathFinderResult: PathFinderPath = PathFinder.search(creep.pos, {pos: flag.pos, range: 0});

        if (pathFinderResult.incomplete) {
            return false;
        }

        if (creep.pos.inRangeTo(flag.pos, 0)) {
            creep.say("ARRIVED");
        } else {
            creep.moveTo(flag.pos);
            creep.say("MOVING");
        }
        return true;
    }
}