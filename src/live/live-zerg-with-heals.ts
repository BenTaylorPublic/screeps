export class LiveZergWithHeals {
    public static run(): void {
        const flagNames: string[] = Object.keys(Game.flags);
        for (let i = 0; i < flagNames.length; i++) {
            const flag: Flag = Game.flags[flagNames[i]];
            if (flag.name !== "live-zergwithheals-rally") {
                continue;
            }

            //TODO: Start a zergwithheals war

            //Do not continue through the rest of the flags
            return;
        }
    }
}
