import { GlobalFunctions } from "../../global/global.functions";

// tslint:disable-next-line: class-name
export class Stage3_6 {
    /*
    3.6 ->  4   : Room has a storage bank
    3.6 <-  4   : Room does not have a storage bank
    */
    public static up(myRoom: MyRoom, room: Room): boolean {
        this.step(myRoom, room);
        if (GlobalFunctions.amountOfStructure(room, STRUCTURE_STORAGE) >= 1) {
            myRoom.roomStage = 4;
            console.log("LOG: Room " + myRoom.name + " increased to room stage 4");
            return true;
        }
        return false;
    }

    public static down(myRoom: MyRoom, room: Room): boolean {
        if (GlobalFunctions.amountOfStructure(room, STRUCTURE_STORAGE) < 1) {
            myRoom.roomStage = 3.6;
            console.log("LOG: Room " + myRoom.name + " decreased to room stage 3.6");
            return true;
        }
        return false;
    }

    private static step(myRoom: MyRoom, room: Room): void {
        const storage: StructureStorage[] = room.find<StructureStorage>(FIND_STRUCTURES, {
            filter: (structure: Structure) => {
                return structure.structureType === STRUCTURE_STORAGE;
            }
        });
        if (storage.length === 1) {
            myRoom.bankPos = {
                x: storage[0].pos.x,
                y: storage[0].pos.y,
                roomName: myRoom.name
            };
            return;
        }
        const roomFlags: Flag[] = GlobalFunctions.getRoomsFlags(myRoom);
        for (let i = 0; i < roomFlags.length; i++) {
            const roomFlag: Flag = roomFlags[i];
            const flagNameSplit: string[] = roomFlag.name.split("-");
            if (flagNameSplit[0] === "storage") {
                const result: ScreepsReturnCode = Game.rooms[myRoom.name].createConstructionSite(roomFlag.pos, STRUCTURE_STORAGE);
                if (result === OK) {
                    console.log("LOG: Placed storage bank construction site");
                    roomFlag.remove();

                } else {
                    console.log("ERR: Placing a storage bank construction site errored");
                }
            }
        }
    }
}
