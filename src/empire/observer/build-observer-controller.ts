import {HelperFunctions} from "../../global/helper-functions";

export class BuildObserverController {
    public static run(myMemory: MyMemory): void {
        if (Game.time % 10 !== 0) {
            return;
        }

        this.makeSureAllInMemory(myMemory);

        const flag: Flag | null = Game.flags["observer"];
        if (flag == null) {
            return;
        }

        //Otherwise, make one
        const result: ScreepsReturnCode = flag.pos.createConstructionSite(STRUCTURE_OBSERVER);
        if (result === OK) {
            flag.remove();
        } else {
            console.log("ERROR: Failed to place observer: " + result);
        }
    }

    private static makeSureAllInMemory(myMemory: MyMemory): void {

        let amountOfObservers: number = 0;
        for (let i = 0; i < myMemory.myRooms.length; i++) {
            amountOfObservers += HelperFunctions.amountOfStructure(Game.rooms[myMemory.myRooms[i].name], STRUCTURE_OBSERVER);
        }
        if (amountOfObservers === myMemory.empire.observer.observerIds.length) {
            return;
        }

        //Some need to be added
        myMemory.empire.observer.observerIds = [];
        for (let i = 0; i < myMemory.myRooms.length; i++) {
            const room: Room = Game.rooms[myMemory.myRooms[i].name];

            const observers: StructureObserver[] = room.find<StructureObserver>(FIND_STRUCTURES, {
                filter: (structure: Structure) => {
                    return structure.structureType === STRUCTURE_OBSERVER;
                }
            });

            for (let j = 0; j < observers.length; j++) {
                myMemory.empire.observer.observerIds.push(observers[j].id);
            }
        }
    }
}