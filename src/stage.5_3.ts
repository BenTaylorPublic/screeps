import { GlobalFunctions } from "./global.functions";

// tslint:disable-next-line: class-name
export class Stage5_3 {
    /*
    5.3 ->  5.5 : Room has extractor
    5.3 <-  5.5 : Room has no extractor
    */
    public static up(myRoom: MyRoom, room: Room): boolean {
        this.step(myRoom, room);
        if (GlobalFunctions.amountOfStructure(room, STRUCTURE_EXTRACTOR) >= 1) {
            myRoom.roomStage = 5.5;
            console.log("LOG: Room " + myRoom.name + " increased to room stage 5.5");
            return true;
        }
        return false;
    }

    public static down(myRoom: MyRoom, room: Room): boolean {
        if (GlobalFunctions.amountOfStructure(room, STRUCTURE_EXTRACTOR) < 1) {
            myRoom.roomStage = 5.3;
            console.log("LOG: Room " + myRoom.name + " decreased to room stage 5.3");
            return true;
        }
        return false;
    }

    private static step(myRoom: MyRoom, room: Room): void {
        let placedExtractor: boolean = false;
        const minerals: Mineral<MineralConstant>[] = room.find(FIND_MINERALS);
        if (minerals.length === 1) {
            const mineral: Mineral = minerals[0];
            const result: ScreepsReturnCode = mineral.pos.createConstructionSite(STRUCTURE_EXTRACTOR);
            if (result === OK) {
                placedExtractor = true;
            }
        }

        if (!placedExtractor &&
            room.find(FIND_CONSTRUCTION_SITES).length === 0) {
                console.log("ATTENTION: Room " + myRoom.name + " couldn't place an extractor");
            }
    }
}
