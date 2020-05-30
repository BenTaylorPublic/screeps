export class RoomNukerController {
    public static run(myRoom: MyRoom, room: Room): void {
        this.determineNukerStatus(myRoom, room);
    }

    private static determineNukerStatus(myRoom: MyRoom, room: Room): void {
        if (Game.time % 100 !== 0) {
            return;
        }

        const nukers: StructureNuker[] = room.find<StructureNuker>(FIND_MY_STRUCTURES, {
            filter(structure: AnyStructure): boolean {
                return structure.structureType === STRUCTURE_NUKER;
            }
        });

        if (nukers.length !== 1) {
            myRoom.nukerStatus = null;
            return;
        }
        const nuker: StructureNuker = nukers[0];
        if (nuker.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
            myRoom.nukerStatus = "NeedsEnergy";
            return;
        }
        if (nuker.store.getFreeCapacity(RESOURCE_GHODIUM) > 0) {
            myRoom.nukerStatus = "NeedsG";
            return;
        }
        myRoom.nukerStatus = "Full";
    }
}