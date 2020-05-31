export class LogHelper {
    public static logTable(table: string[][]): void {
        //If the table is missing things then it'll just break
        const maxColumnWidth: number[] = [];
        for (let columnIndex: number = 0; columnIndex < table[0].length; columnIndex++) {
            maxColumnWidth[columnIndex] = 0;
            for (let rowIndex: number = 0; rowIndex < table.length; rowIndex++) {
                const length: number = table[rowIndex][columnIndex].length;
                if (length > maxColumnWidth[columnIndex]) {
                    maxColumnWidth[columnIndex] = length + 1;
                }
            }
        }

        for (let rowIndex: number = 0; rowIndex < table.length; rowIndex++) {
            let rowAsString: string = "";
            for (let columnIndex: number = 0; columnIndex < table[rowIndex].length; columnIndex++) {
                const dataInCell: string = table[rowIndex][columnIndex];
                rowAsString += dataInCell;
                const spacesToAdd: number = maxColumnWidth[columnIndex] - dataInCell.length;
                for (let spacesToFill = 0; spacesToFill < spacesToAdd; spacesToFill++) {
                    rowAsString += " ";
                }
            }
            console.log(rowAsString);
        }
    }

    public static logPos(myRoomPos: MyRoomPos | RoomPosition): void {
        console.log("[room " + myRoomPos.roomName + " pos " + myRoomPos.x + "," + myRoomPos.y + "]");
    }

    public static roomNameAsLink(roomName: string): string {
        return "<a href='#!/room/shard3/" + roomName + "'>" + roomName + "</a>";
    }

    public static markTarget(pos: RoomPosition): void {
        if (pos.x === 49 ||
            pos.x === 0 ||
            pos.y === 0 ||
            pos.y === 49) {
            return;
        }

        new RoomVisual(pos.roomName).line(pos.x - 1, pos.y, pos.x + 1, pos.y, {color: "red"});
        new RoomVisual(pos.roomName).line(pos.x, pos.y - 1, pos.x, pos.y + 1, {color: "red"});
        new RoomVisual(pos.roomName).circle(pos.x, pos.y, {stroke: "red", fill: "transparent", radius: 0.5});
        new RoomVisual(pos.roomName).circle(pos.x, pos.y, {stroke: "red", fill: "transparent", radius: 1});

    }

    public static logScreepsReturnCode(screepsReturnCode: ScreepsReturnCode): string {
        switch (screepsReturnCode) {
            case OK:
                return "OK";
            case ERR_NOT_OWNER:
                return "ERR_NOT_OWNER";
            case ERR_NO_PATH:
                return "ERR_NO_PATH";
            case ERR_BUSY:
                return "ERR_BUSY";
            case ERR_NAME_EXISTS:
                return "ERR_NAME_EXISTS";
            case ERR_NOT_FOUND:
                return "ERR_NOT_FOUND";
            case ERR_NOT_ENOUGH_RESOURCES:
                return "ERR_NOT_ENOUGH_RESOURCES";
            case ERR_NOT_ENOUGH_ENERGY:
                return "ERR_NOT_ENOUGH_ENERGY";
            case ERR_INVALID_TARGET:
                return "ERR_INVALID_TARGET";
            case ERR_FULL:
                return "ERR_FULL";
            case ERR_NOT_IN_RANGE:
                return "ERR_NOT_IN_RANGE";
            case ERR_INVALID_ARGS:
                return "ERR_INVALID_ARGS";
            case ERR_TIRED:
                return "ERR_TIRED";
            case ERR_NO_BODYPART:
                return "ERR_NO_BODYPART";
            case ERR_NOT_ENOUGH_EXTENSIONS:
                return "ERR_NOT_ENOUGH_EXTENSIONS";
            case ERR_RCL_NOT_ENOUGH:
                return "ERR_RCL_NOT_ENOUGH";
            case ERR_GCL_NOT_ENOUGH:
                return "ERR_GCL_NOT_ENOUGH";
        }
    }
}