export class LiveAttackOne {
    public static run(): void {
        const flagNames: string[] = Object.keys(Game.flags);
        for (let i = 0; i < flagNames.length; i++) {
            const flag: Flag = Game.flags[flagNames[i]];
            if (flag.name !== "live-attack-one-rally") {
                continue;
            }

            //TODO: Start an attack-one war

            //Do not continue through the rest of the flags
            return;
        }
    }
}
