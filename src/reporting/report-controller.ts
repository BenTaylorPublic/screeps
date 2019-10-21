export class ReportController {

    public static checkForReportFlag(): void {
        if (Game.time % 10 !== 0) {
            //Only run every 10 ticks
            return;
        }

        const flagNames: string[] = Object.keys(Game.flags);
        for (let i = 0; i < flagNames.length; i++) {
            if (flagNames[i] === "report") {
                const flag: Flag = Game.flags[flagNames[i]];
                flag.remove();
                this.report();
                //Do not continue through the rest of the flags
                return;
            }
        }
    }

    public static log(messageType: ReportMessageType, message: string): void {
        const now: number = new Date().getTime();

        const report: Report = {
            timeStamp: now,
            tick: Game.time,
            messageType: messageType,
            message: message
        };

        Memory.myMemory.reports.push(report);
    }

    private static report(): void {
        console.log("BEGIN REPORT:");
        for (let i = 0; i < Memory.myMemory.reports.length; i++) {
            const report: Report = Memory.myMemory.reports[i];
            const reportTime: Date = new Date(report.timeStamp);
            let outputString: string = this.niceDateFormat(reportTime);
            outputString += "(" + this.timeSince(reportTime) + "s) ";
            outputString += "tick " + report.tick + " ";
            outputString += report.messageType + ": ";
            outputString += report.message;
            console.log(outputString);
        }
        console.log("END OF REPORT");
    }

    private static niceDateFormat(date: Date): string {
        return (date.getMonth() + 1) + "-" + date.getDate() + " " +
            date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
    }

    private static timeSince(date: Date): string {

        let secondsLeft: number = Math.floor((new Date().getTime() - date.getTime()) / 1000);

        let result: string = "";

        if (secondsLeft >= 604800) {
            const weeks: number = secondsLeft % 604800;
            secondsLeft -= weeks * 604800;
            result += weeks + "W, ";
        }

        if (secondsLeft >= 86400) {
            const days: number = secondsLeft % 86400;
            secondsLeft -= days * 86400;
            result += days + "D, ";
        }

        if (secondsLeft >= 3600) {
            const hours: number = secondsLeft % 3600;
            secondsLeft -= hours * 3600;
            result += hours + "H, ";
        }

        if (secondsLeft >= 60) {
            const minutes: number = secondsLeft % 60;
            secondsLeft -= minutes * 60;
            result += minutes + "M, ";
        }

        if (secondsLeft >= 0) {
            result += secondsLeft + "S";
        }

        result += " ago";

        return result;
    }
}