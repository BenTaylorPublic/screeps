import {Memory} from "../global/memory";

export class ReportController {

    public static log(messageType: ReportMessageType, message: string): void {
        console.log(messageType + ": " + message);

        // const now: number = new Date().getTime();

        // const report: Report = {
        //     timeStamp: now,
        //     tick: Game.time,
        //     messageType: messageType,
        //     message: message
        // };

        // Memory.myMemory.report.reports.push(report);
    }

    // @ts-ignore TODO
    private static report(): string {
        let result: string = "BEGIN REPORT:\n";
        const lastReportTime: Date = new Date(Memory.myMemory.report.lastReportTimeStamp);
        result += "Last report: " + this.niceDateFormat(lastReportTime) + "(" + this.timeSince(lastReportTime) + ")\n";
        for (let i = 0; i < Memory.myMemory.report.reports.length; i++) {
            const report: Report = Memory.myMemory.report.reports[i];
            const reportTime: Date = new Date(report.timeStamp);
            let outputString: string = this.niceDateFormat(reportTime);
            outputString += " (" + this.timeSince(reportTime) + ") ";
            outputString += "tick " + report.tick + " ";
            outputString += report.messageType + ": ";
            outputString += report.message;
            result += outputString + "\n";
        }
        result += "END OF REPORT";
        Memory.myMemory.report = {
            reports: [],
            lastReportTimeStamp: new Date().getTime()
        };
        return result;
    }

    private static niceDateFormat(date: Date): string {
        const localDate: Date = new Date(date.toLocaleString("en-US", {timeZone: "Australia/Melbourne"}));
        return (localDate.getMonth() + 1) + "-" + localDate.getDate() + " " +
            localDate.getHours() + ":" + localDate.getMinutes() + ":" + localDate.getSeconds();
    }

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
