export class ScavengeController {

    public static run(myMemory: MyMemory): void {
        if (Game.time % 10 !== 0) {
            return;
        }

        const flagNames: string[] = Object.keys(Game.flags);
        for (let i = flagNames.length - 1; i >= 0; i--) {
            const flagName: string = flagNames[i];
            const flagNameSplit: string[] = flagName.split("-");
            if (flagNameSplit[0] !== "scavenge") {
                flagNames.splice(i, 1);
            }
        }

        if (flagNames.length !== 1) {
            return;
        }
        const flag: Flag = Game.flags[flagNames[0]];
        const size: number = Number(flag.name.split("-")[1]);

    }

}