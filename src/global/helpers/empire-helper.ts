export class EmpireHelper {
    public static isAllyUsername(username: string): boolean {
        return ["james1652"].indexOf(username.toLowerCase()) !== -1;
    }
}