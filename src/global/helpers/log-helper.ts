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

    public static roomNameAsLink(roomName: string): string {
        return "<a href='#!/room/shard3/" + roomName + "'>" + roomName + "</a>";
    }
}