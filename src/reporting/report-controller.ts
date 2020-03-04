export class ReportController {

    public static log(message: string, email: boolean = false, cooldown: number = 0): void {
        console.log(message);

        if (email) {
            if (Memory.myMemory.reports[message] == null) {
                //Set it
                if (cooldown > 0) {
                    Memory.myMemory.reports[message] = new Date().getTime() + cooldown;
                }
            } else {
                if (new Date().getTime() < Memory.myMemory.reports[message]) {
                    //Return so it doesn't send email
                    return;
                }
                delete Memory.myMemory.reports[message];
            }
            //Send it
            Game.notify(Game.time + ": " + message);
        }
    }

    //@ts-ignore
    private static niceDateFormat(date: Date): string {
        const localDate: Date = new Date(date.toLocaleString("en-US", {timeZone: "Australia/Melbourne"}));
        return (localDate.getMonth() + 1) + "-" + localDate.getDate() + " " +
            localDate.getHours() + ":" + localDate.getMinutes() + ":" + localDate.getSeconds();
    }

    //@ts-ignore
    private static timeSince(date: Date): string {

        let secondsLeft: number = Math.floor((new Date().getTime() - date.getTime()) / 1000);

        let result: string = "";

        if (secondsLeft >= 604800) {
            const weeks: number = Math.floor(secondsLeft / 604800);
            secondsLeft -= weeks * 604800;
            result += weeks + "w, ";
        }

        if (secondsLeft >= 86400) {
            const days: number = Math.floor(secondsLeft / 86400);
            secondsLeft -= days * 86400;
            result += days + "d, ";
        }

        if (secondsLeft >= 3600) {
            const hours: number = Math.floor(secondsLeft / 3600);
            secondsLeft -= hours * 3600;
            result += hours + "h, ";
        }

        if (secondsLeft >= 60) {
            const minutes: number = Math.floor(secondsLeft / 60);
            secondsLeft -= minutes * 60;
            result += minutes + "m, ";
        }

        if (secondsLeft >= 0) {
            result += secondsLeft + "s";
        }

        result += " ago";

        return result;
    }
}
