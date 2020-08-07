export class FlagHelper {
    public static getFlag1(nameArray: string[], roomName: string): Flag | null {
        const flagNames: string[] = Object.keys(Game.flags);
        for (let i = 0; i < flagNames.length; i++) {
            const flag: Flag = Game.flags[flagNames[i]];
            if (flag.pos.roomName !== roomName) {
                continue;
            }

            const flagNameSplit: string[] = flag.name.split("-");
            if (flagNameSplit.length < nameArray.length) {
                continue;
            }
            let noMatch: boolean = false;
            for (let j = 0; j < nameArray.length; j++) {
                if (flagNameSplit[j] !== nameArray[j]) {
                    noMatch = true;
                    break;
                }
            }
            if (noMatch) {
                continue;
            }
            return flag;
        }
        return null;
    }

    public static getFlags1(nameArray: string[], roomName: string): Flag[] {
        const result: Flag[] = [];
        const flagNames: string[] = Object.keys(Game.flags);
        for (let i = 0; i < flagNames.length; i++) {
            const flag: Flag = Game.flags[flagNames[i]];
            if (flag.pos.roomName !== roomName) {
                continue;
            }

            const flagNameSplit: string[] = flag.name.split("-");
            if (flagNameSplit.length < nameArray.length) {
                continue;
            }
            let noMatch: boolean = false;
            for (let j = 0; j < nameArray.length; j++) {
                if (flagNameSplit[j] !== nameArray[j]) {
                    noMatch = true;
                    break;
                }
            }
            if (noMatch) {
                continue;
            }
            result.push(flag);
        }
        return result;
    }

    public static getFlags2(nameArray: string[], roomName: string, numberUpToInclusive: number): Flag[] {
        const result: Flag[] = [];
        const flagNames: string[] = Object.keys(Game.flags);
        for (let i = 0; i < flagNames.length; i++) {
            const flag: Flag = Game.flags[flagNames[i]];
            if (flag.pos.roomName !== roomName) {
                continue;
            }

            const flagNameSplit: string[] = flag.name.split("-");
            if (flagNameSplit.length < nameArray.length) {
                continue;
            }
            let j: number = 0;
            let noMatch: boolean = false;
            for (; j < nameArray.length; j++) {
                if (flagNameSplit[j] !== nameArray[j]) {
                    noMatch = true;
                    break;
                }
            }
            if (noMatch) {
                continue;
            }
            const number: number = Number(flagNameSplit[j]);
            if (number > numberUpToInclusive) {
                continue;
            }
            result.push(flag);
        }
        return result;
    }

    public static getFlags3(nameArray: string[]): Flag[] {
        const result: Flag[] = [];
        const flagNames: string[] = Object.keys(Game.flags);
        for (let i = 0; i < flagNames.length; i++) {
            const flag: Flag = Game.flags[flagNames[i]];

            const flagNameSplit: string[] = flag.name.split("-");
            if (flagNameSplit.length < nameArray.length) {
                continue;
            }
            let noMatch: boolean = false;
            for (let j = 0; j < nameArray.length; j++) {
                if (flagNameSplit[j] !== nameArray[j]) {
                    noMatch = true;
                    break;
                }
            }
            if (noMatch) {
                continue;
            }
            result.push(flag);
        }
        return result;
    }

}