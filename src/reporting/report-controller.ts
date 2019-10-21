export class ReportController {
    public static report(messageType: ReportMessageType, roomName: string, message: string): void {
        const now: number = new Date().getTime();

        const report: Report = {
            roomName: roomName,
            timeStamp: now,
            messageType: messageType,
            message: message
        };

        Memory.myMemory.reports.push(report);
    }
}
