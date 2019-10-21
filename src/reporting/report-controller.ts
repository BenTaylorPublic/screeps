export class ReportController {
    public static log(messageType: ReportMessageType, message: string): void {
        const now: number = new Date().getTime();

        const report: Report = {
            timeStamp: now,
            messageType: messageType,
            message: message
        };

        Memory.myMemory.reports.push(report);
    }
}
