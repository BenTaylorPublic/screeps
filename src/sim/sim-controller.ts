export class SimController {
    public static run(): void {
        const creepNames: string[] = Object.keys(Game.creeps);
        const creep: Creep | null = Game.creeps[creepNames[0]];
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

        const flag: Flag = Game.flags["Flag1"];
        const path: PathStep[] = creep.pos.findPathTo(flag.pos);

        if (!path.length) {
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